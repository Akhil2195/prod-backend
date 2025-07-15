import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import User from "../models/User.model.js";
import fs from 'fs';
import path, { extname as _extname } from "path";
import { uploadFiletoS3 , getFileFromS3 , getBucketFiles , getPaginatedFilesFromS3, deleteImageFroms3} from '../utils/amazon.services.js';

const generateAccessAndRefereshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating referesh and access token"
    );
  }
};

const userLogin = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  console.log(`email`, email);
  console.log(`password`, password);
  const user = await User.findOne({ email });
  console.log(`user`, user);
  if (!user) {
    throw new ApiError(401, "Invalid user credentials");
  }
  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }
  const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200, 
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged In Successfully"
        )
    )
});

const registerUser = asyncHandler( async (req, res, next) => {
    const { name, email, password, role } = req.body;
    let profileImage;
    if(req.file) {
      const filePath = path.resolve(`public/temp/${req.file.filename}`);
      const folder = 'user';
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const fileName = `${uniqueSuffix}${_extname(req.file.originalname)}`;
      const key = `${folder}/${fileName}`;
      const file = req.file;
        const fileUploaded = await uploadFiletoS3(file, key);
        if(fileUploaded.$metadata.httpStatusCode === 200) {
          profileImage = key;
        }
    } else {
      return res.status(400).json(new ApiError(400, "Image is required"));
    }

    if (
        [name, email, password, role].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

     const existedUser = await User.findOne({
        $or: [{ name }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }

    // handle image later

    const addUser = await User.insertOne({
        name,
        email,
        password,
        profileImage,
        role,
    });
    if(!addUser._id) {
        new ApiError(500, "Something went wrong while adding user");
    }

    return res.status(201).json(
        new ApiResponse(200, addUser, "User Registered successfully")
    )
});

const userList = asyncHandler(async (req,res,next) => {
  try {
    const users = await User.find();
    for (let user of users) {
      if(user.profileImage) {
        user.profileImage =  await getFileFromS3(user.profileImage);
      }
    }
    return res.status(200).json(new ApiResponse(200, users, "Users fetched successfully"))
  } catch(err) {
    return res.status(500).json(new ApiError(500, err, "Something went wrong"))
  }
});

export {
    userLogin,
    registerUser,
    userList,
}