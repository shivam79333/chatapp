import { useState } from 'react'
import ChatPage from '../features/chat/pages/ChatPage'

function App() {
  const [username, setUsername] = useState(null)

  if (!username) {
    return <ChatPage onNeedUsername={setUsername} />
  }

  return <ChatPage username={username} />
}

export default App
