import { Router } from "express";
import { loginContoller, logOutController, signUpController, refreshTokenController, uploadProfileController } from "../controllers/auth.controllers.js";
import { upload } from "../middlewares/multer.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const authRouter = Router();

authRouter.post('/signup', signUpController )
authRouter.post('/login', loginContoller )
authRouter.get('/refresh', refreshTokenController)
authRouter.get('/logout', logOutController)

authRouter.post('/uploadProfile', [verifyToken, upload.single('profile')], uploadProfileController)



export default authRouter   