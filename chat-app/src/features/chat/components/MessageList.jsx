import { useEffect, useRef } from 'react'
import MessageBubble from './MessageBubble'

function MessageList({ messages, room }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView()
  }, [messages])

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
            This is a static Discord-like layout. The message list is an
            auto-scroll container, ready for realtime messages later.
          </p>
        </div>

        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {messages.length === 0 && (
          <p className="rounded-md bg-zinc-950/10 px-3 py-2 text-sm text-zinc-400">
            No messages yet. Start the backend, open this app in two tabs, and
            send a message.
          </p>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  )
}

export default MessageList
