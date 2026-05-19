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
  const userTyping = new Map()
  const userSockets = new Map()
  const messageService = createMessageService()
  const roomService = createRoomService()

  io.on(SOCKET_EVENTS.CONNECT, (socket) => {
    console.log(`User connected: ${socket.id}`)
    joinOnlyRoom(socket, 'general')

    socket.on(SOCKET_EVENTS.CREATE_ROOM, async (room) => {
      if (!room?.id || !room?.name) {
        return
      }

      const newRoom = {
        id: room.id,
        name: room.name,
        description: room.description || 'Custom room',
      }

      try {
        await roomService.createRoom(newRoom)
      } catch (error) {
        console.error(`Failed to persist room ${newRoom.id}:`, error)
        return
      }

      rooms.set(newRoom.id, newRoom)
      io.emit(SOCKET_EVENTS.ROOM_CREATED, newRoom)
    })

    socket.on(SOCKET_EVENTS.JOIN_ROOM, async (payload) => {
      const roomId = payload?.roomId || payload
      let room = rooms.get(roomId)

      if (!room) {
        room = await roomService.getRoomInfo(roomId)
        if (!room) {
          return
        }
        rooms.set(room.id, {
          id: room.id,
          name: room.name || room.id,
          description: room.description || 'Custom room',
        })
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
        await roomService.addUserToRoom(roomId, userId, userName, userDisplayName)
      } catch (error) {
        console.error(`Failed to add user ${userId} to room ${roomId}:`, error)
      }

      try {
        const history = await messageService.getRoomMessages(roomId)
        socket.emit(SOCKET_EVENTS.MESSAGE_HISTORY, { roomId, messages: history })
      } catch (error) {
        console.error(`Failed to load message history for room ${roomId}:`, error)
      }

      socket.emit(SOCKET_EVENTS.ROOM_JOINED, roomId)
      broadcastUserCount(io, roomId)
    })

    socket.on(SOCKET_EVENTS.SEND_MESSAGE, async (payload) => {
      const text = payload?.text?.trim()
      const roomId = payload?.roomId || 'general'

      if (!text || !rooms.has(roomId)) {
        return
      }

      const userInfo = userSockets.get(socket.id)
      const senderDisplayName = userInfo?.userDisplayName || payload.sender || 'Guest'

      const message = {
        text,
        sender: payload.sender || 'Guest',
        senderDisplayName,
        roomId,
      }

      let savedMessage
      try {
        savedMessage = await messageService.saveMessage(message)
      } catch (error) {
        console.error(`Failed to save message in room ${roomId}:`, error)
        return
      }

      io.to(roomId).emit(SOCKET_EVENTS.RECEIVE_MESSAGE, savedMessage)
      userTyping.delete(socket.id)
      io.to(roomId).emit(SOCKET_EVENTS.TYPING_STOP, { userId: socket.id })
    })

    socket.on(SOCKET_EVENTS.GET_USER_ROOMS, async (userId) => {
      if (!userId) {
        return
      }

      try {
        const userRooms = await roomService.getUserRooms(userId)
        const normalizedRooms = userRooms
          .map((room) => ({
            id: room.id,
            name: room.name || room.id,
            description: room.description || 'User room',
          }))
          .filter((room) => !DEFAULT_ROOM_IDS.has(room.id))

        socket.emit(SOCKET_EVENTS.USER_ROOMS, normalizedRooms)
      } catch (error) {
        console.error(`Failed to get user rooms for ${userId}:`, error)
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

const DEFAULT_ROOM_IDS = new Set(['general', 'tech', 'random'])

function broadcastUserCount(io, roomId) {
  const room = io.sockets.adapter.rooms.get(roomId)
  const userCount = room ? room.size : 0
  io.to(roomId).emit('room:usercount', { roomId, count: userCount })
}
