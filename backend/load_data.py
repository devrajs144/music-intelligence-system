import json
import os
import pandas as pd

RAW_DIR = "data/raw"

def load_json(filename):
    path = os.path.join(RAW_DIR, filename)
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def tracks_to_df(track_items, played_at_key=None, added_at_key=None):
    """
    Converts a list of track objects into a flat DataFrame.
    Handles two shapes:
      - top tracks: item IS the track
      - recently played / saved tracks: item wraps the track under 'track'
    """
    rows = []
    for item in track_items:
        track = item.get("track", item)  # unwrap if nested
        row = {
            "track_id": track.get("id"),
            "track_name": track.get("name"),
            "artist_name": track["artists"][0]["name"] if track.get("artists") else None,
            "artist_id": track["artists"][0]["id"] if track.get("artists") else None,
            "album_name": track.get("album", {}).get("name"),
            "release_date": track.get("album", {}).get("release_date"),
            "popularity": track.get("popularity"),
        }
        if played_at_key:
            row["played_at"] = item.get(played_at_key)
        if added_at_key:
            row["added_at"] = item.get(added_at_key)
        rows.append(row)
    return pd.DataFrame(rows)

def artists_to_df(artist_items):
    rows = []
    for artist in artist_items:
        rows.append({
            "artist_id": artist.get("id"),
            "artist_name": artist.get("name"),
            "genres": artist.get("genres", []),
        })
    return pd.DataFrame(rows)

def main():
    pd.set_option("display.max_columns", None)
    pd.set_option("display.width", 150)

    # Top tracks (medium term as a representative sample)
    top_tracks_medium = load_json("top_tracks_medium_term.json")
    df_top_tracks = tracks_to_df(top_tracks_medium)
    print("===== Top Tracks (medium_term) — first 5 rows =====")
    print(df_top_tracks.head())
    print(f"\nShape: {df_top_tracks.shape}\n")

    # Top artists
    top_artists_medium = load_json("top_artists_medium_term.json")
    df_top_artists = artists_to_df(top_artists_medium)
    print("===== Top Artists (medium_term) — first 5 rows =====")
    print(df_top_artists.head())
    print(f"\nShape: {df_top_artists.shape}\n")

    # Recently played
    recent = load_json("recently_played.json")
    df_recent = tracks_to_df(recent, played_at_key="played_at")
    print("===== Recently Played — first 5 rows =====")
    print(df_recent[["track_name", "artist_name", "played_at"]].head())
    print(f"\nShape: {df_recent.shape}\n")

    # Saved tracks
    saved = load_json("saved_tracks.json")
    df_saved = tracks_to_df(saved, added_at_key="added_at")
    print("===== Saved Tracks — first 5 rows =====")
    print(df_saved[["track_name", "artist_name", "added_at"]].head())
    print(f"\nShape: {df_saved.shape}\n")

if __name__ == "__main__":
    main()