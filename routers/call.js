import { Router } from "express";
import { audioCallController } from "../controllers/call.controllers.js";
import { verifyToken } from "../middlewares/verifyToken.js";


export const callRouter =  Router();

callRouter.post('/:userId', verifyToken, audioCallController);