import { groupModel } from "../models/group.model.js";
import { randomUUID } from "crypto";
import { groupMessageModel } from "../models/groupMessages.model.js";
import { io } from "../utils/socket.js";
import { User } from "../models/user.model.js";
import { Conversations } from "../models/conversation.model.js";

export const getMemberDetails = async (req, res) => {
  try {
    const { groupId } = req.params;
    const groupMembers = (
      await groupModel.findOne({ _id: groupId }, { members: 1, _id: 0 })
    ).members;
    const memberDetails = await Promise.all(
      groupMembers.map((member) => {
        const request = User.findOne(
          { _id: member },
          { username: 1, profile: 1, _id: 1 },
        );
        return request;
      }),
    );
    res.status(200).json({ members: memberDetails });
  } catch (error) {
    console.log("Failed: ", error);
    res.status(500).send("Internal Server Error");
  }
};

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
  const { id: userId } = req.user;
  try {
    const { groupId, members } = req.body;
    const group = await groupModel.findOne({
      $and: [{ _id: groupId }, { admins: userId }],
    });
    console.log("Group Id : ", members, "\nuserId: ", userId);
    if (!group) {
      throw new Error("UnAuthorized");
    }

    if (group.members.includes(members._id)) {
      res.status(200).send("Member already exists");
      return;
    }

    const afterAddingGroup = await groupModel.findOneAndUpdate(
      { _id: groupId },
      { $addToSet: { members: { $each: members } } },
      { returnDocument: "after" },
    );

    res
      .status(200)
      .send({ message: "Added Group Member", group: afterAddingGroup });
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};

export const removeMemberController = async (req, res) => {
  const { id: userId } = req.user;
  try {
    const { groupId, memberId } = req.body;
    const group = await groupModel.findOne({
      $and: [{ _id: groupId }, { admins: userId }],
    });
    if (!group) {
      throw new Error("UnAuthorized");
    }
    console.log("Member Id:", memberId);
    const afterRemovingMember = await groupModel.updateOne(
      { _id: groupId },
      { $pullAll: { members: memberId } },
      { returnDocument: "after" },
    );
    console.log("Removed Member: ", afterRemovingMember);
    res
      .status(200)
      .send({ message: "Removed Group Member", afterRemovingMember });
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};

export const leaveGroupController = async (req, res) => {
  const { id: userId } = req.user;
  const { groupId } = req.param;
  console.log("Group Id: ", groupId);
  if (!groupId) {
    res.status(404).send("Group Not Found");
    return;
  }

  try {
    const afterLeavingGroup = await groupModel.updateOne(
      { _id: groupId },
      { $pull: { members: userId } },
    );
    console.log("Group Members after Leaving: ", afterLeavingGroup);
  } catch (error) {
    console.log("Internal Server Error: ", error);
    res.status(500).send("Internal Server Error");
  }
};

export const sendGroupMessageController = async (req, res) => {
  const { groupId } = req.params;
  if (!groupId) {
    res.status(404).send("Invalid Request");
    return;
  }
  try {
    const { _id: senderId } = req.user;
    const { message, room, conversationId = null } = req.body;
    let imageUrl;
    if (req.file) {
      const response = await uploadFile(req.file?.path);
      imageUrl = response.secure_url;
    }
    const messageType = imageUrl !== undefined ? "image" : "text";
    const groupMembers = await groupModel.find(
      { _id: groupId },
      { members: 1, _id: 0 },
    );
    let conversation = new Conversations({
      participants: groupMembers[0].members,
      lastMessage: {
        senderId: senderId,
        message: message,
        messageType,
      },
    });

    if (conversationId) {
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

    const groupMessage = new groupMessageModel({
      conversationId: conversation._id,
      groupId,
      SenderId: senderId,
      messageType,
      messageContent: message,
      image: imageUrl,
    });

    const savedMessage = await groupMessage.save();
    await new Promise((resolve, reject) => {
      io.to(room)
        .timeout(500)
        .emit("groupMessage", savedMessage, (error, response) => {
          if (error) {
            reject(new Error("Failed to send message"));
            console.log("Failed: ", error);
          }
          resolve(response.length > 0 ? response : [false]);
        });
    });
    res.status(201).json({
      message: "Sent Message To Successfully",
      newMessage: savedMessage,
      conversation: conversation,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};

export const deleteGroupMessageController = async (req, res) => {
  try {
    const { messageId } = req.params;
    const foundMessage = await groupMessageModel.findOneAndDelete({
      _id: messageId,
    });
    res.status(200).json("Deleted Message Successfully");
  } catch (error) {
    console.log("Failed To Delete Group Message: ", error);
  }
};
