function Landing() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Music Intelligence System</h1>
        <p className="text-neutral-400 mb-6 max-w-md">
          Understand your listening behavior, rediscover forgotten favorites,
          and explore music just outside your usual bubble.
        </p>
        <a
          href="http://127.0.0.1:8000/auth/login"
          className="inline-block bg-green-500 hover:bg-green-400 text-black font-semibold px-6 py-3 rounded-full transition"
        >
          Connect Spotify
        </a>
      </div>
    </div>
  );
}

export default Landing;
