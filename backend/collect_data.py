import os
import json
from datetime import datetime
from dotenv import load_dotenv
import spotipy
from spotipy.oauth2 import SpotifyOAuth

load_dotenv()

sp = spotipy.Spotify(auth_manager=SpotifyOAuth(
    client_id=os.getenv("SPOTIFY_CLIENT_ID"),
    client_secret=os.getenv("SPOTIFY_CLIENT_SECRET"),
    redirect_uri=os.getenv("SPOTIFY_REDIRECT_URI"),
    scope="user-read-private user-read-email user-top-read user-read-recently-played user-library-read playlist-read-private"
))

RAW_DIR = "data/raw"
os.makedirs(RAW_DIR, exist_ok=True)

def save_json(filename, data):
    path = os.path.join(RAW_DIR, filename)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"Saved {path}")

def collect_top(kind, time_range):
    """kind = 'tracks' or 'artists'"""
    items = []
    if kind == "tracks":
        results = sp.current_user_top_tracks(limit=50, time_range=time_range)
    else:
        results = sp.current_user_top_artists(limit=50, time_range=time_range)
    items.extend(results["items"])
    return items

def collect_saved_tracks(max_items=500):
    """Paginate through liked songs, up to max_items."""
    items = []
    offset = 0
    limit = 50
    while len(items) < max_items:
        results = sp.current_user_saved_tracks(limit=limit, offset=offset)
        batch = results["items"]
        if not batch:
            break
        items.extend(batch)
        offset += limit
    return items[:max_items]

def main():
    print("Collecting Spotify data... this may take a moment.\n")

    # Top tracks/artists across all 3 time ranges
    for time_range in ["short_term", "medium_term", "long_term"]:
        save_json(f"top_tracks_{time_range}.json", collect_top("tracks", time_range))
        save_json(f"top_artists_{time_range}.json", collect_top("artists", time_range))

    # Recently played (last ~50 plays, Spotify's limit)
    recent = sp.current_user_recently_played(limit=50)
    save_json("recently_played.json", recent["items"])

    # Saved/liked tracks (paginated)
    saved = collect_saved_tracks(max_items=500)
    save_json("saved_tracks.json", saved)

    # Metadata about this collection run
    save_json("collection_metadata.json", {
        "collected_at": datetime.now().isoformat(),
        "counts": {
            "saved_tracks": len(saved),
            "recently_played": len(recent["items"])
        }
    })

    print("\nData collection complete.")

if __name__ == "__main__":
    main()