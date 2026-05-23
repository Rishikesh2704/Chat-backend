import { Router } from "express";
import { loginContoller, logOutController, signUpController, refreshTokenController } from "../controllers/auth.controllers.js";

const authRouter = Router();

authRouter.post('/signup', signUpController )
authRouter.post('/login', loginContoller )
authRouter.get('/refresh', refreshTokenController)
authRouter.get('/logout', logOutController)

export default authRouter