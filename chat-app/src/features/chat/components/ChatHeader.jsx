function ChatHeader({ room, userCount = 0 }) {
  return (
    <header className="flex min-w-0 items-center justify-between gap-3 border-b border-zinc-950/40 bg-[#313338] px-4 py-3 sm:px-5">
      <div className="min-w-0">
        <div className="flex min-w-0 items-center gap-2">
          <span className="text-xl font-semibold text-zinc-400">#</span>
          <h1 className="truncate text-base font-bold text-white sm:text-lg">
            {room.name}
          </h1>
        </div>
        <p className="mt-0.5 truncate text-xs text-zinc-400 sm:text-sm">
          {room.description}
        </p>
      </div>

      <div className="hidden shrink-0 items-center gap-2 rounded-full bg-[#232428] px-3 py-1.5 text-xs font-semibold text-zinc-300 sm:flex">
        <span className="h-2 w-2 rounded-full bg-emerald-400" />
        {userCount || 1} online
      </div>
    </header>
  )
}

export default ChatHeader
