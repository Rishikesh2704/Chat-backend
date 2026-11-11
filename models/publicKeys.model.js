import mongoose from "mongoose";

const publicKeySchema = new mongoose.Schema(
    {
        user:{
            type:mongoose.Schema.Types.ObjectId,
            required:true,
            unique:true,
        },
        publicKey:{
            type:String,
            required:true,
            unique:true,
        },
    },
    {
        timestamps:true
    }
)

export const PublicKey = new mongoose.model('PublicKey', publicKeySchema)