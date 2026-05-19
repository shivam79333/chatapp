import { SOCKET_EVENTS } from '../../../shared/constants/events.js'
import { createMessageService } from '../services/message.service.js'
import { createRoomService } from '../services/room.service.js'

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
  const roomService = createRoomService()
  const userTyping = new Map()
  const userSockets = new Map()

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

    socket.on(SOCKET_EVENTS.JOIN_ROOM, async (payload) => {
      const roomId = payload?.roomId || payload
      if (!rooms.has(roomId)) {
        return
      }

      joinOnlyRoom(socket, roomId)

      const userId = payload?.userId || socket.id
      const userName = payload?.userName || 'User'
      const userDisplayName = payload?.userDisplayName || userName

      userSockets.set(socket.id, {
        userId,
        userName,
        userDisplayName,
        currentRoom: roomId,
      })

      try {
        await roomService.addUserToRoom(
          roomId,
          userId,
          userName,
          userDisplayName
        )
      } catch (error) {
        console.error(`Failed to add user to room ${roomId}:`, error)
      }

      socket.emit(SOCKET_EVENTS.ROOM_JOINED, roomId)
      broadcastUserCount(io, roomId)

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

      const userInfo = userSockets.get(socket.id)
      const senderDisplayName = userInfo?.userDisplayName || payload.sender || 'Guest'

      try {
        const message = await messageService.saveMessage({
          text,
          sender: payload.sender || 'Guest',
          senderDisplayName,
          roomId,
        })

        io.to(roomId).emit(SOCKET_EVENTS.RECEIVE_MESSAGE, message)
        userTyping.delete(socket.id)
        io.to(roomId).emit(SOCKET_EVENTS.TYPING_STOP, { userId: socket.id })
      } catch (error) {
        console.error(`Failed to save message for room ${roomId}:`, error)
      }
    })

    socket.on(SOCKET_EVENTS.TYPING_START, (payload) => {
      const roomId = payload?.roomId || 'general'
      if (!rooms.has(roomId)) return

      userTyping.set(socket.id, {
        userId: socket.id,
        sender: payload.sender || 'User',
        roomId,
      })

      io.to(roomId).emit(SOCKET_EVENTS.TYPING_START, {
        userId: socket.id,
        sender: payload.sender || 'User',
      })
    })

    socket.on(SOCKET_EVENTS.TYPING_STOP, (payload) => {
      const roomId = payload?.roomId || 'general'
      userTyping.delete(socket.id)
      io.to(roomId).emit(SOCKET_EVENTS.TYPING_STOP, { userId: socket.id })
    })

    socket.on(SOCKET_EVENTS.GET_USER_ROOMS, async (userId) => {
      try {
        const userRooms = await roomService.getUserRooms(userId)
        socket.emit(SOCKET_EVENTS.USER_ROOMS, userRooms)
      } catch (error) {
        console.error(`Failed to get rooms for user ${userId}:`, error)
        socket.emit(SOCKET_EVENTS.USER_ROOMS, [])
      }
    })

    socket.on(SOCKET_EVENTS.DISCONNECT, () => {
      console.log(`User disconnected: ${socket.id}`)
      userTyping.delete(socket.id)
      userSockets.delete(socket.id)

      for (const room of socket.rooms) {
        if (room !== socket.id) {
          broadcastUserCount(io, room)
        }
      }
    })
  })
}

function broadcastUserCount(io, roomId) {
  const room = io.sockets.adapter.rooms.get(roomId)
  const userCount = room ? room.size : 0
  io.to(roomId).emit('room:usercount', { roomId, count: userCount })
}
