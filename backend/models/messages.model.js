import mongoose from "mongoose";
import { User } from "./user.model.js";

const messagesSchema = new mongoose.Schema(
  {
    SenderId: {
      type: mongoose.Types.ObjectId,
      ref: User,
      required: true,
    },
    ReceiverId: {
      type: mongoose.Types.ObjectId,
      ref: User,
      required: true,
    },
    text: {
      type: String,
    },
    seen:{
      type:Boolean,
    },
    image: {
      type: String,
      default:""
    },
    
  },
  {
    timestamps: true,
  },
);

export const messageModel = new mongoose.model("Messages", messagesSchema);
