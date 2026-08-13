import os
import json
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

def show(label, data):
    print(f"\n===== {label} =====")
    print(json.dumps(data, indent=2)[:1500])  # trimmed so terminal isn't flooded

# 1. Top tracks (short term = last 4 weeks)
top_tracks = sp.current_user_top_tracks(limit=5, time_range="short_term")
show("Top Tracks (short_term)", top_tracks)

# 2. Top artists
top_artists = sp.current_user_top_artists(limit=5, time_range="short_term")
show("Top Artists (short_term)", top_artists)

# 3. Recently played
recent = sp.current_user_recently_played(limit=5)
show("Recently Played", recent)

# 4. Saved/liked tracks
saved = sp.current_user_saved_tracks(limit=5)
show("Saved Tracks", saved)