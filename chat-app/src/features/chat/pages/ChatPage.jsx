import ChatLayout from '../components/ChatLayout'
import { logOut } from '../../../lib/authService'

function ChatPage({ user }) {
  async function handleLogout() {
    await logOut()
  }

  return <ChatLayout user={user} onLogout={handleLogout} />
}

export default ChatPage
