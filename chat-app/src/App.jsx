import { useState } from 'react'

export default function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="bg-white rounded-lg shadow-2xl p-8 text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Chat App</h1>
        <p className="text-gray-600 mb-6">React is working! ✅</p>
        <button 
          onClick={() => setCount(count + 1)}
          className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600"
        >
          Click me: {count}
        </button>
      </div>
    </div>
  )
}