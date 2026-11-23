import mongoose from "mongoose";

const callSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
    },
    callerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    callType: {
      type: String,
      enum: ["video", "audio"],
      required: true,
    },
    isActive:{
      type:Boolean,
      default:false,
    },
    isAnswered: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

export const Call = new mongoose.model("Call", callSchema);
