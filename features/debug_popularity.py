import json
import os

RAW_DIR = "data/raw"

def load_json(filename):
    path = os.path.join(RAW_DIR, filename)
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def main():
    top_medium = load_json("top_tracks_medium_term.json")
    print(f"Total tracks in top_medium: {len(top_medium)}\n")

    for i, item in enumerate(top_medium[:5]):
        track = item.get("track", item)
        print(f"{i+1}. {track.get('name')}")
        print(f"   popularity field: {track.get('popularity')}")
        print(f"   all top-level keys: {list(track.keys())}\n")

if __name__ == "__main__":
    main()