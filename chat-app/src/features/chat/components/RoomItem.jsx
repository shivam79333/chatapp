function RoomItem({ room, active, onClick }) {
  return (
    <button
      className={`group flex w-full items-center gap-2 rounded-md px-3 py-2 text-left transition ${
        active
          ? 'bg-zinc-700 text-white'
          : 'text-zinc-400 hover:bg-zinc-700/60 hover:text-zinc-100'
      }`}
      onClick={onClick}
      type="button"
    >
      <span className="text-lg leading-none text-zinc-500 group-hover:text-zinc-300">
        #
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold">
          {room.name.toLowerCase()}
        </span>
        <small className="block truncate text-xs text-zinc-500 group-hover:text-zinc-400">
          {room.description}
        </small>
      </span>
    </button>
  )
}

export default RoomItem
