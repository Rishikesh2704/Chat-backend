import { groupModel } from "../models/group.model.js";
import { randomUUID } from "crypto";
import { groupMessageModel } from "../models/groupMessages.model.js";
import { io } from "../utils/socket.js";
import { User } from "../models/user.model.js";

export const createGroupController = async (req, res) => {
  const { groupName, groupMembers, admin } = req.body;
  console.log(
    "Group Name: ",
    groupName,
    "\n Members :",
    groupMembers,
    "\n Admin",
    admin,
  );
  try {
    const group = new groupModel({
      groupName: groupName,
      members: [admin, ...groupMembers],
      admins: [admin],
      roomId: randomUUID(),
    });
    console.log(group);
    const done = await group.save();
    if (done)
      res.status(200).send({
        message: "Created Group Successfully",
      });
    else {
      throw new Error("Failed To create group");
    }
  } catch (error) {
    console.log("Failed To Create Group", error);
    res.send("Internal Server Error");
  }
};

export const addMemberController = async (req, res) => {
  try {
    const { userId, groupId, memberId } = req.body;
    const group = await groupModel.findOne({
      $and: [{ _id: groupId }, { Admins: userId }],
    });
    if (!group) {
      throw new Error("UnAuthorized");
    }
    const afterAddingGroup = await groupModel.findOneAndUpdate(
      { _id: groupId },
      { $push: { Members: memberId } },
      { returnDocument: "after" },
    );
    console.log("After Adding Group:", afterAddingGroup);
    res.status(200).send({ message: "Added Group Member" });
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};

export const removeMemberController = async (req, res) => {
  try {
    const { userId, groupId, memberId } = req.body;
    const group = await groupModel.findOne({
      $and: [{ _id: groupId }, { Admins: "6a27bbe014cda1da0937aec3" }],
    });
    if (!group) {
      throw new Error("UnAuthorized");
    }
    res.status(200).send({ message: "Added Group Member" });
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};

export const groupMessagesController = async (req, res) => {
  const { groupId } = req.params;
  if (!groupId) {
    res.status(404).send("Invalid Request");
    return;
  }
  try {
    const { _id: senderId } = req.user;
    const { message, room } = req.body;
    let imageUrl;
    if (req.file) {
      const response = await uploadFile(req.file?.path);
      imageUrl = response.secure_url;
    }
 
    const groupMessage = new groupMessageModel({
      groupId,
      SenderId: senderId,
      text: message,
      image: imageUrl,
    });
    const savedMessage = await groupMessage.save();

    await savedMessage.populate("SenderId", " username profile");
    await new Promise((resolve, reject) => {
      io.to(room)
        .timeout(500)
        .emit("groupMessage", savedMessage, (error, response) => {
          if (error) {
            reject(new Error("Failed to send message"));
            console.log("Failed: ", error);
          }
          console.log("IO : ", response);
          resolve(response.length > 0 ? response : [false]);
        });
    });
    res.status(201).json({
      message: "Sent Message To Successfully",
      newMessage: savedMessage,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};
