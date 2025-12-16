import { useKrakenData } from './hooks/useKrakenData';
import { Header } from './components/Header';
import { StatCards } from './components/StatCards';
import { VolumeChart } from './components/VolumeChart';
import { TopMovers } from './components/TopMovers';
import { Q3Snapshot } from './components/Q3Snapshot';
import { Footer } from './components/Footer';

function App() {
  const {
    loading,
    error,
    lastUpdated,
    assetCounts,
    volumeByCategory,
    topMovers,
    refresh,
  } = useKrakenData();

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Background gradient effect */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-radial from-kraken-purple/10 via-transparent to-transparent" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-radial from-kraken-pink/10 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <Header lastUpdated={lastUpdated} />

        {error && (
          <div className="max-w-4xl mx-auto px-4 mb-8">
            <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 text-center">
              <p className="text-red-400 mb-2">Error loading data: {error}</p>
              <button
                onClick={refresh}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        <StatCards assetCounts={assetCounts} loading={loading} />
        <VolumeChart volumeByCategory={volumeByCategory} loading={loading} />
        <TopMovers topMovers={topMovers} loading={loading} />
        <Q3Snapshot />
        <Footer />
      </div>
    </div>
  );
}

export default App;
