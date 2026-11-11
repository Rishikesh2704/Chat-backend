import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type:String,
      unique:true,
      required:true,
    },
    username: {
      type:String,
      required:true
    },
    password: {
      type:String,
      required:true,
      minlength:6
    },
    profile: {
      type:String,
      default:""
    },
    encryptedKey:{
      type:{
        key:{type:String},
        salt:{type:String},
        iv:{type:String},
      }
    }
   
  },
  {
    timestamps: true,
  },
);

export const User = mongoose.model("User", userSchema);
