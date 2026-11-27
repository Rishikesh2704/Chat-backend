import { Router } from "express";
import { audioCallController, getCallLogsController } from "../controllers/call.controllers.js";
import { verifyToken } from "../middlewares/verifyToken.js";


export const callRouter =  Router();

callRouter.post('/:userId', verifyToken, audioCallController);
callRouter.get('/getCalls/:userId', verifyToken, getCallLogsController)