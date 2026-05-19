function RoomItem({ room, active, onDelete, onClick }) {
  function handleDelete(event) {
    event.stopPropagation()
    if (window.confirm(`Delete room "${room.name}"? This cannot be undone.`)) {
      onDelete(room.id)
    }
  }

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
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold">
          {room.name.toLowerCase()}
        </span>
        <small className="block truncate text-xs text-zinc-500 group-hover:text-zinc-400">
          {room.description}
        </small>
      </span>
      <button
        className="hidden rounded px-2 py-1 text-xs font-medium text-zinc-400 transition hover:bg-red-500/20 hover:text-red-400 group-hover:block"
        onClick={handleDelete}
        title="Delete room"
        type="button"
      >
        ✕
      </button>
    </button>
  )
}

export default RoomItem
