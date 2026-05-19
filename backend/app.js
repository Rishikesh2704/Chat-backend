import  { METHODS } from 'http'
import { connectDb } from './lib/db.js';
import authRouter from './routers/auth.js';
import cookies from 'cookie-parser';
import messagesRouter from './routers/messages.js';
import dotenv from 'dotenv'
import cors from 'cors'
import express from 'express'

import {io, app, server } from './utils/socket.js'

dotenv.config();
const PORT = 3000

const corsOptions = {
    origin:['http://localhost:5173'],
    methods:['GET', 'POST'],
    credentials:true
}


app.use(cors(corsOptions))
app.use(express.json({extended:false}))
app.use(cookies())

app.get('/', (req, res) => {
    res.sendFile(import.meta.dirname + '/index.html')
})

app.use('/auth/', authRouter)
app.use('/messages', messagesRouter)

io.on('connection', (socket) => {
    socket.on('chat', (msg) => io.emit('chat',msg))
    socket.on('disconnect', () => socket.broadcast.emit('Disconnected'))
})

server.listen(PORT, () => {
    connectDb()
    console.log(`Listening at http://localhost:${PORT}`)
})