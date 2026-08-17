import mongoose from "mongoose";
import { User } from "./user.model";


const groupModel = new mongoose.Schema({
    GroupName:{
        type:String,
        required:true
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