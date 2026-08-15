import { useState, useEffect } from 'react'

function Bubble() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/bubble', { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('Failed to load Bubble data')
        return res.json()
      })
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Music Bubble</h1>
        <p className="text-neutral-400 mb-8">How concentrated your listening is, and artists just outside your usual rotation.</p>

        {loading && <p className="text-neutral-400">Loading...</p>}
        {error && <p className="text-red-400">Error: {error}</p>}

        {data && (
          <>
            <div className="bg-neutral-900 rounded-xl p-5 border border-neutral-800 mb-8">
              <p className="text-sm text-neutral-400 mb-1">Bubble radius</p>
              <p className="text-2xl font-bold mb-2">{data.bubble_stats.bubble_radius} artists</p>
              <p className="text-sm text-neutral-300">
                account for ~80% of your listening, out of {data.bubble_stats.total_unique_artists} total unique artists.
              </p>
            </div>

            <h2 className="text-lg font-semibold mb-3">Adjacent Artists</h2>
            <div className="space-y-3">
              {data.adjacent_artists.map((artist, i) => (
                <div key={artist.artist_name} className="bg-neutral-900 rounded-xl p-4 border border-neutral-800 flex items-center justify-between">
                  <p className="font-medium">{i + 1}. {artist.artist_name}</p>
                  <span className="text-lg font-bold text-green-400">{artist.adjacency_score}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Bubble