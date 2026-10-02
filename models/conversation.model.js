import mongoose from "mongoose";
import { User } from "./user.model.js";
import { messageModel } from "./messages.model.js";

const conversationSchema = new mongoose.Schema(
  {
    participants: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      required: true,
    },
    isGroup:{
      type:Boolean,
      default:false,
    },
    group: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      ref: "Group",
    },
    lastMessage: {
      type: {
        message: String,
        senderId: { type: mongoose.Types.ObjectId, ref: "User" },
        messageType: {
          type: String,
          enum: ["text", "image", "video", "document"],
        },
      },
    },
  },
  {
    timestamps: true,
  },
);

export const Conversations = new mongoose.model(
  "Conversation",
  conversationSchema,
);
