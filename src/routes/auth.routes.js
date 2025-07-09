import { Router } from "express";
import { userLogin,  registerUser }  from "../controllers/user.controller.js";

const router = Router();

router.route('/login').post(userLogin);
router.route('/register').post(registerUser);

export default router;