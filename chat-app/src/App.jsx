import { useState } from 'react'
import { AuthProvider, useAuth } from './features/chat/hooks/useAuth'
import ChatPage from './features/chat/pages/ChatPage'
import LoginPage from './features/chat/pages/LoginPage'
import SignUpPage from './features/chat/pages/SignUpPage'

function AppContent() {
  const { user, loading, isAuthenticated } = useAuth()
  const [currentPage, setCurrentPage] = useState('chat')

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return currentPage === 'login' ? (
      <LoginPage />
    ) : (
      <SignUpPage />
    )
  }

  return <ChatPage user={user} />
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App