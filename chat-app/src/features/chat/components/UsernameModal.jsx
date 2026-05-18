import { useState } from 'react'

function UsernameModal({ onConfirm }) {
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    const trimmedUsername = username.trim()

    if (!trimmedUsername) {
      setError('Username cannot be empty')
      return
    }

    if (trimmedUsername.length > 30) {
      setError('Username must be 30 characters or less')
      return
    }

    onConfirm(trimmedUsername)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-sm rounded-lg bg-[#313338] p-6 text-white shadow-lg">
        <h1 className="mb-2 text-2xl font-bold">Welcome</h1>
        <p className="mb-6 text-sm text-zinc-400">
          Enter a username to get started
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              className="w-full rounded-md border border-transparent bg-[#383a40] px-4 py-3 text-sm text-zinc-200 outline-none placeholder:text-zinc-500 focus:border-indigo-400"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value)
                setError('')
              }}
              maxLength="30"
              autoFocus
            />
            <p className="mt-1 text-xs text-zinc-500">
              {username.length}/30 characters
            </p>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            className="w-full rounded-md bg-indigo-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-600 disabled:opacity-50"
            disabled={!username.trim()}
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  )
}

export default UsernameModal
