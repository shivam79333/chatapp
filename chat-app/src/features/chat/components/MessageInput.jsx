import { useState, useRef } from 'react'

function MessageInput({ connected, onSendMessage, onTyping, roomName }) {
  const [message, setMessage] = useState('')
  const typingTimeoutRef = useRef(null)

  function handleSubmit(event) {
    event.preventDefault()

    const trimmedMessage = message.trim()

    if (!trimmedMessage || !connected) {
      return
    }

    onSendMessage(trimmedMessage)
    setMessage('')
    if (onTyping) {
      onTyping('stop')
    }
  }

  function handleMessageChange(event) {
    const newMessage = event.target.value
    setMessage(newMessage)

    console.log('[MessageInput] handleMessageChange called', { newMessage: newMessage.trim(), hasOnTyping: !!onTyping })

    if (newMessage.trim() && onTyping) {
      console.log('[MessageInput] Calling onTyping(start)')
      onTyping('start')
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
      typingTimeoutRef.current = setTimeout(() => {
        if (onTyping) {
          console.log('[MessageInput] Timeout - calling onTyping(stop)')
          onTyping('stop')
        }
      }, 3000)
    } else if (!newMessage.trim() && onTyping) {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
      console.log('[MessageInput] Empty message - calling onTyping(stop)')
      onTyping('stop')
    }
  }

  return (
    <form
      className="border-t border-zinc-950/40 bg-[#313338] px-3 py-3 sm:px-5 sm:py-4"
      onSubmit={handleSubmit}
    >
      <div className="mx-auto flex max-w-4xl gap-2 sm:gap-3">
        <input
          className="min-w-0 flex-1 rounded-md border border-transparent bg-[#383a40] px-4 py-3 text-sm text-zinc-200 outline-none placeholder:text-zinc-500 focus:border-indigo-400 disabled:cursor-not-allowed disabled:opacity-70"
          aria-label="Message"
          disabled={!connected}
          onChange={handleMessageChange}
          placeholder={
            connected ? `Message #${roomName}` : 'Connecting to backend...'
          }
          type="text"
          value={message}
        />
        <button
          className="rounded-md bg-indigo-500 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!connected || !message.trim()}
          type="submit"
        >
          Send
        </button>
      </div>
    </form>
  )
}

export default MessageInput
