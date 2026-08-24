import mongoose from "mongoose";
import { User } from "./user.model.js";

const messageSchema = new mongoose.Schema(
  {
    groupId: {
      type: mongoose.Schema.ObjectId,
      required: true,
    },
    SenderId: {
      type: mongoose.Schema.ObjectId,
      ref: User,
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
      type: [String],
      default: null,
    },
    seen: {
      type: [{ type: mongoose.Schema.ObjectId, ref: User }],
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
