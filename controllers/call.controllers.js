import { Call } from "../models/call.model.js";

export const audioCallController = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = req.user;
    const { conversationId, callType } = req.body;
    if (!userId) {
      console.log("Invalid receiver id: ", userId);
      res.status(404).send("Invalid receiverId");
      return;
    }
    const newCall = new Call({
      conversationId,
      callerId: user._id,
      receiverId: userId,
      callType,
      isActive: true,
      callState: 'missed',
    });
    await newCall.save();
    res.status(201).send({ message: "Call log created", callId: newCall._id });
    return;
  } catch (error) {
    console.log("audio call request error: ", error);
    res.status(500).send("Internal Server Error");
  }
};

export const getCallLogsController = async (req, res) => {
  try {
    const { _id } = req.user;
    console.log("Get Call Controller")
    const callLog = await Call.find({
      $or: [
        {callerId: _id,},
        {receiverId: _id,},
      ],
    }).populate([
        {path:'receiverId', select:'username profile '},
        {path:'callerId', select:'username profile '},
    ]);
    res.status(200).send({callLogs:callLog});
    return
  } catch (error) {
    console.log("Failed to retreive call logs", error);
    res.status(500).send("Internal Server Error");
    return;
  }
};
