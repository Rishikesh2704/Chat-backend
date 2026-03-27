import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: String,
    email: String,
    password: String,
    profile: String,
  },
  {
    timestamps: true,
  },
);

export const user = mongoose.model("User", userSchema);
user.createCollection();
