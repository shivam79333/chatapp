function MessageBubble({ message }) {
  const initials = message.initials || message.sender.slice(0, 2).toUpperCase()
  const createdAt = message.createdAt ? new Date(message.createdAt) : new Date()
  const time =
    message.time ||
    new Intl.DateTimeFormat('en', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(createdAt)
  const accentClass = message.accentClass || 'bg-indigo-500'

  return (
    <article
      className={`flex gap-3 rounded-md px-2 py-1.5 transition hover:bg-zinc-950/10 ${
        message.isOwn ? 'sm:bg-zinc-950/10' : ''
      }`}
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${accentClass} text-xs font-bold text-white shadow-sm`}
      >
        {initials}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-2">
          <h3 className="font-semibold text-white">{message.sender}</h3>
          <time className="text-xs text-zinc-500">{time}</time>
        </div>
        <p className="mt-1 text-sm leading-6 text-zinc-300">{message.text}</p>
      </div>
    </article>
  )
}

export default MessageBubble
