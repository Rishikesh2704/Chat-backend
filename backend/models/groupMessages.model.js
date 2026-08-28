import mongoose from "mongoose";
import { User } from "./user.model.js";

const messageSchema = new mongoose.Schema(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    SenderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
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
            required:true,
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
