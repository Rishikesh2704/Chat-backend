import mongoose from "mongoose";
import { User } from "./user.model.js";
import { Conversations } from "./conversation.model.js";

const messagesSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Types.ObjectId,
      ref: Conversations,
    },
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
    messageType: {
      type: String,
      enum: ["text", "image", "video", "document"],
      default: "text",
      required:true
    },
    messageContent: {
      type: String, 
    },
    seen: {
      type: Boolean,
      default: [""],
    },
    image: {
      type: String,
      default: "",
    },
    reactions: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

export const messageModel = new mongoose.model("Messages", messagesSchema);
