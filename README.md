# 🎧 Personal Music Intelligence System

An ML-powered system that analyzes Spotify listening data to help users rediscover forgotten favourites, escape repetitive listening patterns, understand their musical behaviour, and build better group playlists.

## Features (in progress)

- 🕰️ **Spotify Memory** — rediscover songs you used to love ✅ v1 complete
- 🫧 **Music Bubble Detector** — measure listening diversity and surface adjacent recommendations ✅ v1 complete
- 👥 **Aux Battle** — optimize group playlists for shared satisfaction
- 🧬 **Music DNA** — an interpretable behavioural listening profile 🚧 in progress

## Status

🚧 Under active development — Day 4 of a 7-day build.

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

## Music Bubble Detector (v1)

Measures listening concentration and surfaces "adjacent" artists using only your own data (no external similarity API available — see Data Availability Notes).

**Bubble measurement:**
- Artist frequency distribution across all top-track time ranges + recently played
- Bubble radius: number of artists accounting for ~80% of total listening
- Top 5 artist concentration %

**Adjacency scoring** (for non-core artists, low-to-moderate frequency):
- Freshness (weight 0.5, highest priority): rewards presence across multiple recent time ranges — chosen because "bubble escape" should surface currently-live possibilities, not old abandoned tries.
- Familiarity (weight 0.3): normalized play frequency — must have been heard, but not obsessively.
- Distinctness (weight 0.2): guaranteed by excluding core/top-5 artists before scoring.

**Data cleaning note:** Spotify artist metadata contains spelling inconsistencies for the same real artist (e.g., transliteration variants). Added fuzzy string matching (difflib SequenceMatcher, 85% similarity threshold) to merge near-duplicate artist names before scoring.

**Known limitation — frequency proxy:** Spotify does not expose real play counts. `total_freq` is a proxy built from counting how many of the 4 available lists (top tracks short/medium/long term + recently played) an artist's tracks appear in — capped at a small integer range (typically 1–5). This means an artist with a few favorite tracks played "a fair amount, not daily" can score identically to one briefly sampled once, since both simply have low list-appearance counts. A true play-count-weighted frequency isn't achievable with the currently accessible Spotify endpoints. This can cause a genuinely well-liked artist to appear in "Adjacent" rather than "Core" if their listening is concentrated on few tracks rather than spread across many.

## Music DNA v2 — Consolidated Dashboard

Combines all behavioural features into one interpretable listener profile, each with a plain-language explanation.

**Dimensions:**
- Artist Diversity, Discovery Rate, Repetition Rate (from v1, Day 2)
- **Nostalgia Score** (new): overlap between medium_term and long_term top tracks — distinct from Discovery Rate, which compares short_term vs long_term.
- **Mainstream Tendency** (new, currently unavailable): intended to average Spotify's `popularity` field across top tracks. Confirmed via direct field inspection that `popularity` is absent entirely from track objects returned to this app's Development Mode access tier — reported honestly as "Not available" rather than defaulting to a misleading 0.0.
- Bubble Radius, Top 5 Artist Concentration % (from Day 4, loaded from `bubble_analysis.json`)

Run: `python features/music_dna_v2.py` (requires `bubble_analysis.json` to exist first — run `music_bubble.py` beforehand) → saves to `data/processed/music_dna.json`

## Smart Playlist Generator

Combines Rediscovery (Day 3) and Adjacent Artists (Day 4) into one real, shuffled Spotify playlist — pushed live to your account via the Web API.

- Even split: 10 Rediscovery tracks + 10 Adjacent tracks (adjacent artists resolved to a real track from your own raw data, since Day 4 only produces artist names).
- Tracks are shuffled together for natural listening flow rather than clustering by category.
- Created as a private playlist with an auto-generated name/description.

**Critical fix — Feb 2026 Spotify API migration:** `spotipy`'s built-in `user_playlist_create()` and `playlist_add_items()` methods target endpoints Spotify has since removed:
- `POST /users/{user_id}/playlists` → replaced by `POST /me/playlists`
- `POST /playlists/{id}/tracks` → replaced by `POST /playlists/{id}/items`

Since spotipy (as of this project's dependency version) hadn't been updated for this migration, both calls are made directly via spotipy's low-level `sp._post()` helper against the current, correct endpoints instead of the library's high-level methods.

Run: `python recommendations/playlist_generator.py` (requires `rediscovery_scores.json` and `bubble_analysis.json` to exist first)

This runs, in order: data collection → Music DNA v1 features → Rediscovery scoring → Bubble analysis → Music DNA v2 dashboard → Spotify playlist generation. Each step's output feeds the next; the pipeline halts immediately if any step fails, rather than continuing with stale or missing data. Total runtime: ~15 seconds.

## Progress Log

- ✅ Day 1: Environment, GitHub, and Spotify OAuth connection
- ✅ Day 2: Data collection pipeline, pandas loading, first Music DNA behavioural features
- ✅ Day 3: Spotify Memory — Rediscovery Score v1
- ✅ Day 4: Music Bubble Detector — concentration measurement, adjacency scoring, fuzzy name matching
- ✅ Day 5: Music DNA v2 — consolidated dashboard, Nostalgia Score, honestly-reported data limitation
- ✅ Day 6: Smart Playlist Generator — real Spotify playlist creation, fixed Feb 2026 API endpoint migration issues
- ✅ Day 7 (in progress): End-to-end pipeline runner