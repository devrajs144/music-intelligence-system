import { useState, useEffect } from "react";

function DnaCard({ label, data }) {
  if (!data) return null;
  return (
    <div className="bg-neutral-900 rounded-xl p-5 border border-neutral-800">
      <div className="flex items-baseline justify-between mb-2">
        <h3 className="text-sm font-medium text-neutral-400 uppercase tracking-wide">
          {label}
        </h3>
        {data.score !== null && data.score !== undefined && (
          <span className="text-2xl font-bold">{data.score}</span>
        )}
      </div>
      <p className="text-sm text-neutral-300">{data.explanation}</p>
    </div>
  );
}

function Dashboard() {
  const [dna, setDna] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [playlistStatus, setPlaylistStatus] = useState(null);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/dna", { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load Music DNA");
        return res.json();
      })
      .then((data) => setDna(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function handleGeneratePlaylist() {
    setPlaylistStatus("loading");
    fetch("http://127.0.0.1:8000/api/playlist", {
      method: "POST",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setPlaylistStatus({ error: data.error });
        } else {
          setPlaylistStatus(data);
        }
      })
      .catch(() =>
        setPlaylistStatus({
          error: "Something went wrong generating the playlist.",
        }),
      );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">Your Music DNA</h1>

        {loading && <p className="text-neutral-400">Loading your profile...</p>}
        {error && <p className="text-red-400">Error: {error}</p>}

        {dna && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DnaCard label="Artist Diversity" data={dna.artist_diversity} />
            <DnaCard label="Discovery Rate" data={dna.discovery_rate} />
            <DnaCard label="Repetition Rate" data={dna.repetition_rate} />
            <DnaCard label="Nostalgia Score" data={dna.nostalgia_score} />
            <DnaCard
              label="Mainstream Tendency"
              data={dna.mainstream_tendency}
            />
            <DnaCard label="Bubble Radius" data={dna.bubble_radius} />
            <DnaCard
              label="Top 5 Concentration"
              data={dna.top5_artist_concentration_pct}
            />
          </div>
        )}

        <div className="mt-8 bg-neutral-900 rounded-xl p-6 border border-neutral-800">
          <h2 className="text-lg font-semibold mb-2">Generate a Playlist</h2>
          <p className="text-sm text-neutral-400 mb-4">
            Half forgotten favorites, half artists just outside your bubble — 20
            tracks, shuffled.
          </p>

          <button
            onClick={handleGeneratePlaylist}
            disabled={playlistStatus === "loading"}
            className="bg-green-500 hover:bg-green-400 disabled:bg-neutral-700 disabled:cursor-not-allowed text-black font-semibold px-6 py-3 rounded-full transition"
          >
            {playlistStatus === "loading"
              ? "Generating..."
              : "Generate Playlist"}
          </button>

          {playlistStatus &&
            playlistStatus !== "loading" &&
            playlistStatus.url && (
              <div className="mt-4 p-4 bg-neutral-800 rounded-lg">
                <p className="text-green-400 font-medium mb-1">
                  Created: {playlistStatus.name}
                </p>
                <p className="text-sm text-neutral-400 mb-2">
                  {playlistStatus.track_count} tracks
                </p>
                <a
                  href={playlistStatus.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-green-400 underline hover:text-green-300"
                >
                  Open in Spotify →
                </a>
              </div>
            )}

          {playlistStatus?.error && (
            <p className="mt-4 text-red-400 text-sm">
              Error: {playlistStatus.error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
