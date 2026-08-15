import { useState, useEffect } from 'react'

function App() {
  const [authStatus, setAuthStatus] = useState(null)

  useEffect(() => {
    fetch('http://127.0.0.1:8000/auth/me', { credentials: 'include' })
      .then(res => res.json())
      .then(data => setAuthStatus(data))
      .catch(() => setAuthStatus({ authenticated: false }))
  }, [])

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Music Intelligence System</h1>
        {authStatus === null && <p className="text-neutral-400">Checking connection...</p>}
        {authStatus?.authenticated && (
          <p className="text-green-400">Connected as {authStatus.display_name}</p>
        )}
        {authStatus && !authStatus.authenticated && (
          <a href="http://127.0.0.1:8000/auth/login" className="inline-block bg-green-500 hover:bg-green-400 text-black font-semibold px-6 py-3 rounded-full transition">
            Connect Spotify
          </a>
        )}
      </div>
    </div>
  )
}

export default App