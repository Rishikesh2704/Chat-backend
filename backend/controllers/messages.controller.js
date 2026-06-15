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

export const getMessagesController = async (req, res) => {
  try {
    const { _id: myId } = req.user;
    const { userId: MessageRecieverId } = req.params;
    const previousMessages = await messageModel.find({
      $or: [
        { SenderId: myId, ReceiverId: MessageRecieverId },
        { SenderId: MessageRecieverId, ReceiverId: myId },
      ],
    }).limit(20);
    res.status(200).json({messages:previousMessages});
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
    const { message, receiverSocketId } = req.body;
    
    const newMessage = new messageModel({
      SenderId,
      ReceiverId,
      text: message,
    });
    const message1 = await newMessage.save();
    console.log('New Message: ', message1)
    await new Promise((resolve, reject) =>
      io.to(receiverSocketId).timeout(100).emit("privateMessage", newMessage, (err,responses) => {
        if (err) {
          reject(new Error("Failed to Sent Message!"));
        } else {
          console.log(responses)
          resolve();
        }
      }),
    );
    res.status(201).json({
      Message: "Successfully Sent Message!",
      data:newMessage
    });
  } catch (error) {
    console.log("Throw Error:", error);
    res.status(500).json({
      Message: error.message || "Couldn't Send Message",
      error,
    });
  }
};
