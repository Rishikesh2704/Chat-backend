const express = require('express')
const http = require('http')
const app = express();
const server = http.createServer(app)
const { Server } = require('socket.io')
const io = new Server(server)
const PORT = 3000;

app.get('/', (req, res) => {
    res.sendFile(__dirname+'/index.html')
})

io.on('connection', (socket) => {
    socket.on('chat', (msg) => io.emit('chat',msg))
    socket.on('disconnect', () => socket.broadcast.emit('Disconnected'))
})

server.listen(PORT, () => {
    console.log("Listening at ",PORT)
})