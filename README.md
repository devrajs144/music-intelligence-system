# 🎧 Personal Music Intelligence System

An ML-powered system that analyzes Spotify listening data to help users rediscover forgotten favourites, escape repetitive listening patterns, understand their musical behaviour, and build better group playlists.

## Features (in progress)

- 🕰️ **Spotify Memory** — rediscover songs you used to love ✅ v1 complete
- 🫧 **Music Bubble Detector** — measure listening diversity and surface adjacent recommendations
- 👥 **Aux Battle** — optimize group playlists for shared satisfaction
- 🧬 **Music DNA** — an interpretable behavioural listening profile 🚧 in progress

## Status

🚧 Under active development — Day 3 of a 7-day build.

## Setup

### Prerequisites
- Python 3.10+
- A Spotify account (Premium required for Development Mode API access)
- A Spotify Developer app (free) — https://developer.spotify.com/dashboard

### Installation

1. Clone the repo
   ```
   git clone https://github.com/devrajs144/music-intelligence-system.git
   cd music-intelligence-system
   ```

2. Create and activate a virtual environment
   ```
   python -m venv venv
   venv\Scripts\activate.bat
   ```
   *(Do not move this folder after creating the venv — venvs hardcode absolute paths. Delete and recreate if you move the project.)*

3. Install dependencies
   ```
   pip install -r requirements.txt
   ```

4. Create a `.env` file in the project root:
   ```
   SPOTIFY_CLIENT_ID=your_client_id
   SPOTIFY_CLIENT_SECRET=your_client_secret
   SPOTIFY_REDIRECT_URI=http://127.0.0.1:8888/callback
   ```

5. Test the Spotify connection
   ```
   python backend/test_connection.py
   ```
   Expected output: `Spotify authentication successful`

6. Collect your Spotify data
   ```
   python backend/collect_data.py
   ```
   Saves top tracks/artists (short/medium/long term), recently played, and saved tracks to `data/raw/`.

## Data Availability Notes

Spotify restricted several Web API endpoints for new Development Mode apps (Nov 2024 – Feb 2026 changes): Audio Features, Audio Analysis, Recommendations, Related Artists, Featured Playlists, and Artist Genres are unavailable or empty for new apps.

This project is built entirely on endpoints that remain accessible:
- Top Tracks / Top Artists (short/medium/long term)
- Recently Played (last ~50 plays only — a hard Spotify API limit)
- Saved ("Liked") Tracks, with exact `added_at` timestamps
- Search, playlist read/write

Music DNA and Spotify Memory rely on listening **behaviour** (recency, repetition, rank persistence across time windows) rather than raw audio characteristics or genre tags, since those are not available.

## Music DNA v1 — Behavioural Features

First interpretable features, built from listening behavior:

- **Artist Diversity Score** (Shannon entropy, normalized 0–1): how spread out listening is across artists, computed from actual track-level artist frequency across top tracks (all time ranges) and recently played. *(Note: must be computed from raw track-artist frequency, not the pre-deduplicated "top artists" list, or it trivially returns ~1.0.)*
- **Discovery Rate**: fraction of current top tracks (short_term) not present in long-term top tracks — measures rotation of favorites.
- **Repetition Rate**: fraction of recently played tracks already present in saved/liked songs — measures replay of committed favorites vs. exploration.

Run: `python features/music_dna_v1.py` → saves to `data/processed/music_dna_v1.json`

## Spotify Memory — Rediscovery Score (v1)

Rule-based, fully explainable scoring for surfacing forgotten favorites ("You Forgot These").

**Exclusion rules** (hard disqualifiers):
- Currently in `short_term` top tracks → not forgotten, still a current favorite
- Present in `recently_played` (last ~50 plays) → actively being played

**Scoring** (for remaining candidates from `medium_term` ∪ `long_term`):
- **Persistence** (weight 0.5, highest priority): 1.0 if in both medium+long term, 0.6 if long-term only, 0.4 if medium-term only. Lasting favorites are weighted above short-lived phases.
- **Historical strength** (weight 0.3): based on best rank position across whichever lists the track appears in.
- **Absence proxy** (weight 0.2): higher if the track has dropped out of medium_term entirely (implies a longer gap) vs. still present in both.

**Known limitation:** `recently_played` only covers the last ~50 plays, so it's a weak signal for infrequent-but-ongoing listening (e.g., songs played every few weeks). An attempt to add a stricter medium_term-rank-based exclusion was tested and reverted after it did not improve real output quality — kept here as a documented example of an evaluated-and-rejected approach.

Run: `python recommendations/spotify_memory.py` → saves to `data/processed/rediscovery_scores.json`

## Project Structure

```
backend/            Spotify API connection, auth, data collection
data/raw/            Raw collected JSON (gitignored — personal data)
data/processed/      Derived features and scores
features/            Feature engineering (Music DNA)
recommendations/     Recommendation/scoring logic (Spotify Memory, etc.)
models/              ML models (future)
evaluation/          Evaluation metrics (future)
frontend/            UI (future)
tests/               Tests (future)
```

## Progress Log

- ✅ Day 1: Environment, GitHub, and Spotify OAuth connection
- ✅ Day 2: Data collection pipeline, pandas loading, first Music DNA behavioural features
- ✅ Day 3: Spotify Memory — Rediscovery Score v1 (persistence-weighted, rule-based)