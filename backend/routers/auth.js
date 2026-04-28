import { Router } from "express";
import { loginContoller, logOutController, signUpController } from "../controllers/authControllers.js";

const authRouter = Router();

authRouter.post('/signup', signUpController )
authRouter.post('/login', loginContoller )
authRouter.post('/logout', logOutController)

export default authRouter