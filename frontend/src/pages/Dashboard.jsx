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
      </div>
    </div>
  );
}

export default Dashboard;
