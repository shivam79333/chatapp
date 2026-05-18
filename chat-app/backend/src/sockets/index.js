import { SOCKET_EVENTS } from '../../../shared/constants/events.js'
import { createMessageService } from '../services/message.service.js'

const rooms = new Map([
  ['general', { id: 'general', name: 'General', description: 'Default room' }],
  ['tech', { id: 'tech', name: 'Tech', description: 'Development talk' }],
  ['random', { id: 'random', name: 'Random', description: 'Off-topic chat' }],
])

function joinOnlyRoom(socket, roomId) {
  for (const joinedRoom of socket.rooms) {
    if (joinedRoom !== socket.id) {
      socket.leave(joinedRoom)
    }
  }

  socket.join(roomId)
}

export function registerSocketHandlers(io) {
  const messageService = createMessageService()

  io.on(SOCKET_EVENTS.CONNECT, (socket) => {
    console.log(`User connected: ${socket.id}`)
    joinOnlyRoom(socket, 'general')

    socket.on(SOCKET_EVENTS.CREATE_ROOM, (room) => {
      if (!room?.id || !room?.name) {
        return
      }

      const newRoom = {
        id: room.id,
        name: room.name,
        description: room.description || 'Custom room',
      }

      rooms.set(newRoom.id, newRoom)
      io.emit(SOCKET_EVENTS.ROOM_CREATED, newRoom)
    })

    socket.on(SOCKET_EVENTS.JOIN_ROOM, async (roomId) => {
      if (!rooms.has(roomId)) {
        return
      }

      joinOnlyRoom(socket, roomId)
      socket.emit(SOCKET_EVENTS.ROOM_JOINED, roomId)

      try {
        const messages = await messageService.getRoomMessages(roomId)
        socket.emit(SOCKET_EVENTS.MESSAGE_HISTORY, {
          roomId,
          messages,
        })
      } catch (error) {
        console.error(`Failed to load messages for room ${roomId}:`, error)
      }
    })

    socket.on(SOCKET_EVENTS.SEND_MESSAGE, async (payload) => {
      const text = payload?.text?.trim()
      const roomId = payload?.roomId || 'general'

      if (!text || !rooms.has(roomId)) {
        return
      }

      try {
        const message = await messageService.saveMessage({
          text,
          sender: payload.sender || 'Guest',
          roomId,
        })

        io.to(roomId).emit(SOCKET_EVENTS.RECEIVE_MESSAGE, message)
      } catch (error) {
        console.error(`Failed to save message for room ${roomId}:`, error)
      }
    })

    socket.on(SOCKET_EVENTS.DISCONNECT, () => {
      console.log(`User disconnected: ${socket.id}`)
    })
  })
}
