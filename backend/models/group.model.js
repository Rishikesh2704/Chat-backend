import mongoose from "mongoose";
import { User } from "./user.model.js";


const groupSchema = new mongoose.Schema({
    groupName:{
        type:String,
        default:'Group',
        required:true,
    },
    profile:{
        type:String,
        default:""
    },
    admins:[{
        type:mongoose.Schema.ObjectId,
        required:true,
    }],
    members:[
        {
            type:mongoose.Schema.ObjectId,
            ref:'User'
        }
    ],
    roomId:{
        type:String,
        required:true
    }
},
{
    timestamps:true,
})

export const groupModel = new mongoose.model("Group", groupSchema);