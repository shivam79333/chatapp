import { useState } from 'react'
import RoomItem from './RoomItem'

function RoomSidebar({ currentRoomId, onCreateRoom, onJoinRoom, rooms }) {
  const [roomName, setRoomName] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    const trimmedRoomName = roomName.trim()

    if (!trimmedRoomName) {
      return
    }

    onCreateRoom(trimmedRoomName)
    setRoomName('')
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
          Static
        </span>
      </div>

      <nav className="grid grid-cols-3 gap-1 overflow-x-auto md:grid-cols-1 md:overflow-visible">
        {rooms.map((room) => (
          <RoomItem
            active={room.id === currentRoomId}
            key={room.id}
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
          placeholder="Create room"
          type="text"
          value={roomName}
        />
        <button
          className="rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!roomName.trim()}
          type="submit"
        >
          Create Room
        </button>
      </form>

      <div className="mt-auto hidden rounded-md bg-[#232428] p-3 md:block">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-500 text-xs font-bold text-white">
            GU
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">
              Guest User
            </p>
            <p className="truncate text-xs text-zinc-400">
              Login comes later
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}

export default RoomSidebar
