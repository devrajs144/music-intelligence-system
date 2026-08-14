import json
import os
from collections import Counter
from difflib import SequenceMatcher

RAW_DIR = "data/raw"
PROCESSED_DIR = "data/processed"

def normalize_artist_name(name):
    """
    Basic normalization to catch near-duplicate artist names from inconsistent
    Spotify metadata (e.g., 'Gadhvi' vs 'Gadhavi' spelling variants).
    This is intentionally simple — it lowercases and strips whitespace/punctuation
    variance, not true fuzzy matching.
    """
    return name.strip().lower()

def names_are_similar(name1, name2, threshold=0.85):
    """
    Returns True if two artist names are similar enough to likely be the same artist
    (catches spelling variants like 'Gadhvi' vs 'Gadhavi').
    threshold: 0.85 means ~85% character-sequence similarity required.
    """
    return SequenceMatcher(None, name1.lower(), name2.lower()).ratio() >= threshold

def load_json(filename):
    path = os.path.join(RAW_DIR, filename)
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def get_artist_names(track_items):
    names = []
    for item in track_items:
        track = item.get("track", item)
        if track.get("artists"):
            names.append(track["artists"][0]["name"])
    return names

def artist_appearance_by_range(top_short, top_medium, top_long, recent):
    short_artists_raw = get_artist_names(top_short)
    medium_artists_raw = get_artist_names(top_medium)
    long_artists_raw = get_artist_names(top_long)
    recent_artists_raw = get_artist_names(recent)

    short_norm = set(normalize_artist_name(a) for a in short_artists_raw)
    medium_norm = set(normalize_artist_name(a) for a in medium_artists_raw)
    long_norm = set(normalize_artist_name(a) for a in long_artists_raw)

    all_raw_names = short_artists_raw + medium_artists_raw + long_artists_raw + recent_artists_raw

    # Track frequency AND a display-name vote count per normalized key
    freq_counter = Counter(normalize_artist_name(n) for n in all_raw_names)
    display_name_votes = {}
    for name in all_raw_names:
        norm = normalize_artist_name(name)
        display_name_votes.setdefault(norm, Counter())[name] += 1

    result = {}
    for norm_name in freq_counter:
        display_name = display_name_votes[norm_name].most_common(1)[0][0]
        result[display_name] = {
            "in_short": norm_name in short_norm,
            "in_medium": norm_name in medium_norm,
            "in_long": norm_name in long_norm,
            "total_freq": freq_counter[norm_name]
        }

    # Merge near-duplicate spellings (fuzzy match pass)
    merged = {}
    used = set()
    names_by_freq = sorted(result.keys(), key=lambda n: result[n]["total_freq"], reverse=True)

    for name in names_by_freq:
        if name in used:
            continue
        group = [name]
        for other in names_by_freq:
            if other != name and other not in used and names_are_similar(name, other):
                group.append(other)
                used.add(other)
        used.add(name)

        # Merge the group: sum frequencies, OR the boolean range flags
        total_freq = sum(result[n]["total_freq"] for n in group)
        in_short = any(result[n]["in_short"] for n in group)
        in_medium = any(result[n]["in_medium"] for n in group)
        in_long = any(result[n]["in_long"] for n in group)

        merged[name] = {  # keep the highest-frequency spelling as display name
            "in_short": in_short,
            "in_medium": in_medium,
            "in_long": in_long,
            "total_freq": total_freq
        }

    return merged
    
    return result

def measure_bubble(artist_data):
    """
    Returns core stats: top artists, and bubble radius (# artists for 80% of plays).
    """
    sorted_artists = sorted(artist_data.items(), key=lambda x: x[1]["total_freq"], reverse=True)
    total_plays = sum(a["total_freq"] for _, a in sorted_artists)

    cumulative = 0
    radius = 0
    for name, data in sorted_artists:
        cumulative += data["total_freq"]
        radius += 1
        if cumulative >= 0.8 * total_plays:
            break

    top_5 = [(name, data["total_freq"]) for name, data in sorted_artists[:5]]
    return {
        "bubble_radius": radius,
        "total_unique_artists": len(sorted_artists),
        "top_5_artists": top_5,
        "top_5_percent_of_plays": round(sum(f for _, f in top_5) / total_plays * 100, 1) if total_plays else 0
    }

def freshness_score(data):
    """
    Rewards presence across MULTIPLE recent ranges, not just the single best one.
    This breaks ties between artists who all technically 'appear in short_term'
    but differ in how consistently they show up.
    """
    score = 0.0
    if data["in_short"]:
        score += 0.5
    if data["in_medium"]:
        score += 0.3
    if data["in_long"]:
        score += 0.2
    return round(score, 3)

def familiarity_score(freq, max_freq):
    """Normalized play frequency, but capped low since we want LOW-frequency = adjacent."""
    return round(freq / max_freq, 3) if max_freq else 0.0

def find_adjacent_artists(artist_data, core_artist_names, top_n=10):
    if not artist_data:
        return []

    max_freq = max(a["total_freq"] for a in artist_data.values())

    candidates = []
    for name, data in artist_data.items():
        if name in core_artist_names:
            continue  # exclude your core/top artists — must be outside the bubble

        # "Adjacent" means heard, but not obsessively — low-to-moderate frequency
        if data["total_freq"] < 1 or data["total_freq"] > max_freq * 0.3:
            continue

        freshness = freshness_score(data)
        familiarity = familiarity_score(data["total_freq"], max_freq)
        distinctness = 1.0  # already guaranteed by excluding core artists above

        score = round((0.5 * freshness) + (0.3 * familiarity) + (0.2 * distinctness), 3)

        candidates.append({
            "artist_name": name,
            "adjacency_score": score,
            "freshness": freshness,
            "familiarity": familiarity,
            "total_freq": data["total_freq"]
        })

    candidates.sort(key=lambda x: (x["adjacency_score"], x["total_freq"], x["artist_name"]), reverse=True)
    return candidates[:top_n]

def main():
    top_short = load_json("top_tracks_short_term.json")
    top_medium = load_json("top_tracks_medium_term.json")
    top_long = load_json("top_tracks_long_term.json")
    recent = load_json("recently_played.json")

    artist_data = artist_appearance_by_range(top_short, top_medium, top_long, recent)
    bubble_stats = measure_bubble(artist_data)

    print("===== Your Music Bubble =====\n")
    print(f"Total unique artists seen: {bubble_stats['total_unique_artists']}")
    print(f"Bubble radius: {bubble_stats['bubble_radius']} artists account for ~80% of your listening")
    print(f"Top 5 artists make up {bubble_stats['top_5_percent_of_plays']}% of your listening:")
    for name, freq in bubble_stats['top_5_artists']:
        print(f"  - {name} ({freq} appearances)")

    core_names = set(name for name, _ in bubble_stats['top_5_artists'])
    adjacent = find_adjacent_artists(artist_data, core_names)

    print("\n===== Adjacent Artists (Just Outside Your Bubble) =====\n")
    for i, a in enumerate(adjacent, 1):
        print(f"{i}. {a['artist_name']}")
        print(f"   Adjacency Score: {a['adjacency_score']}  (freshness={a['freshness']}, familiarity={a['familiarity']}, freq={a['total_freq']})")

    os.makedirs(PROCESSED_DIR, exist_ok=True)
    with open(os.path.join(PROCESSED_DIR, "bubble_analysis.json"), "w") as f:
        json.dump({"bubble_stats": bubble_stats, "adjacent_artists": adjacent}, f, indent=2)

    print(f"\nSaved to {PROCESSED_DIR}/bubble_analysis.json")

if __name__ == "__main__":
    main()