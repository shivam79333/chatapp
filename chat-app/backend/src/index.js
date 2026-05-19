import express from 'express'
import { createServer } from 'node:http'
import { Server } from 'socket.io'
import { loadEnv } from './config/env.js'
import { registerSocketHandlers } from './sockets/index.js'

const env = loadEnv()
const app = express()
const httpServer = createServer(app)
const allowedOrigins = new Set([
  env.clientUrl,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5176',
  'http://127.0.0.1:5176',
])

function isAllowedOrigin(origin) {
  if (!origin) return true
  if (allowedOrigins.has(origin)) return true

  try {
    const url = new URL(origin)
    const isLocalHttp = url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname)
    return isLocalHttp
  } catch {
    return false
  }
}

function applyCorsHeaders(req, res) {
  const origin = req.headers.origin
  if (!origin || !isAllowedOrigin(origin)) {
    return
  }

  res.setHeader('Access-Control-Allow-Origin', origin)
  res.setHeader('Vary', 'Origin')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Access-Control-Allow-Credentials', 'true')
}

const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        callback(null, true)
        return
      }
      callback(new Error(`CORS blocked for origin: ${origin}`))
    },
    methods: ['GET', 'POST'],
    credentials: true,
  },
})

app.use((req, res, next) => {
  applyCorsHeaders(req, res)

  if (req.method === 'OPTIONS') {
    if (req.headers.origin && !isAllowedOrigin(req.headers.origin)) {
      res.status(403).send(`CORS blocked for origin: ${req.headers.origin}`)
      return
    }
    res.sendStatus(204)
    return
  }

  next()
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
