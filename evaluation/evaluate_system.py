import json
import os

PROCESSED_DIR = "data/processed"

def load_json(filename):
    with open(os.path.join(PROCESSED_DIR, filename), "r", encoding="utf-8") as f:
        return json.load(f)

def evaluate_rediscovery():
    print("===== Evaluating Spotify Memory (Rediscovery) =====\n")
    data = load_json("rediscovery_scores.json")
    scores = [s["rediscovery_score"] for s in data]

    print(f"Total candidates: {len(scores)}")
    print(f"Score range: {min(scores)} to {max(scores)}")
    print(f"Score spread (max-min): {round(max(scores) - min(scores), 3)}")
    print("  (A wide spread means the score is meaningfully discriminating between candidates,")
    print("   not just assigning everyone a similar value.)\n")

    # Self-rated hit rate — genuine human judgment, not fake automation
    print("Top 10 candidates for your review:")
    for i, song in enumerate(data[:10], 1):
        print(f"  {i}. {song['track_name']} — {song['artist_name']} (score: {song['rediscovery_score']})")

    print("\nFor how many of these 10 would you genuinely say 'yes, I forgot about this and I'm glad to be reminded'?")
    try:
        hits = int(input("Enter a number 0-10: "))
        hit_rate = round(hits / 10, 2)
        print(f"\nSelf-rated Hit Rate@10: {hit_rate}")
        return {"total_candidates": len(scores), "score_spread": round(max(scores) - min(scores), 3),
                "self_rated_hit_rate_at_10": hit_rate}
    except (ValueError, EOFError):
        print("\nSkipped self-rating (no valid input).")
        return {"total_candidates": len(scores), "score_spread": round(max(scores) - min(scores), 3),
                "self_rated_hit_rate_at_10": None}

def evaluate_bubble():
    print("\n===== Evaluating Music Bubble Detector =====\n")
    data = load_json("bubble_analysis.json")
    stats = data["bubble_stats"]
    adjacent = data["adjacent_artists"]

    total_artists = stats["total_unique_artists"]
    radius = stats["bubble_radius"]
    concentration_ratio = round(radius / total_artists, 3)

    print(f"Total unique artists: {total_artists}")
    print(f"Bubble radius (artists for 80% of listening): {radius}")
    print(f"Concentration ratio: {concentration_ratio}")
    print("  (Lower = more concentrated/tight bubble. Higher = more spread out/loose bubble.)\n")

    core_names = set(name for name, _ in stats["top_5_artists"])
    adjacent_names = set(a["artist_name"] for a in adjacent)
    overlap = core_names & adjacent_names

    print(f"Correctness check — Adjacent artists overlapping with Top 5 core: {len(overlap)}")
    print(f"  (Should always be 0 — Adjacent must never include your core artists)")

    return {
        "total_unique_artists": total_artists,
        "bubble_radius": radius,
        "concentration_ratio": concentration_ratio,
        "core_adjacent_overlap_count": len(overlap)
    }

def evaluate_music_dna():
    print("\n===== Evaluating Music DNA Consistency =====\n")
    dna = load_json("music_dna.json")

    discovery = dna["discovery_rate"]["score"]
    nostalgia = dna["nostalgia_score"]["score"]

    print(f"Discovery Rate: {discovery}")
    print(f"Nostalgia Score: {nostalgia}")
    print(f"Sum: {round(discovery + nostalgia, 3)}")
    print("  (These measure related-but-distinct things: Discovery = short vs long term overlap,")
    print("   Nostalgia = medium vs long term overlap. They are NOT expected to sum to 1 or be")
    print("   mirror opposites, but a sanity check: both being extreme in the same direction")
    print("   would suggest they're not capturing meaningfully different signals.)")

    return {"discovery_rate": discovery, "nostalgia_score": nostalgia}

def main():
    results = {}
    results["rediscovery"] = evaluate_rediscovery()
    results["bubble"] = evaluate_bubble()
    results["music_dna"] = evaluate_music_dna()

    with open(os.path.join(PROCESSED_DIR, "evaluation_results.json"), "w") as f:
        json.dump(results, f, indent=2)

    print(f"\n\nSaved evaluation results to {PROCESSED_DIR}/evaluation_results.json")

if __name__ == "__main__":
    main()