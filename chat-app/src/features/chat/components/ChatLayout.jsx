import { useEffect, useMemo, useState } from 'react'
import { SOCKET_EVENTS } from '../../../../shared/constants/events'
import { DEFAULT_ROOMS } from '../../../../shared/constants/rooms'
import { createChatSocket } from '../services/chatSocket'
import ChatHeader from './ChatHeader'
import MessageInput from './MessageInput'
import MessageList from './MessageList'
import RoomSidebar from './RoomSidebar'
import UsernameModal from './UsernameModal'

function createRoomId(name) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function ChatLayout({ user, onLogout }) {
  const socket = useMemo(() => createChatSocket(), [])
  const [username, setUsername] = useState(
    user?.displayName || user?.email?.split('@')[0] || ''
  )
  const [rooms, setRooms] = useState(DEFAULT_ROOMS)
  const [currentRoomId, setCurrentRoomId] = useState('general')
  const [messagesByRoom, setMessagesByRoom] = useState({})
  const [connected, setConnected] = useState(false)
  const [typingUsersByRoom, setTypingUsersByRoom] = useState({})
  const [userCountByRoom, setUserCountByRoom] = useState({})

  const currentRoom =
    rooms.find((room) => room.id === currentRoomId) || DEFAULT_ROOMS[0]
  const messages = messagesByRoom[currentRoomId] || []
  const typingUsers = typingUsersByRoom[currentRoomId] || []
  const userCount = userCountByRoom[currentRoomId] || 0

  useEffect(() => {
    const handleConnect = () => {
      setConnected(true)
      if (user?.uid) {
        socket.emit(SOCKET_EVENTS.GET_USER_ROOMS, user.uid)
      }
    }

    const handleDisconnect = () => {
      setConnected(false)
    }

    socket.on(SOCKET_EVENTS.CONNECT, handleConnect)
    socket.on(SOCKET_EVENTS.DISCONNECT, handleDisconnect)

    socket.on(SOCKET_EVENTS.USER_ROOMS, (userRooms) => {
      if (userRooms && userRooms.length > 0) {
        const uniqueRooms = new Map()

        DEFAULT_ROOMS.forEach((room) => {
          uniqueRooms.set(room.id, room)
        })

        userRooms.forEach((room) => {
          if (!uniqueRooms.has(room.id)) {
            uniqueRooms.set(room.id, {
              id: room.id,
              name: room.name || room.id,
              description: room.description || 'User room',
            })
          }
        })

        setRooms(Array.from(uniqueRooms.values()))
      }
    })

    socket.on(SOCKET_EVENTS.RECEIVE_MESSAGE, (message) => {
      setMessagesByRoom((currentMessages) => ({
        ...currentMessages,
        [message.roomId]: [...(currentMessages[message.roomId] || []), message],
      }))
    })

    socket.on(SOCKET_EVENTS.MESSAGE_HISTORY, ({ roomId, messages }) => {
      setMessagesByRoom((currentMessages) => ({
        ...currentMessages,
        [roomId]: messages,
      }))
    })

    socket.on(SOCKET_EVENTS.ROOM_CREATED, (room) => {
      setRooms((currentRooms) => {
        if (currentRooms.some((currentRoom) => currentRoom.id === room.id)) {
          return currentRooms
        }

        return [...currentRooms, room]
      })
    })

    socket.on(SOCKET_EVENTS.TYPING_START, ({ userId, sender, roomId }) => {
      setTypingUsersByRoom((prev) => {
        const room = roomId || currentRoomId
        const existing = prev[room] || []
        if (existing.some((u) => u.userId === userId)) return prev
        return {
          ...prev,
          [room]: [...existing, { userId, sender }],
        }
      })
    })

    socket.on(SOCKET_EVENTS.TYPING_STOP, ({ userId }) => {
      setTypingUsersByRoom((prev) => {
        const updated = { ...prev }
        for (const room in updated) {
          updated[room] = updated[room].filter((u) => u.userId !== userId)
        }
        return updated
      })
    })

    socket.on('room:usercount', ({ roomId, count }) => {
      setUserCountByRoom((prev) => ({
        ...prev,
        [roomId]: count,
      }))
    })

    if (socket.connected) {
      handleConnect()
    } else {
      socket.connect()
    }

    return () => {
      socket.off(SOCKET_EVENTS.CONNECT, handleConnect)
      socket.off(SOCKET_EVENTS.DISCONNECT, handleDisconnect)
      socket.off(SOCKET_EVENTS.RECEIVE_MESSAGE)
      socket.off(SOCKET_EVENTS.MESSAGE_HISTORY)
      socket.off(SOCKET_EVENTS.ROOM_CREATED)
      socket.off(SOCKET_EVENTS.TYPING_START)
      socket.off(SOCKET_EVENTS.TYPING_STOP)
      socket.off(SOCKET_EVENTS.USER_ROOMS)
      socket.off('room:usercount')
      socket.disconnect()
    }
  }, [socket, user])

  useEffect(() => {
    if (connected) {
      socket.emit(SOCKET_EVENTS.JOIN_ROOM, {
        roomId: currentRoomId,
        userId: user?.uid,
        userName: username,
        userDisplayName: user?.displayName || username,
      })
    }
  }, [connected, currentRoomId, socket, user, username])

  function handleJoinRoom(roomId) {
    setCurrentRoomId(roomId)

    if (connected) {
      socket.emit(SOCKET_EVENTS.JOIN_ROOM, {
        roomId,
        userId: user?.uid,
        userName: username,
        userDisplayName: user?.displayName || username,
      })
    }
  }

  function handleCreateRoom(roomName) {
    const roomId = createRoomId(roomName)

    if (!roomId || rooms.some((room) => room.id === roomId)) {
      return
    }

    const newRoom = {
      id: roomId,
      name: roomName.trim(),
      description: 'Custom room',
    }

    setRooms((currentRooms) => [...currentRooms, newRoom])
    setCurrentRoomId(newRoom.id)
    socket.emit(SOCKET_EVENTS.CREATE_ROOM, newRoom)

    if (connected) {
      socket.emit(SOCKET_EVENTS.JOIN_ROOM, newRoom.id)
    }
  }

  function handleSendMessage(text) {
    socket.emit(SOCKET_EVENTS.SEND_MESSAGE, {
      text,
      sender: username,
      roomId: currentRoomId,
    })
  }

  function handleTyping(action) {
    if (action === 'start') {
      socket.emit(SOCKET_EVENTS.TYPING_START, {
        sender: username,
        roomId: currentRoomId,
      })
    } else if (action === 'stop') {
      socket.emit(SOCKET_EVENTS.TYPING_STOP, {
        roomId: currentRoomId,
      })
    }
  }

  function handleSetUsername(newUsername) {
    setUsername(newUsername)
  }

  return (
    <>
      {!username && <UsernameModal onConfirm={handleSetUsername} />}
      <main className="grid h-screen min-h-[640px] bg-[#313338] text-zinc-100 md:min-h-screen md:grid-cols-[280px_minmax(0,1fr)]">
        <RoomSidebar
          currentRoomId={currentRoomId}
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
          onLogout={onLogout}
          rooms={rooms}
          user={user}
        />
        <section
          className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)_auto]"
          aria-label="Chat room"
        >
          <ChatHeader room={currentRoom} userCount={userCount} />
          <MessageList messages={messages} room={currentRoom} typingUsers={typingUsers} />
          <MessageInput
            connected={connected}
            onSendMessage={handleSendMessage}
            onTyping={handleTyping}
            roomName={currentRoom.name}
          />
        </section>
      </main>
    </>
  )
}

export default ChatLayout
