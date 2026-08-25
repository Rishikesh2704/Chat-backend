import dotenv from "dotenv";
import { deleteUploadedfile, uploadFile } from "../utils/cloudinary.js";

import { messageModel } from "../models/messages.model.js";
import { User } from "../models/user.model.js";
import { io } from "../utils/socket.js";
import { groupModel } from "../models/group.model.js";
import { groupMessageModel } from "../models/groupMessages.model.js";

dotenv.config();

export const getUsersController = async (req, res) => {
  try {
    const { id } = req.user;
    const dist = await messageModel
      .find({ ReceiverId: id })
      .select("SenderId")
      .distinct("SenderId");
    const Results = await Promise.all(
      dist.map((friend) => {
        const fri = User.find({ _id: friend._id.toString() }).select(
          "-password",
        );
        return fri;
      }),
    );
    const Friends = [...(Results[0] || [])];

    const Groups = await groupModel.find({ members: id });
    res.status(200).send({ Friends, Groups });
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
    const { userId: messageRecieverId, skipDocuments } = req.params;
    const groupMessage = await groupMessageModel
      .find({ groupId: messageRecieverId })
      .sort({ createdAt: -1 })
      .limit(15)
      .populate("SenderId", "username profile")
      .skip(skipDocuments);

    const previousMessages = await messageModel
      .find({
        $or: [
          { SenderId: myId, ReceiverId: messageRecieverId },
          { SenderId: messageRecieverId, ReceiverId: myId },
        ],
      })
      .sort({ createdAt: -1 })
      .limit(15)
      .skip(skipDocuments);
    res
      .status(200)
      .json({ messages: previousMessages, groupMessages: groupMessage });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      Message: "Failed to Retreive Messages!",
      error,
    });
  }
};

export const sendMessagesController = async (req, res) => {
  try {
    const { _id: SenderId } = req.user;
    const { userId: ReceiverId } = req.params;
    const { message, receiverSocketId } = req.body;
    let imageUrl;
    if (req.file) {
      const response = await uploadFile(req.file?.path);
      imageUrl = response.secure_url;
    }

    const newMessage = new messageModel({
      SenderId,
      ReceiverId,
      text: message,
      seen: false,
      image: imageUrl,
      reactions: "",
    });
    const savedMessage = await newMessage.save();
    console.log("Receiver SocketId: ", receiverSocketId);
    await new Promise((resolve, reject) =>
      io
        .to(receiverSocketId)
        .timeout(500)
        .emit("privateMessage", savedMessage, (err, response) => {
          if (err) {
            reject(new Error("Failed to Sent Message!"));
            console.log("Failed", err);
          } else {
            resolve(response.length > 0 ? response : [false]);
          }
        }),
    );
    res.status(201).json({
      message: "Message Sent Successfully",
      newMessage,
    });
  } catch (error) {
    console.log("Throw Error:", error);
    res.status(500).json({
      Message: error.message || "Couldn't Send Message",
      error,
    });
  }
};

export const deleteMessageController = async (req, res) => {
  try {
    const { _id: userId } = req.user;
    const { messageId } = req.params;
    console.log("User Id: ", userId, "Message Id: ", messageId);
    const deletedMessage = await messageModel.findOneAndDelete({
      $and: [{ SenderId: userId }, { _id: messageId }],
    });
    if (deletedMessage && deletedMessage.image) {
      const image = deletedMessage.image.split("/");
      const length = image.length;
      const publicId = image[length - 1].split(".")[0];
      const deletedFile = await deleteUploadedfile(publicId);
    }
    res.status(200).json({
      message: deletedMessage,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
