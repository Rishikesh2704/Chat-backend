import express from 'express'
import http from 'http'
import { Server } from 'socket.io'

const app = express();
const server = http.createServer(app)
const io =  new Server(server,{
    cors:{origin:'https://chat-frontend-seven-flax.vercel.app',methods:['GET','POST',]}
})

export {io, app, server}