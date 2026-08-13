import json
import os
import pandas as pd
from collections import Counter
import math

RAW_DIR = "data/raw"

def load_json(filename):
    path = os.path.join(RAW_DIR, filename)
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def get_artist_names(track_items):
    """Extract artist name for each track, handling both nested/unnested shapes."""
    names = []
    for item in track_items:
        track = item.get("track", item)
        if track.get("artists"):
            names.append(track["artists"][0]["name"])
    return names

def artist_diversity_score(artist_names):
    """
    Uses Shannon entropy to measure how 'spread out' listening is.
    - Low entropy = you listen to a few artists a lot (concentrated)
    - High entropy = you listen to many artists roughly equally (diverse)
    Normalized to 0-1 scale for interpretability.
    """
    if not artist_names:
        return 0.0

    counts = Counter(artist_names)
    total = len(artist_names)
    probabilities = [count / total for count in counts.values()]

    entropy = -sum(p * math.log2(p) for p in probabilities)
    max_entropy = math.log2(len(counts)) if len(counts) > 1 else 1

    return round(entropy / max_entropy, 3) if max_entropy > 0 else 0.0

def discovery_rate(short_term_ids, long_term_ids):
    """
    Fraction of your CURRENT top tracks that are NOT in your long-term top tracks.
    High value = you're actively discovering/rotating in new favorites.
    Low value = your current favorites are the same as your all-time favorites.
    """
    if not short_term_ids:
        return 0.0
    new_tracks = set(short_term_ids) - set(long_term_ids)
    return round(len(new_tracks) / len(short_term_ids), 3)

def repetition_rate(recent_track_ids, saved_track_ids):
    """
    Fraction of recently played tracks that are already in your saved/liked library.
    High value = you mostly replay songs you've already committed to loving.
    Low value = you're often playing things you haven't explicitly saved (exploring, radio, etc).
    """
    if not recent_track_ids:
        return 0.0
    overlap = set(recent_track_ids) & set(saved_track_ids)
    return round(len(overlap) / len(recent_track_ids), 3)

def get_track_ids(track_items):
    ids = []
    for item in track_items:
        track = item.get("track", item)
        if track.get("id"):
            ids.append(track["id"])
    return ids

def main():
    # Load raw data
    top_tracks_short = load_json("top_tracks_short_term.json")
    top_tracks_long = load_json("top_tracks_long_term.json")
    top_artists_medium = load_json("top_artists_medium_term.json")
    recent = load_json("recently_played.json")
    saved = load_json("saved_tracks.json")

# --- Artist Diversity ---
    # Use artist frequency across actual TRACKS (not the pre-deduplicated top artists list),
    # so repeated listening to the same artist actually shows up as concentration.
    all_track_sources = top_tracks_short + load_json("top_tracks_medium_term.json") + top_tracks_long + recent
    artist_names = get_artist_names(all_track_sources)
    diversity = artist_diversity_score(artist_names)

    # --- Discovery Rate ---
    short_ids = get_track_ids(top_tracks_short)
    long_ids = get_track_ids(top_tracks_long)
    discovery = discovery_rate(short_ids, long_ids)

    # --- Repetition Rate ---
    recent_ids = get_track_ids(recent)
    saved_ids = get_track_ids(saved)
    repetition = repetition_rate(recent_ids, saved_ids)

    print("===== Music DNA v1 — Behavioural Features =====\n")
    print(f"Artist Diversity Score: {diversity}  (0 = very concentrated, 1 = very diverse)")
    print(f"Discovery Rate:         {discovery}  (fraction of current favorites that are new vs. long-term)")
    print(f"Repetition Rate:        {repetition}  (fraction of recent plays that are already 'liked' songs)")

    # Save results
    os.makedirs("data/processed", exist_ok=True)
    results = {
        "artist_diversity_score": diversity,
        "discovery_rate": discovery,
        "repetition_rate": repetition
    }
    with open("data/processed/music_dna_v1.json", "w") as f:
        json.dump(results, f, indent=2)
    print("\nSaved to data/processed/music_dna_v1.json")

if __name__ == "__main__":
    main()