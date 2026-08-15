import { useState, useEffect } from 'react'

function Memory() {
  const [candidates, setCandidates] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/memory', { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('Failed to load Rediscovery data')
        return res.json()
      })
      .then(data => setCandidates(data.candidates.slice(0, 10)))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Spotify Memory</h1>
        <p className="text-neutral-400 mb-8">Songs you used to love, ranked by how likely you are to enjoy them again.</p>

        {loading && <p className="text-neutral-400">Loading...</p>}
        {error && <p className="text-red-400">Error: {error}</p>}

        <div className="space-y-3">
          {candidates.map((song, i) => (
            <div key={song.track_id} className="bg-neutral-900 rounded-xl p-4 border border-neutral-800 flex items-center justify-between">
              <div>
                <p className="font-medium">{i + 1}. {song.track_name}</p>
                <p className="text-sm text-neutral-400">{song.artist_name}</p>
              </div>
              <span className="text-lg font-bold text-green-400">{song.rediscovery_score}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Memory
