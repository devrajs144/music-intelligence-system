import json
import os

RAW_DIR = "data/raw"
PROCESSED_DIR = "data/processed"

def load_json(filename):
    path = os.path.join(RAW_DIR, filename)
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def get_track_ids_with_rank(track_items):
    """Returns {track_id: rank} where rank starts at 1 (best)."""
    result = {}
    for i, item in enumerate(track_items):
        track = item.get("track", item)
        tid = track.get("id")
        if tid:
            result[tid] = i + 1  # rank position, 1-indexed
    return result

def get_track_lookup(track_items):
    """Returns {track_id: {name, artist}} for display purposes."""
    lookup = {}
    for item in track_items:
        track = item.get("track", item)
        tid = track.get("id")
        if tid:
            lookup[tid] = {
                "name": track.get("name"),
                "artist": track["artists"][0]["name"] if track.get("artists") else "Unknown"
            }
    return lookup

def historical_strength(rank, list_size=50):
    """Rank 1 -> ~1.0, rank 50 -> ~0.02. Higher rank position = weaker signal."""
    return round((list_size - rank + 1) / list_size, 3)

def calculate_rediscovery_scores():
    top_short = load_json("top_tracks_short_term.json")
    top_medium = load_json("top_tracks_medium_term.json")
    top_long = load_json("top_tracks_long_term.json")
    recent = load_json("recently_played.json")

    short_ids = set(get_track_ids_with_rank(top_short).keys())
    recent_ids = set(get_track_ids_with_rank(recent).keys())
    medium_ranks = get_track_ids_with_rank(top_medium)
    long_ranks = get_track_ids_with_rank(top_long)

    # Combine lookups for display info (name/artist), preferring long_term data
    lookup = {}
    lookup.update(get_track_lookup(top_medium))
    lookup.update(get_track_lookup(top_long))

    # Candidate pool: anything in medium_term OR long_term
    candidate_ids = set(medium_ranks.keys()) | set(long_ranks.keys())

    scored = []
    for tid in candidate_ids:
        # Hard exclusion rules
        if tid in short_ids:
            continue  # currently a favorite, nothing to rediscover
        if tid in recent_ids:
            continue  # you're already playing it

        in_medium = tid in medium_ranks
        in_long = tid in long_ranks

        # Persistence score (weight 0.5) — your top priority
        if in_medium and in_long:
            persistence = 1.0
        elif in_long:
            persistence = 0.6
        else:  # only medium
            persistence = 0.4

        # Historical strength (weight 0.3) — best rank across whichever lists it's in
        strengths = []
        if in_long:
            strengths.append(historical_strength(long_ranks[tid]))
        if in_medium:
            strengths.append(historical_strength(medium_ranks[tid]))
        hist_strength = max(strengths)

        # Absence duration proxy (weight 0.2)
        # In long_term but NOT medium_term = implies a longer gap since it mattered
        if in_long and not in_medium:
            absence_proxy = 1.0
        elif in_long and in_medium:
            absence_proxy = 0.5
        else:  # only medium, recent-ish drop-off
            absence_proxy = 0.3

        score = round(
            (0.5 * persistence) + (0.3 * hist_strength) + (0.2 * absence_proxy),
            3
        )

        info = lookup.get(tid, {"name": "Unknown", "artist": "Unknown"})
        scored.append({
            "track_id": tid,
            "track_name": info["name"],
            "artist_name": info["artist"],
            "rediscovery_score": score,
            "persistence": persistence,
            "historical_strength": hist_strength,
            "absence_proxy": absence_proxy
        })

    scored.sort(key=lambda x: x["rediscovery_score"], reverse=True)
    return scored

def main():
    results = calculate_rediscovery_scores()

    print("===== You Forgot These — Top 10 Rediscovery Candidates =====\n")
    for i, song in enumerate(results[:10], 1):
        print(f"{i}. {song['track_name']} — {song['artist_name']}")
        print(f"   Rediscovery Score: {song['rediscovery_score']}  "
              f"(persistence={song['persistence']}, strength={song['historical_strength']}, absence={song['absence_proxy']})")

    os.makedirs(PROCESSED_DIR, exist_ok=True)
    with open(os.path.join(PROCESSED_DIR, "rediscovery_scores.json"), "w") as f:
        json.dump(results, f, indent=2)

    print(f"\nTotal candidates found: {len(results)}")
    print(f"Saved full results to {PROCESSED_DIR}/rediscovery_scores.json")

if __name__ == "__main__":
    main()