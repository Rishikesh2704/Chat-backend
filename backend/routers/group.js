import { Router } from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import { addMemberController, createGroupController } from "../controllers/group.controller.js";

const groupRouter = Router();

groupRouter.post('/createGroup', verifyToken, createGroupController );
groupRouter.post('/addMember',  addMemberController)

export default groupRouter;