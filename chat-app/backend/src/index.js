import express from 'express'
import { createServer } from 'node:http'
import { Server } from 'socket.io'
import { loadEnv } from './config/env.js'
import { registerSocketHandlers } from './sockets/index.js'

const env = loadEnv()
const app = express()
const httpServer = createServer(app)

const io = new Server(httpServer, {
  cors: {
    origin: [env.clientUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST'],
  },
})

app.get('/', (req, res) => {
  res.send('Chat backend is running')
})

app.get('/health', (req, res) => {
  res.json({ ok: true })
})

registerSocketHandlers(io)

httpServer.listen(env.port, env.host, () => {
  console.log(`Backend running at http://${env.host}:${env.port}`)
  console.log(`Frontend allowed from ${env.clientUrl}`)
})
