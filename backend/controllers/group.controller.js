import { groupModel } from "../models/group.model.js";
import { randomUUID } from "crypto";

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
      GroupName: groupName,
      Members: [admin, ...groupMembers],
      Admins: [admin],
      RoomId: randomUUID(),
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
    console.log("Group:", group);
    res.status(200).send({ message: "Added Group Member" });
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};
