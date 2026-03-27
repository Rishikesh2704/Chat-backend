import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import { signUpController } from './controllers/authControllers.js';
import { connectDb } from './lib/db.js';


const app = express();
const server = http.createServer(app)
const io = new Server(server)
const PORT = 3000;

app.use(express.json({extended:false}))

app.get('/', (req, res) => {
    res.sendFile(import.meta.dirname + '/index.html')
})

app.post('/signup', signUpController)
// app.get('/login', loginContoller)

io.on('connection', (socket) => {
    socket.on('chat', (msg) => io.emit('chat',msg))
    socket.on('disconnect', () => socket.broadcast.emit('Disconnected'))
})

server.listen(PORT, () => {
    connectDb()
    console.log("Listening at ",PORT)
})