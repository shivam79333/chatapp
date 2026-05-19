import { useEffect, useRef } from 'react'
import MessageBubble from './MessageBubble'

function MessageList({ messages, room, typingUsers }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView()
  }, [messages, typingUsers])

  return (
    <div className="min-h-0 overflow-y-auto px-3 py-5 sm:px-5 sm:py-6">
      <div className="mx-auto flex min-h-full max-w-4xl flex-col justify-end gap-4">
        <div className="border-b border-zinc-700/70 pb-5">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-zinc-700 text-2xl font-bold sm:h-16 sm:w-16">
            #
          </div>
          <h2 className="text-xl font-bold text-white sm:text-2xl">
            Welcome to #{room.name.toLowerCase()}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
            Messages in this room are synced in real time and stored in Firestore.
          </p>
        </div>

        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {typingUsers && typingUsers.length > 0 && (
          <div className="flex gap-3 rounded-md px-2 py-1.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-600 text-xs font-bold text-white">
              ✎
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-2">
                <h3 className="text-sm font-semibold text-zinc-300">
                  {typingUsers.map((u) => u.displayName).join(', ')}
                </h3>
                <span className="text-xs text-zinc-500">
                  {typingUsers.length === 1 ? 'is' : 'are'} typing...
                </span>
              </div>
            </div>
          </div>
        )}

        {messages.length === 0 && (!typingUsers || typingUsers.length === 0) && (
          <p className="rounded-md bg-zinc-950/10 px-3 py-2 text-sm text-zinc-400">
            No messages yet. Send one to start this room history.
          </p>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  )
}

export default MessageList
