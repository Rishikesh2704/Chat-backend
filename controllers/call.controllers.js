import { Call } from "../models/call.model.js";


export const audioCallController = async (req, res)  => {
    try {
        const { userId } = req.params
        const user = req.user;
        const { conversationId, callType } = req.body;
        if(!userId) {
             console.log("Invalid receiver id: ", userId);
             res.status(404).send("Invalid receiverId");
             return;
        }
        const newCall = new Call({
            conversationId, 
            callerId:user._id,
            receiverId: userId,
            callType,
            isActive:true, 
            isAnswered:false,
        })
        await newCall.save();
        res.status(201).send({message:"Call log created", callId:newCall._id});
        return;
    } catch (error) {
        console.log("audio call request error: ", error)
        res.status(500).send("Internal Server Error");
    }
}