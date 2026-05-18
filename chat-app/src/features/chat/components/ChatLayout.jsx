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

function ChatLayout({ username: initialUsername, onNeedUsername }) {
  const socket = useMemo(() => createChatSocket(), [])
  const [username, setUsername] = useState(initialUsername)
  const [rooms, setRooms] = useState(DEFAULT_ROOMS)
  const [currentRoomId, setCurrentRoomId] = useState('general')
  const [messagesByRoom, setMessagesByRoom] = useState({})
  const [connected, setConnected] = useState(false)

  const currentRoom =
    rooms.find((room) => room.id === currentRoomId) || DEFAULT_ROOMS[0]
  const messages = messagesByRoom[currentRoomId] || []

  useEffect(() => {
    socket.connect()

    socket.on(SOCKET_EVENTS.CONNECT, () => {
      setConnected(true)
    })

    socket.on(SOCKET_EVENTS.DISCONNECT, () => {
      setConnected(false)
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

    return () => {
      socket.off(SOCKET_EVENTS.CONNECT)
      socket.off(SOCKET_EVENTS.DISCONNECT)
      socket.off(SOCKET_EVENTS.RECEIVE_MESSAGE)
      socket.off(SOCKET_EVENTS.MESSAGE_HISTORY)
      socket.off(SOCKET_EVENTS.ROOM_CREATED)
      socket.disconnect()
    }
  }, [socket])

  useEffect(() => {
    if (connected) {
      socket.emit(SOCKET_EVENTS.JOIN_ROOM, currentRoomId)
    }
  }, [connected, currentRoomId, socket])

  function handleJoinRoom(roomId) {
    setCurrentRoomId(roomId)

    if (connected) {
      socket.emit(SOCKET_EVENTS.JOIN_ROOM, roomId)
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
          rooms={rooms}
        />
        <section
          className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)_auto]"
          aria-label="Chat room"
        >
          <ChatHeader room={currentRoom} />
          <MessageList messages={messages} room={currentRoom} />
          <MessageInput
            connected={connected}
            onSendMessage={handleSendMessage}
            roomName={currentRoom.name}
          />
        </section>
      </main>
    </>
  )
}

export default ChatLayout
