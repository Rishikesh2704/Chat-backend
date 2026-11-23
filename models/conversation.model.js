import mongoose from "mongoose";


const conversationSchema = new mongoose.Schema(
  {
    participants: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      required: true,
    },
    isGroup: {
      type: Boolean,
      default: false,
    },
    group: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      ref: "Group",
    },
    unreadMessagesCount: {
      type: Map,
      of:Number,
      default:{},
    },
    callRoomId:{
      type:String, 
      default:null
    }, 
    lastMessage: {
      type: {
        message: String,
        senderId: { type: mongoose.Types.ObjectId, ref: "User" },
        messageType: {
          type: String,
          enum: ["text", "image", "video", "document"],
        },
        messageIv:String,
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
