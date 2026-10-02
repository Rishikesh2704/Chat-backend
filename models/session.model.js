import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, "UserId is Required"],
    ref:"User",
  },
  refreshTokenHash: {
    type: String,
    required: [true, "Refresh token hash is required"],
  },
  ip: {
    type: String,
    required: [true, "Ip is required"],
  },
  userAgent: {
    type: String,
    required: [true, "Agent Details is Required"],
  },
  revoked: {
    type: Boolean,
    default: false,
  },
});

export const sessionModel = new mongoose.model("Session", sessionSchema);
