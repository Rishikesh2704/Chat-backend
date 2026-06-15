import { Router } from "express";
import { verifyToken } from "../utils/verifyToken.js";
import { getUsersController, getMessagesController, sendMessagesController } from "../controllers/messages.controller.js";

const messagesRouter = Router();

messagesRouter.get('/users', verifyToken , getUsersController)
messagesRouter.get('/:userId', verifyToken, getMessagesController)

messagesRouter.post('/sendMessage/:userId', verifyToken, sendMessagesController)

export default messagesRouter