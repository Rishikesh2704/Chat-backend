import { METHODS } from "http";
import { connectDb } from "./lib/db.js";
import authRouter from "./routers/auth.js";
import cookies from "cookie-parser";
import messagesRouter from "./routers/messages.js";
import dotenv from "dotenv";
import cors from "cors";
import express from "express";

import { io, app, server } from "./utils/socket.js";

dotenv.config();
const PORT = 3000;

const corsOptions = {
  origin: ["http://localhost:5173"],
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
  users[socket.handshake.query.userId] =socket.id;

  socket.emit("getUsers", users);  

  console.log("Users List: ", users);
  socket.on("disconnect", () => {
    socket.broadcast.emit("Disconnected");
    // const  filteredUserList = Object.entries(users).filter(([key,value]) => key !== socket.handshake.query.userId)
    console.log('User List:', users)
    
  });
});

server.listen(PORT, () => {
  connectDb();
  console.log(`Listening at http://localhost:${PORT}`);
});
