import { Router } from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import { addMemberController, createGroupController, groupMessagesController } from "../controllers/group.controller.js";
import { upload } from "../middlewares/multer.js";

const groupRouter = Router();

groupRouter.post('/createGroup', verifyToken, createGroupController );
groupRouter.post('/addMember', verifyToken, addMemberController)
groupRouter.post('/:groupId/message', [verifyToken, upload.single('image')], groupMessagesController)

export default groupRouter;