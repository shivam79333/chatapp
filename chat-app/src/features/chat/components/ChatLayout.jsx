import { useEffect, useState } from 'react'
import { DEFAULT_ROOMS } from '../../../../shared/constants/rooms'
import ChatHeader from './ChatHeader'
import MessageInput from './MessageInput'
import MessageList from './MessageList'
import RoomSidebar from './RoomSidebar'
import UsernameModal from './UsernameModal'
import {
  createRoomForUser,
  ensureDefaultRoomsForUser,
  ensureUserInRoom,
  sendRoomMessage,
  subscribeToRoomMessages,
  subscribeToUserRooms,
} from '../services/chatFirestore'

function createRoomId(name) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function buildUserIdentity(user, username) {
  if (!user?.uid) {
    return null
  }

  const fallbackName = username || user.displayName || user.email?.split('@')[0] || 'User'

  return {
    uid: user.uid,
    userName: fallbackName,
    userDisplayName: user.displayName || fallbackName,
    email: user.email || '',
  }
}

function ChatLayout({ user, onLogout }) {
  const [username, setUsername] = useState(
    user?.displayName || user?.email?.split('@')[0] || ''
  )
  const [rooms, setRooms] = useState(DEFAULT_ROOMS)
  const [currentRoomId, setCurrentRoomId] = useState('general')
  const [messagesByRoom, setMessagesByRoom] = useState({})
  const [userCountByRoom, setUserCountByRoom] = useState({})
  const connected = Boolean(user?.uid)

  const currentRoom =
    rooms.find((room) => room.id === currentRoomId) || DEFAULT_ROOMS[0]
  const messages = messagesByRoom[currentRoomId] || []
  const typingUsers = []
  const userCount = userCountByRoom[currentRoomId] || 1

  useEffect(() => {
    const identity = buildUserIdentity(user, username)
    if (!identity) {
      return undefined
    }

    ensureDefaultRoomsForUser(identity).catch((error) => {
      console.error(`Failed to initialize default rooms for ${identity.uid}:`, error)
    })

    const unsubscribe = subscribeToUserRooms(identity.uid, (userRooms) => {
      const uniqueRooms = new Map()

      DEFAULT_ROOMS.forEach((room) => {
        uniqueRooms.set(room.id, room)
      })

      userRooms.forEach((room) => {
        uniqueRooms.set(room.id, {
          id: room.id,
          name: room.name || room.id,
          description: room.description || 'User room',
        })
      })

      const nextRooms = Array.from(uniqueRooms.values())
      setRooms(nextRooms)
      setCurrentRoomId((previousRoomId) => {
        if (nextRooms.some((room) => room.id === previousRoomId)) {
          return previousRoomId
        }

        return nextRooms[0]?.id || 'general'
      })
      setUserCountByRoom((previousCounts) => {
        const nextCounts = { ...previousCounts }

        userRooms.forEach((room) => {
          nextCounts[room.id] = room.memberCount || 0
        })

        DEFAULT_ROOMS.forEach((room) => {
          if (!nextCounts[room.id]) {
            nextCounts[room.id] = 1
          }
        })

        return nextCounts
      })
    })

    return () => {
      unsubscribe()
    }
  }, [user, username])

  useEffect(() => {
    const identity = buildUserIdentity(user, username)
    if (!identity || !currentRoomId) {
      return undefined
    }

    ensureUserInRoom(currentRoomId, identity).catch((error) => {
      console.error(`Failed to join room ${currentRoomId} for ${identity.uid}:`, error)
    })

    const unsubscribe = subscribeToRoomMessages(currentRoomId, (roomMessages) => {
      setMessagesByRoom((currentMessages) => ({
        ...currentMessages,
        [currentRoomId]: roomMessages.map((message) => ({
          ...message,
          isOwn: message.senderId === identity.uid,
        })),
      }))
    })

    return () => {
      unsubscribe()
    }
  }, [currentRoomId, user, username])

  function handleJoinRoom(roomId) {
    setCurrentRoomId(roomId)

    const identity = buildUserIdentity(user, username)
    if (!identity) {
      return
    }

    ensureUserInRoom(roomId, identity).catch((error) => {
      console.error(`Failed to join room ${roomId} for ${identity.uid}:`, error)
    })
  }

  async function handleCreateRoom(roomName) {
    const roomId = createRoomId(roomName)
    const identity = buildUserIdentity(user, username)

    if (!identity || !roomId || rooms.some((room) => room.id === roomId)) {
      return
    }

    const newRoom = {
      id: roomId,
      name: roomName.trim(),
      description: 'Custom room',
    }

    try {
      await createRoomForUser(newRoom, identity)
      setCurrentRoomId(newRoom.id)
    } catch (error) {
      console.error(`Failed to create room ${newRoom.id}:`, error)
    }
  }

  async function handleSendMessage(text) {
    const identity = buildUserIdentity(user, username)
    if (!identity) {
      return
    }

    try {
      await sendRoomMessage({
        text,
        roomId: currentRoomId,
        sender: identity.userDisplayName,
        senderId: identity.uid,
      })
    } catch (error) {
      console.error(`Failed to send message in room ${currentRoomId}:`, error)
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
            roomName={currentRoom.name}
          />
        </section>
      </main>
    </>
  )
}

export default ChatLayout
