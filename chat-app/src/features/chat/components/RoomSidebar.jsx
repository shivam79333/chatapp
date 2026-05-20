import { useMemo, useState } from 'react'
import RoomItem from './RoomItem'
import { deleteRoom } from '../services/chatFirestore'

function RoomSidebar({
  currentRoomId,
  onCreateRoom,
  onJoinRoom,
  onLogout,
  rooms,
  user,
}) {
  const [roomName, setRoomName] = useState('')
  const fullName = user?.displayName?.trim() || user?.email || 'User'
  const initials = useMemo(() => {
    const words = fullName.split(' ').filter(Boolean)
    if (words.length === 0) {
      return 'U'
    }

    return words
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase() || '')
      .join('')
  }, [fullName])

  function handleSubmit(event) {
    event.preventDefault()
    const trimmedRoomName = roomName.trim()

    if (!trimmedRoomName) {
      return
    }

    onCreateRoom(trimmedRoomName)
    setRoomName('')
  }

  async function handleDeleteRoom(roomId) {
    try {
      await deleteRoom(roomId)
      if (currentRoomId === roomId) {
        onJoinRoom('general')
      }
    } catch (error) {
      console.error(`Failed to delete room ${roomId}:`, error)
    }
  }

  return (
    <aside
      className="flex min-h-0 flex-col gap-4 border-b border-zinc-950/40 bg-[#2b2d31] px-3 py-3 md:border-b-0 md:border-r md:px-4 md:py-5"
      aria-label="Available rooms"
    >
      <div className="flex items-center justify-between gap-3 md:block">
        <div>
          <p className="text-xs font-semibold uppercase text-zinc-400">
            Chat App
          </p>
          <h2 className="mt-1 text-lg font-bold text-white md:text-xl">
            Rooms
          </h2>
        </div>
        <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-300 md:hidden">
          Live
        </span>
      </div>

      <nav className="grid grid-cols-3 gap-1 overflow-x-auto md:grid-cols-1 md:overflow-visible">
        {rooms.map((room) => (
          <RoomItem
            active={room.id === currentRoomId}
            key={room.id}
            onDelete={handleDeleteRoom}
            onClick={() => onJoinRoom(room.id)}
            room={room}
          />
        ))}
      </nav>

      <form className="grid gap-2" onSubmit={handleSubmit}>
        <input
          className="min-w-0 rounded-md border border-zinc-700 bg-[#1e1f22] px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-indigo-400"
          aria-label="New room name"
            onChange={(event) => setRoomName(event.target.value)}
            placeholder="Enter room name"
          type="text"
          value={roomName}
        />
        <button
          className="rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!roomName.trim()}
          type="submit"
        >
          Join/Create Room
        </button>
      </form>

      <div className="mt-auto hidden rounded-md bg-[#232428] p-3 md:block">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-500 text-xs font-bold text-white">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">
              {fullName}
            </p>
            <p className="truncate text-xs text-zinc-400">
              {user?.email || 'Signed in'}
            </p>
          </div>
        </div>
        <button
          className="mt-3 w-full rounded-md bg-zinc-800 px-3 py-2 text-sm font-semibold text-zinc-100 transition hover:bg-zinc-700"
          onClick={onLogout}
          type="button"
        >
          Logout
        </button>
      </div>
    </aside>
  )
}

export default RoomSidebar
