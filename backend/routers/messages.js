import { Router } from "express";
import { getUsersController, getMessagesController, sendMessagesController, deleteMessageController } from "../controllers/messages.controller.js";
import { upload } from "../middlewares/multer.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const messagesRouter = Router();

messagesRouter.get('/users', verifyToken , getUsersController)
messagesRouter.get('/:userId/:skipDocuments', verifyToken, getMessagesController)
messagesRouter.get('/:messageId', verifyToken, deleteMessageController)

messagesRouter.post('/sendMessage/:userId', [verifyToken, upload.single('image')], sendMessagesController)

export default messagesRouter