import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    GroupId:{
        type:mongoose.Schema.ObjectId
    },
    SenderId:{
        type:mongoose.Schema.ObjectId,
    },
    Text:{
        type:String,
    },
    Image:{
        type:String,
        default:'',
    },
    Reactions:{
        type:[String],
        default:'',
    },
    Seen:{
        type:[mongoose.Schema.ObjectId],
    }
},{
    timestamps:true,
})