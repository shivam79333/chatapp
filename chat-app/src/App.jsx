import { useState } from 'react'
import { AuthProvider, useAuth } from './features/chat/hooks/useAuth'
import ChatPage from './features/chat/pages/ChatPage'
import LoginPage from './features/chat/pages/LoginPage'
import SignUpPage from './features/chat/pages/SignUpPage'

function AppContent() {
  const { user, loading, isAuthenticated, error } = useAuth()
  const [currentPage, setCurrentPage] = useState('signup')

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Configuration Error</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <p className="text-sm text-gray-500 mb-4">
            Please add your Firebase credentials to the <code className="bg-gray-100 px-2 py-1 rounded">.env</code> file
          </p>
        </div>
      </div>
    )
  }

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
      <LoginPage onSwitchToSignUp={() => setCurrentPage('signup')} />
    ) : (
      <SignUpPage onSwitchToLogin={() => setCurrentPage('login')} />
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