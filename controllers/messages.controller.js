import dotenv from "dotenv";
import { deleteUploadedfile, uploadFile } from "../utils/cloudinary.js";

import { messageModel } from "../models/messages.model.js";
import { User } from "../models/user.model.js";
import { io } from "../utils/socket.js";
import { groupModel } from "../models/group.model.js";
import { groupMessageModel } from "../models/groupMessages.model.js";
import { Conversations } from "../models/conversation.model.js";

dotenv.config();

export const getUsersController = async (req, res) => {
  try {
    const { id } = req.user;
    const dist = await messageModel
      .find({ receiverId: id })
      .select("senderId")
      .distinct("senderId");
    const Results = await Promise.all(
      dist.map((friend) => {
        const fri = User.find({ _id: friend._id.toString() }).select(
          "-password",
        );
        return fri;
      }),
    );
    const Friends = [...(Results[0] || [])];
    const conversations = await Conversations.find({
      participants: id,
    }).populate([
      { path: "participants", select: "username profile" },
      { path: "group", select: "groupName profile roomId" },
      
    ]);

    const Groups = await groupModel.find({ members: id });

    res.status(200).send({ Friends, Groups, Conversations: conversations });
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
      .skip(skipDocuments);


    const previousMessages = await messageModel
      .find({
        $or: [
          { senderId: myId, receiverId: messageRecieverId },
          { senderId: messageRecieverId, receiverId: myId },
        ],
      })
      .sort({ createdAt: -1 })
      .limit(15)
      .skip(skipDocuments);
      console.log("Previous Messages: ", previousMessages)
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
    const { _id: senderId } = req.user;
    const { userId: receiverId } = req.params;
    const { message, receiverSocketId, conversationId = null } = req.body;
    let imageUrl;
    if (req.file) {
      const response = await uploadFile(req.file?.path);
      imageUrl = response.secure_url;
    }
    const messageType = imageUrl !== undefined ? "image" : "text";
    console.log("Conversation Id: ", conversationId)
      let conversation = new Conversations({
        participants: [senderId, receiverId],
        lastMessage: {
          senderId: senderId,
          message: message,
          messageType,
        },
      });
    if(conversationId){
      conversation = await Conversations.findOneAndUpdate(
      { _id: conversationId },
      {
        $set: {
          lastMessage: {
            message: message,
            senderId: senderId,
            messageType: messageType,
          },
        },
      },
      { returnDocument: "after" },
    );
    }
    
  
    conversation.populate("participants", "username profile");
    await conversation.save();

    const newMessage = new messageModel({
      senderId,
      receiverId,
      conversationId: conversation._id,
      messageType,
      messageContent: message,
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
        .emit(
          "privateMessage",
          { savedMessage, conversation },
          (err, response) => {
            if (err) {
              reject(new Error("Failed to Sent Message!"));
              console.log("Failed", err);
            } else {
              resolve(response.length > 0 ? response : [false]);
            }
          },
        ),
    );

    res.status(201).json({
      message: "Message Sent Successfully",
      newMessage,
      conversation,
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
    const deletedMessage = await messageModel.findOneAndDelete(
      {
        $and: [{ senderId: userId }, { _id: messageId }],
      },
      { returnDocument: "after" },
    );
    if (deletedMessage && deletedMessage.image) {
      const image = deletedMessage.image.split("/");
      const length = image.length;
      const publicId = image[length - 1].split(".")[0];
      await deleteUploadedfile(publicId);
    }
    const lastMessage = (
      await messageModel
        .find({
          $and: [
            { senderId: userId },
            { receiverId: deletedMessage.receiverId },
          ],
        })
        .sort({ createdAt: -1 })
        .limit(1)
    )[0];

    console.log("Last Message After Deleting: ", lastMessage.messageContent);

    const conversation = await Conversations.findOneAndUpdate(
      { _id: deletedMessage.conversationId },
      {
        $set: {
          lastMessage: {
            message: lastMessage.messageContent,
            senderId: lastMessage.senderId,
            messageType: lastMessage.messageType,
          },
        },
      },
      { returnDocument: "after" },
    ).populate("participants", "username profile");
    console.log("Conversation : ", conversation);
    res.status(200).json({
      message: deletedMessage,
      conversation: conversation,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
