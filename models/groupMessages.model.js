import mongoose from "mongoose";
import { Conversations } from "./conversation.model.js";

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Types.ObjectId,
      ref: Conversations,
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    messageType: {
      type: String,
      enum: ["text", "image", "video", "document"],
      default: "text",
      required: true,
    },
    messageContent: {
      type: String,
    },
    image: {
      type: String,
      default: "",
    },
    reactions: {
      type: [
        {
          reaction: String,
          userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
          },
        },
      ],
      default: [],
    },
    seen: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    },
  },
  {
    timestamps: true,
  },
);

export const groupMessageModel = new mongoose.model(
  "GroupMessages",
  messageSchema,
);
