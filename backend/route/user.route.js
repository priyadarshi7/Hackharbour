import express from 'express';
import { getUserInfo, loginUser,registerUser } from '../controller/user.controller.js';
const userRouter = express.Router();

userRouter.post("/register",registerUser);
userRouter.post("/login",loginUser);
userRouter.get("/:userId", getUserInfo);

export default userRouter;