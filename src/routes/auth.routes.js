import { Router } from "express";
import { userLogin,  registerUser, userList }  from "../controllers/user.controller.js";
import upload from "../utils/fileUpload.js";

const router = Router();

router.route('/login').post(userLogin);
router.route('/register').post(upload.single('profile'),registerUser);
router.route('/users').post(userList);

export default router;