import multer from "multer";
import { messageModel } from "../models/messages.model.js";
import { User } from "../models/user.model.js";
import { io } from "../utils/socket.js";
import { readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { deleteUploadedfile, uploadFile } from "../utils/cloudinary.js";
import dotenv from "dotenv";
import fs from "fs";
dotenv.config();

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
    const { userId: MessageRecieverId, skipDocuments } = req.params;
    const previousMessages = await messageModel
      .find({
        $or: [
          { SenderId: myId, ReceiverId: MessageRecieverId },
          { SenderId: MessageRecieverId, ReceiverId: myId },
        ],
      })
      .sort({ createdAt: -1 })
      .limit(15)
      .skip(skipDocuments);

    res.status(200).json({ messages: previousMessages });
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
      image: imageUrl,
    });
   const isMessageSent = await new Promise((resolve, reject) =>
      io
        .to(receiverSocketId)
        .timeout(100)
        .emit("privateMessage", newMessage, (err, response) => {
          if (err) {
            reject(new Error("Failed to Sent Message!"));
            console.log("Failed", err)
          } else {
            
            resolve( response.length>0?response:[false]);
          }
        }),
    );
   
    if(isMessageSent[0]) await newMessage.save();
    res.status(201).json({
      newMessage,sentMessage:isMessageSent[0]
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
    if (deletedMessage.image) {
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
