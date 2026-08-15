import os
import secrets
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from fastapi.responses import RedirectResponse, JSONResponse
from dotenv import load_dotenv
import spotipy
from spotipy.oauth2 import SpotifyOAuth
import sys
from pathlib import Path

# Allow importing from features/ and recommendations/ (siblings of backend/)
sys.path.append(str(Path(__file__).parent.parent))

from features.music_dna_v2 import build_music_dna
from recommendations.spotify_memory import calculate_rediscovery_scores
from recommendations.music_bubble import load_json as bubble_load_json, artist_appearance_by_range, measure_bubble, find_adjacent_artists
from recommendations.playlist_generator import build_playlist_tracks, create_spotify_playlist
from datetime import date

load_dotenv()

app = FastAPI(title="Music Intelligence System API")

# --- Session support (so the backend can remember who's logged in) ---
# SESSION_SECRET should be a long random string, stored in .env (see below)
app.add_middleware(SessionMiddleware, secret_key=os.getenv("SESSION_SECRET", secrets.token_hex(32)))

# --- CORS: allow the React dev server to call this backend ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5173"],  # Vite's default dev port
    allow_credentials=True,  # required so session cookies work across origins
    allow_methods=["*"],
    allow_headers=["*"],
)

SPOTIFY_SCOPES = (
    "user-read-private user-read-email user-top-read user-read-recently-played "
    "user-library-read playlist-read-private playlist-modify-private playlist-modify-public"
)

def get_spotify_oauth():
    """
    Separate from the CLI scripts' SpotifyOAuth usage: this one does NOT open
    a local browser automatically or cache tokens to a .cache file. The web
    flow controls redirects explicitly and stores the token in the session.
    """
    return SpotifyOAuth(
        client_id=os.getenv("SPOTIFY_CLIENT_ID"),
        client_secret=os.getenv("SPOTIFY_CLIENT_SECRET"),
        redirect_uri=os.getenv("SPOTIFY_REDIRECT_URI"),
        scope=SPOTIFY_SCOPES,
        cache_handler=spotipy.cache_handler.MemoryCacheHandler()  # no .cache file for the web flow
    )

@app.get("/")
def root():
    return {"status": "Music Intelligence System API is running"}

@app.get("/auth/login")
def login():
    """Redirects the browser to Spotify's consent screen."""
    sp_oauth = get_spotify_oauth()
    auth_url = sp_oauth.get_authorize_url()
    return RedirectResponse(auth_url)

@app.get("/auth/callback")
def callback(request: Request, code: str = None, error: str = None):
    """Spotify redirects here after the user approves (or denies) access."""
    if error:
        return JSONResponse({"error": error}, status_code=400)

    sp_oauth = get_spotify_oauth()
    token_info = sp_oauth.get_access_token(code, as_dict=True)

    # Store the token in the server-side session (tied to a secure cookie)
    request.session["token_info"] = token_info

    # Redirect back to the React app once logged in
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
    return RedirectResponse(f"{frontend_url}/dashboard")

@app.get("/auth/me")
def get_current_user(request: Request):
    """Used by the frontend to check: is someone logged in, and who are they?"""
    token_info = request.session.get("token_info")
    if not token_info:
        return JSONResponse({"authenticated": False}, status_code=401)

    sp = spotipy.Spotify(auth=token_info["access_token"])
    user = sp.current_user()
    return {
        "authenticated": True,
        "display_name": user.get("display_name"),
        "id": user.get("id")
    }

@app.get("/auth/logout")
def logout(request: Request):
    request.session.clear()
    return {"status": "logged out"}

@app.get("/api/dna")
def get_music_dna(request: Request):
    """Wraps the existing build_music_dna() function from Day 5."""
    token_info = request.session.get("token_info")
    if not token_info:
        return JSONResponse({"error": "Not authenticated"}, status_code=401)

    try:
        dna = build_music_dna()
        return dna
    except FileNotFoundError as e:
        return JSONResponse(
            {"error": f"Missing data file: {e}. Run the data collection pipeline first."},
            status_code=404
        )

@app.get("/api/memory")
def get_rediscovery(request: Request):
    """Wraps calculate_rediscovery_scores() from spotify_memory.py."""
    token_info = request.session.get("token_info")
    if not token_info:
        return JSONResponse({"error": "Not authenticated"}, status_code=401)

    try:
        results = calculate_rediscovery_scores()
        return {"candidates": results, "total": len(results)}
    except FileNotFoundError as e:
        return JSONResponse(
            {"error": f"Missing data file: {e}. Run the data collection pipeline first."},
            status_code=404
        )

@app.get("/api/bubble")
def get_bubble_analysis(request: Request):
    """
    Wraps music_bubble.py's logic. Mirrors that file's main() function exactly,
    since the bubble analysis requires chaining three functions together.
    """
    token_info = request.session.get("token_info")
    if not token_info:
        return JSONResponse({"error": "Not authenticated"}, status_code=401)

    try:
        top_short = bubble_load_json("top_tracks_short_term.json")
        top_medium = bubble_load_json("top_tracks_medium_term.json")
        top_long = bubble_load_json("top_tracks_long_term.json")
        recent = bubble_load_json("recently_played.json")

        artist_data = artist_appearance_by_range(top_short, top_medium, top_long, recent)
        bubble_stats = measure_bubble(artist_data)

        core_names = set(name for name, _ in bubble_stats["top_5_artists"])
        adjacent = find_adjacent_artists(artist_data, core_names)

        return {"bubble_stats": bubble_stats, "adjacent_artists": adjacent}
    except FileNotFoundError as e:
        return JSONResponse(
            {"error": f"Missing data file: {e}. Run the data collection pipeline first."},
            status_code=404
        )

@app.post("/api/playlist")
def generate_playlist(request: Request):
    """
    Wraps playlist_generator.py's logic. Unlike the GET endpoints, this is a POST
    since it performs a real write action (creates a playlist in the user's account).
    Passes the session-authenticated spotipy client into create_spotify_playlist(),
    so the playlist is created under the logged-in user's own account, not the CLI's.
    """
    token_info = request.session.get("token_info")
    if not token_info:
        return JSONResponse({"error": "Not authenticated"}, status_code=401)

    session_sp = spotipy.Spotify(auth=token_info["access_token"])

    try:
        track_ids = build_playlist_tracks(rediscovery_count=10, adjacent_count=10)

        if not track_ids:
            return JSONResponse(
                {"error": "No tracks found. Run the data pipeline first (Memory and Bubble scores must exist)."},
                status_code=404
            )

        playlist_name = f"Rediscovery Mix — {date.today().isoformat()}"
        description = ("Auto-generated by Music Intelligence System: half forgotten favorites "
                        "you used to love, half artists just outside your usual bubble.")

        playlist = create_spotify_playlist(track_ids, playlist_name, description, spotify_client=session_sp)

        return {
            "name": playlist["name"],
            "url": playlist["external_urls"]["spotify"],
            "track_count": len(track_ids)
        }
    except FileNotFoundError as e:
        return JSONResponse(
            {"error": f"Missing data file: {e}. Run the data collection pipeline first."},
            status_code=404
        )