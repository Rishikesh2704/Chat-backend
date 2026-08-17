import mongoose from "mongoose";
import { User } from "./user.model.js";


const groupSchema = new mongoose.Schema({
    GroupName:{
        type:String,
        default:"Group",
        required:true,
    },
    Admins:[{
        type:mongoose.Schema.ObjectId,
        required:true,
        
    }],
    Members:[
        {
            type:mongoose.Schema.ObjectId,
            ref:'User'
        }
    ],
    RoomId:{
        type:String,
        required:true
    }
},
{
    timestamps:true,
})

export const groupModel = new mongoose.model("Group", groupSchema);