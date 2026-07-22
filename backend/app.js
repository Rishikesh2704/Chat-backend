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

dotenv.config();
const PORT = 3000;

const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
  ],
  methods: ["GET", "POST"],
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
let users = {};
io.on("connection", (socket) => {
  users[socket.handshake.query.userId] = socket.id;
  io.emit("get_Online_Users", users);

  socket.on("Typing", (mess) => {
    if (mess.id) io.to(mess.id).emit("Typing", mess);
  });

  socket.on("Seen_Message", async (message) => {
    const senderId = message?.SenderId;
    try {
      console.log("Message Id: ", message);
      const seen = await messageModel.findOneAndUpdate(
        { _id: message._id },
        { $set: { seen: true } },
      );
      const socketId = Object.entries(users).find(
        ([key, value]) => key == senderId,
      )[1];
      io.to(socketId).emit("Seen_Message", seen);
    } catch (error) {
      console.log(error);
    }

    if (senderId) {
    }
  });

  socket.on("disconnect", () => {
    delete users[socket.handshake.query.userId];
    io.emit("Users_Online", users);
  });
});

server.listen(PORT, () => {
  connectDb();
  console.log(`Listening at http://localhost:${PORT}`);
});
