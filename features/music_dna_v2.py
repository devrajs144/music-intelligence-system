import json
import os
import math
from collections import Counter
from difflib import SequenceMatcher

RAW_DIR = "data/raw"
PROCESSED_DIR = "data/processed"

def load_json(filename):
    path = os.path.join(RAW_DIR, filename)
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def load_processed(filename):
    path = os.path.join(PROCESSED_DIR, filename)
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def get_artist_names(track_items):
    names = []
    for item in track_items:
        track = item.get("track", item)
        if track.get("artists"):
            names.append(track["artists"][0]["name"])
    return names

def get_track_ids(track_items):
    ids = []
    for item in track_items:
        track = item.get("track", item)
        if track.get("id"):
            ids.append(track["id"])
    return ids

def get_popularity_scores(track_items):
    scores = []
    for item in track_items:
        track = item.get("track", item)
        pop = track.get("popularity")
        if pop is not None:
            scores.append(pop)
    return scores

def normalize_artist_name(name):
    return name.strip().lower()

def artist_diversity_score(artist_names):
    if not artist_names:
        return 0.0
    counts = Counter(artist_names)
    total = len(artist_names)
    probabilities = [count / total for count in counts.values()]
    entropy = -sum(p * math.log2(p) for p in probabilities)
    max_entropy = math.log2(len(counts)) if len(counts) > 1 else 1
    return round(entropy / max_entropy, 3) if max_entropy > 0 else 0.0

def interpret(score, low_label, mid_label, high_label, low=0.33, high=0.66):
    if score < low:
        return low_label
    elif score < high:
        return mid_label
    else:
        return high_label

def build_music_dna():
    top_short = load_json("top_tracks_short_term.json")
    top_medium = load_json("top_tracks_medium_term.json")
    top_long = load_json("top_tracks_long_term.json")
    recent = load_json("recently_played.json")
    saved = load_json("saved_tracks.json")

    # --- Artist Diversity ---
    all_track_sources = top_short + top_medium + top_long + recent
    artist_names = get_artist_names(all_track_sources)
    diversity = artist_diversity_score(artist_names)

    # --- Discovery Rate ---
    short_ids = set(get_track_ids(top_short))
    long_ids = set(get_track_ids(top_long))
    discovery = round(len(short_ids - long_ids) / len(short_ids), 3) if short_ids else 0.0

    # --- Repetition Rate ---
    recent_ids = set(get_track_ids(recent))
    saved_ids = set(get_track_ids(saved))
    repetition = round(len(recent_ids & saved_ids) / len(recent_ids), 3) if recent_ids else 0.0

    # --- Nostalgia Score (NEW) ---
    medium_ids = set(get_track_ids(top_medium))
    nostalgia = round(len(medium_ids & long_ids) / len(medium_ids), 3) if medium_ids else 0.0

    # --- Mainstream Tendency (NEW) ---
    # NOTE: Spotify's 'popularity' field is not returned for new Development Mode apps
    # (confirmed via debug_popularity.py — field absent from track objects entirely).
    # This metric is left as unavailable rather than defaulting to a misleading 0.0.
    pop_scores = get_popularity_scores(top_medium)
    mainstream = round((sum(pop_scores) / len(pop_scores)) / 100, 3) if pop_scores else None
    # --- Bubble stats (from Day 4's saved output) ---
    try:
        bubble_data = load_processed("bubble_analysis.json")
        bubble_radius = bubble_data["bubble_stats"]["bubble_radius"]
        top5_concentration = bubble_data["bubble_stats"]["top_5_percent_of_plays"]
    except FileNotFoundError:
        print("Warning: bubble_analysis.json not found — run music_bubble.py first for full profile.")
        bubble_radius = None
        top5_concentration = None

    dna = {
        "artist_diversity": {
            "score": diversity,
            "label": interpret(diversity, "concentrated", "moderate", "diverse"),
            "explanation": f"Your Artist Diversity is {diversity} — "
                            f"{'you spread your listening across a wide range of artists rather than concentrating on just a few.' if diversity > 0.66 else 'you listen to a moderate mix of repeat and varied artists.' if diversity > 0.33 else 'your listening is concentrated around a small set of favorite artists.'}"
        },
        "discovery_rate": {
            "score": discovery,
            "label": interpret(discovery, "low", "moderate", "high"),
            "explanation": f"Your Discovery Rate is {discovery} — "
                            f"{'a large share of your current favorites are new additions not present in your long-term history.' if discovery > 0.66 else 'your current favorites are a mix of new and long-standing songs.' if discovery > 0.33 else 'your current favorites largely overlap with your long-term history.'}"
        },
        "repetition_rate": {
            "score": repetition,
            "label": interpret(repetition, "low", "moderate", "high"),
            "explanation": f"Your Repetition Rate is {repetition} — "
                            f"{'most of your recent plays are songs already in your Liked library.' if repetition > 0.66 else 'you sometimes replay liked songs, but also explore beyond them.' if repetition > 0.33 else 'most of your recent plays are NOT in your Liked library, suggesting active exploration.'}"
        },
        "nostalgia_score": {
            "score": nostalgia,
            "label": interpret(nostalgia, "low", "moderate", "high"),
            "explanation": f"Your Nostalgia Score is {nostalgia} — "
                            f"{'many of your medium-term favorites have been consistent long-term favorites too.' if nostalgia > 0.66 else 'some of your medium-term favorites are long-standing, others are newer to your rotation.' if nostalgia > 0.33 else 'most of your medium-term favorites are relatively new to your rotation, not long-standing songs.'}"
        },
        "mainstream_tendency": {
            "score": mainstream,
            "label": "unavailable" if mainstream is None else interpret(mainstream, "niche", "balanced", "mainstream"),
            "explanation": ("Not available — Spotify does not return the 'popularity' field for this app's access tier."
                            if mainstream is None else
                            f"Your Mainstream Tendency is {mainstream} — "
                            f"{'you gravitate toward globally popular, chart-relevant tracks.' if mainstream > 0.66 else 'you listen to a balance of popular and lesser-known tracks.' if mainstream > 0.33 else 'you gravitate toward less globally popular, more niche tracks.'}")
        },
        "bubble_radius": {
            "score": bubble_radius,
            "explanation": f"{bubble_radius} artists account for ~80% of your listening." if bubble_radius else "Not available — run music_bubble.py first."
        },
        "top5_artist_concentration_pct": {
            "score": top5_concentration,
            "explanation": f"Your top 5 artists make up {top5_concentration}% of your overall listening." if top5_concentration else "Not available — run music_bubble.py first."
        }
    }
    return dna

def main():
    dna = build_music_dna()

    print("===== Your Music DNA =====\n")
    for key, data in dna.items():
        print(f"{key.replace('_', ' ').title()}: {data['score']}")
        print(f"  {data['explanation']}\n")

    os.makedirs(PROCESSED_DIR, exist_ok=True)
    with open(os.path.join(PROCESSED_DIR, "music_dna.json"), "w") as f:
        json.dump(dna, f, indent=2)

    print(f"Saved to {PROCESSED_DIR}/music_dna.json")

if __name__ == "__main__":
    main()