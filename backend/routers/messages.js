import { Router } from "express";
import { verifyToken } from "../utils/verifyToken.js";
import { getUsersController, getMessagesController, sendMessagesController, deleteMessageController } from "../controllers/messages.controller.js";

const messagesRouter = Router();

messagesRouter.get('/users', verifyToken , getUsersController)
messagesRouter.get('/:userId/:skipDocuments', verifyToken, getMessagesController)
messagesRouter.get('/:messageId', verifyToken, deleteMessageController)

messagesRouter.post('/sendMessage/:userId', verifyToken, sendMessagesController)

export default messagesRouter