import os
from dotenv import load_dotenv
import spotipy
from spotipy.oauth2 import SpotifyOAuth

# Load variables from .env into the environment
load_dotenv()

client_id = os.getenv("SPOTIFY_CLIENT_ID")
client_secret = os.getenv("SPOTIFY_CLIENT_SECRET")
redirect_uri = os.getenv("SPOTIFY_REDIRECT_URI")

# Scopes define what data we're allowed to access.
# "user-read-private" and "user-read-email" are minimal, just to test the connection.
sp = spotipy.Spotify(auth_manager=SpotifyOAuth(
    client_id=client_id,
    client_secret=client_secret,
    redirect_uri=redirect_uri,
    scope="user-read-private user-read-email"
))

user = sp.current_user()

print("Spotify authentication successful")
print(f"User: {user['display_name']}")
print(f"Spotify ID: {user['id']}")
print(f"Email: {user['email']}")