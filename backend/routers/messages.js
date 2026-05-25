import { Router } from "express";
import { verifyToken } from "../utils/verifyToken.js";
import { getUsersController, privateMessagesController, sendMessagesController } from "../controllers/messages.controller.js";

const messagesRouter = Router();

messagesRouter.get('/users', verifyToken , getUsersController)
messagesRouter.get('/:userId', verifyToken, privateMessagesController)

messagesRouter.post('/sendMessage/:userId', verifyToken, sendMessagesController)

export default messagesRouter