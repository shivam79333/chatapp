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

  if (message.isOwn) {
    return (
      <article className="flex justify-end gap-3">
        <div className="max-w-xs">
          <div className="flex flex-col items-end">
            <div className="rounded-lg bg-indigo-600 px-4 py-2">
              <p className="text-sm leading-6 text-white">{message.text}</p>
            </div>
            <time className="mt-1 text-xs text-zinc-500">{time}</time>
          </div>
        </div>
      </article>
    )
  }

  return (
    <article className="flex gap-3">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${accentClass} text-xs font-bold text-white shadow-sm`}
      >
        {initials}
      </div>

      <div className="min-w-0 max-w-xs">
        <div className="flex flex-wrap items-baseline gap-2">
          <h3 className="font-semibold text-white">{message.sender}</h3>
          <time className="text-xs text-zinc-500">{time}</time>
        </div>
        <div className="mt-1 rounded-lg bg-zinc-700 px-4 py-2">
          <p className="text-sm leading-6 text-zinc-100">{message.text}</p>
        </div>
      </div>
    </article>
  )
}

export default MessageBubble
