// This is used for getting user input.
import { createInterface } from "node:readline/promises";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import path from "path";
import fs from "fs";
import {
  S3Client,
  PutObjectCommand,
  CreateBucketCommand,
  DeleteObjectCommand,
  DeleteBucketCommand,
  paginateListObjectsV2,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { configDotenv } from "dotenv";
configDotenv();

const s3Client = new S3Client({
  region: process.env.AWS_REGION, // Specify the AWS region from environment variables
  credentials: {
    accessKeyId: process.env.AWS_ACCESSKEYID, // Access key ID from environment variables
    secretAccessKey: process.env.AWS_SECRETACCESSKEY, // Secret access key from environment variables
  },
});

const createBucket = async (bucketName) => {
  try {
    const command = new CreateBucketCommand({
      Bucket: bucketName,
    });
    const response = await s3Client.send(command);
    return response;
  } catch (err) {
    console.log(`error in creating bucket`, err);
    return err;
  }
};

const deleteBucket = async(bucketName) => {
  try {
    const command = new DeleteBucketCommand({
      Bucket: bucketName,
    });
    const response = await s3Client.send(command);
    return response;
  } catch (err) {
    console.log(`error in deleting bucket`, err);
    return err;
  }
}

const getImageUrl = async (key) => {
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
    });
    const url = await getSignedUrl(s3Client, command);
    return url;
  } catch (err) {
    console.log(`error in getting file from s3`, err);
    throw err;
  }
};

const uploadFiletoS3 = async (filePath, key) => {
  try {
    const fileStream = fs.createReadStream(filePath);
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      Body: fileStream,
    });
    const response = await s3Client.send(command);

    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error("Error deleting file:", err);
        } else {
          console.log("File deleted successfully.");
        }
      });
    }
    return response;
  } catch (err) {
    console.log(`error in uploading file to s3`, err);
    // throw err;
    return err;
  }
};

const getFileFromS3 = async (key) => {
  try {
    const mimeTypes = {
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        pdf: 'application/pdf',
        txt: 'text/plain',
    // add more...
    };
    const ext = key.split('.').pop();
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      ResponseContentType: mimeTypes[ext] || 'application/octet-stream',
      ResponseContentDisposition: "inline",
    });
    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    console.log(`response`, url);
    return url;
  } catch (err) {
    console.log(`error in getting file from s3`, err);
    return err;
  }
};

const getBucketFiles = async () => {
  try {
    const paginatorConfig = {
      client: s3Client,
    };

    const commandParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Prefix: "", // Optional folder path like "user-uploads/",
      MaxKeys: 2,
    };

    const paginator = paginateListObjectsV2(paginatorConfig, commandParams);

    const allKeys = [];

    for await (const page of paginator) {
      if (page.Contents) {
        for (const item of page.Contents) {
          allKeys.push(item.Key);
        }
      }
    }
    console.log(`allKeys`, allKeys);
    return allKeys;
  } catch (err) {
    console.log(`error in getting file from s3`, err);
    return err;
  }
};

const getPaginatedFilesFromS3 = async (prefix = "", page = 1, limit = 10) => {
  const startIndex = (page - 1) * limit;
  const maxKeysPerPage = 2;

  const paginator = paginateListObjectsV2(
    { client: s3Client },
    {
      Bucket: process.env.AWS_BUCKET_NAME,
      Prefix: prefix,
      MaxKeys: maxKeysPerPage,
    }
  );

  const files = [];
  let currentIndex = 0;

  for await (const pageData of paginator) {
    if (!pageData.Contents) continue;

    for (const file of pageData.Contents) {
      if (currentIndex >= startIndex && files.length < limit) {
        files.push({
          key: file.Key,
          lastModified: file.LastModified,
          size: file.Size,
        });
      }
      currentIndex++;

      if (files.length === limit) break;
    }

    if (files.length === limit) break;
  }

  return files;
};

const deleteImageFroms3 = async (key) => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
    });
    const response = await s3Client.send(command);
    return response;
  } catch (err) {
    console.log(`error in deleting file from s3`, err);
    throw err;
  }
};

export {
  uploadFiletoS3,
  getFileFromS3,
  getImageUrl,
  getBucketFiles,
  getPaginatedFilesFromS3,
  deleteImageFroms3,
  createBucket,
  deleteBucket,
};
