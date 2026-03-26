import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import { loginContoller, signinController } from './controllers/authControllers';


const app = express();
const server = http.createServer(app)
const io = new Server(server)
const PORT = 3000;

app.get('/', (req, res) => {
    res.sendFile(import.meta.dirname + '/index.html')
})

app.get('/signup', signinController)
app.get('/login', loginContoller)

io.on('connection', (socket) => {
    socket.on('chat', (msg) => io.emit('chat',msg))
    socket.on('disconnect', () => socket.broadcast.emit('Disconnected'))
})

server.listen(PORT, () => {
    console.log("Listening at ",PORT)
})