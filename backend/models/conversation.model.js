import mongoose from "mongoose";
import { User } from "./user.model.js";
import { messageModel } from "./messages.model.js";

const conversationSchema = new mongoose.Schema(
  {
    paticipants: {
      type: [
        {
          type: {
            id: mongoose.Types.ObjectId,
            username: String,
            profile: String,
          },
          ref: User,
        },
      ],
      required:true,
    },
    lastMessage:{
        type:{
            message:String,
            senderId:mongoose.Types.ObjectId,
            updatedAt:String,
        },
        ref:messageModel
    }
  },
  {
    timestamps: true,
  },
);

export const Conversation = new mongoose.model("Conversation",conversationSchema);