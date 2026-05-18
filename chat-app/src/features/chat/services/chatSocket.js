import { io } from 'socket.io-client'

export function createChatSocket() {
  return io(import.meta.env.VITE_API_URL || 'http://127.0.0.1:4000', {
    autoConnect: false,
  })
}
