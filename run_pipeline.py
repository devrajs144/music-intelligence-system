"""
Music Intelligence System — Full Pipeline Runner

Runs the entire system end-to-end in the correct order:
1. Collect fresh Spotify data
2. Build Music DNA v1 features
3. Score Rediscovery candidates (Spotify Memory)
4. Analyze the listening bubble
5. Build consolidated Music DNA v2 dashboard
6. Generate and push a real Spotify playlist

Each step depends on outputs from the previous ones, so order matters.
"""

import subprocess
import sys
import time

STEPS = [
    ("Collecting Spotify data", "backend/collect_data.py"),
    ("Building Music DNA v1 features", "features/music_dna_v1.py"),
    ("Scoring Rediscovery candidates", "recommendations/spotify_memory.py"),
    ("Analyzing your Music Bubble", "recommendations/music_bubble.py"),
    ("Building consolidated Music DNA dashboard", "features/music_dna_v2.py"),
    ("Generating your Spotify playlist", "recommendations/playlist_generator.py"),
]

def run_step(label, script_path):
    print(f"\n{'=' * 60}")
    print(f"STEP: {label}")
    print(f"{'=' * 60}\n")

    start = time.time()
    result = subprocess.run([sys.executable, script_path])
    elapsed = round(time.time() - start, 1)

    if result.returncode != 0:
        print(f"\n❌ FAILED at: {label} (after {elapsed}s)")
        print(f"Stopping pipeline. Fix the error above and re-run.")
        sys.exit(1)
    else:
        print(f"\n✅ Completed: {label} ({elapsed}s)")

def main():
    print("Starting Music Intelligence System pipeline...\n")
    overall_start = time.time()

    for label, script_path in STEPS:
        run_step(label, script_path)

    total = round(time.time() - overall_start, 1)
    print(f"\n{'=' * 60}")
    print(f"Pipeline complete in {total}s")
    print(f"{'=' * 60}")
    print("\nCheck data/processed/ for all results, and check Spotify for your new playlist.")

if __name__ == "__main__":
    main()