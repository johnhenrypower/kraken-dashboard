export function Header({ lastUpdated }) {
  return (
    <header className="text-center py-12 px-4">
      <h1 className="text-5xl md:text-6xl font-bold mb-4 tracking-tight">
        <span className="gradient-text">Kraken Platform Pulse</span>
      </h1>
      <p className="text-gray-400 text-lg mb-4">
        Real-time data via Kraken Public API
      </p>
      <div className="flex items-center justify-center gap-3 text-sm text-gray-500">
        <span className="live-indicator">Live</span>
        {lastUpdated && (
          <span>
            Last updated: {lastUpdated.toLocaleTimeString()}
          </span>
        )}
      </div>
    </header>
  );
}

export default Header;
