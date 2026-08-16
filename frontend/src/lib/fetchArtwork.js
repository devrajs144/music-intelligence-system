export async function fetchAlbumArt(query) {
  try {
    const res = await fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&limit=1`,
    );
    const data = await res.json();
    if (data.results && data.results.length > 0) {
      // artworkUrl100 -> swap to a larger size by editing the URL
      return data.results[0].artworkUrl100.replace("100x100", "600x600");
    }
    return null;
  } catch {
    return null;
  }
}
