import { METHODS } from "http";
import cookies from "cookie-parser";
import dotenv from "dotenv";
import cors from "cors";
import express from "express";

import messagesRouter from "./routers/messages.js";
import authRouter from "./routers/auth.js";
import { connectDb } from "./utils/db.js";
import { io, app, server } from "./utils/socket.js";
import { messageModel } from "./models/messages.model.js";
import groupRouter from "./routers/group.js";
import { User } from "./models/user.model.js";
import { groupModel } from "./models/group.model.js";
import { groupMessageModel } from "./models/groupMessages.model.js";

dotenv.config();
const PORT = 3000;

const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:5182",
  ],
  methods: ["GET", "POST", "DELETE"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json({ extended: false }));
app.use(cookies());

app.get("/", (req, res) => {
  res.send({ message: "Convo API" });
});

app.use("/auth/", authRouter);
app.use("/messages", messagesRouter);
app.use("/group", groupRouter);
let users = {};

io.on("connection", (socket) => {
  users[socket.handshake.query.userId] = socket.id;
  io.emit("Online_Users", users);
  

  socket.on("Typing", (mess) => {
    if (mess.id) {
      io.to(mess.id).emit("Typing", mess);
    }
  });

  socket.on('join_group', (room) => {
    socket.join(room);
  })

  socket.on("Seen_Message", async (message) => {
  
    const senderId = message?.SenderId;
    const socketId = Object.entries(users).find(
      ([key, value]) => key == senderId,
    );

    if (socketId?.length > 0)
      try {
        const seen = await messageModel.findOneAndUpdate(
          { _id: message._id },
          { $set: { seen: true } },
        );

        io.to(socketId[1]).emit("Seen_Message", seen);
      } catch (error) {
        console.log(error);
      }
  });

  socket.on("groupMessage_Seen", async(message,seenUser,roomId) => {
      try {
          const updatedMessage = await groupMessageModel.findOneAndUpdate(
            {_id: message._id},
            {$addToSet:{seen: seenUser._id}}
          )
          io.to(roomId).emit("SeenBy_GroupMembers", updatedMessage)
      } catch (error) {
        console.log("Group Message Error: ", error)
      };
  })

  socket.on("Reacted_To_Message", async (mess) => {
    try {
      const updatedMessage = await messageModel.findOneAndUpdate(
        { _id: mess.messageId },
        { $set: { reactions: mess.reaction } },
        { new: true },
      );
      const ReceiversocketId = users[updatedMessage.ReceiverId];
      const SendersocketId = users[updatedMessage.SenderId];
      io.to([ReceiversocketId, SendersocketId]).emit(
        "Reaction_Update",
        updatedMessage,
      );
    } catch (error) {
      console.log("Reaction Error: ", error);
    }
  });

  socket.on("Delete_Reaction", async (mess) => {
    try {
      const updatedMessage = await messageModel.findOneAndUpdate(
        { _id: mess.messageId },
        { $set: { reactions: mess.reaction } },
        { new: true },
      );
      const ReceiversocketId = users[updatedMessage.ReceiverId];
      const SendersocketId = users[updatedMessage.SenderId];
      io.to([ReceiversocketId, SendersocketId]).emit(
        "Deleted_Reaction",
        updatedMessage,
      );
    } catch (error) {
      console.log("Reaction Error: ", error);
    }
  });

  socket.on("disconnect", () => {
    delete users[socket.handshake.query.userId];
    console.log("After Disconnected:", users);
    io.emit("AfterDisconnection_Online_Users", users);
  });
});

server.listen(PORT, () => {
  connectDb();
  console.log(`Listening at http://localhost:${PORT}`);
});
