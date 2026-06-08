import { messageModel } from "../models/messages.model.js";
import { User } from "../models/user.model.js";
import { io } from "../utils/socket.js";

export const getUsersController = async (req, res) => {
  try {
    const { id } = req.user;
    const users = await User.find({ _id: { $ne: id } }).select("-password");
    res.status(200).send(users);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal Server Error!",
    });
  }
};

export const privateMessagesController = async (req, res) => {
  try {
    const { _id: myId } = req.user;
    const { userId: MessageRecieverId } = req.params;
    const previouseMessages = await messageModel.find({
      $or: [
        { SenderId: myId, ReceiverID: MessageRecieverId },
        { SenderId: MessageRecieverId, ReceiverID: myId },
      ],
    });
    res.status(200).json({
      SenderId: myId,
      ReceiverId: MessageRecieverId,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      Message: "Failed Retreive Messages!",
      error,
    });
  }
};

export const sendMessagesController = async (req, res) => {
  try {
    const { _id: SenderId } = req.user;
    const { userId: ReceiverId } = req.params;
    const { message } = req.body;
    const newMessage = new messageModel({
      SenderId,
      ReceiverId,
      text: message,
    });
    await newMessage.save();
    io.to(ReceiverId).emit(newMessage)
    res.status(201).json({
      Message: "Successfully Sent Message!",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      Message: "Couldn't Send Message",
      error,
    });
  }
};
