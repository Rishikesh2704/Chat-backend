import mongoose from "mongoose";

export const connectDb = async() => {
    try{
        await mongoose.connect( process.env.MONGODB_URL || 'mongodb://localhost:27017/Chat')
        console.log("Connected to the Database")
    }catch(err){
        console.log("Error in connecting to Database")
    }
}