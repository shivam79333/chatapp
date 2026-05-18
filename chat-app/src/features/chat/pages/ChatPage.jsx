import ChatLayout from '../components/ChatLayout'

function ChatPage({ username, onNeedUsername }) {
  return <ChatLayout username={username} onNeedUsername={onNeedUsername} />
}

export default ChatPage
