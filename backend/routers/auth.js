import { Router } from "express";
import { loginContoller, logOutController, signUpController, refreshTokenController } from "../controllers/auth.controllers.js";

const authRouter = Router();

authRouter.post('/signup', signUpController )
authRouter.post('/login', loginContoller )
authRouter.get('/logout', logOutController)
authRouter.post('/refresh', refreshTokenController)

export default authRouter