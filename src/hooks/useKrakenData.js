import { useState, useEffect, useCallback } from 'react';
import { fetchAssets, fetchTickers } from '../utils/api';
import { WORKER_URL } from '../utils/config';
import { classifyAsset, classifyPair, isUSDPair, extractBaseAsset } from '../utils/classifiers';
import { calculateChange } from '../utils/formatters';

const REFRESH_INTERVAL = 60000; // 60 seconds

/**
 * Fetch xStocks data from worker
 */
async function fetchXStocks() {
  try {
    const response = await fetch(`${WORKER_URL}/api/xstocks`);
    if (!response.ok) {
      throw new Error(`Worker error: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.warn('Failed to fetch xStocks from worker:', error.message);
    return { available: false, xstocks: [], totalVolume: 0 };
  }
}

/**
 * Custom hook for fetching and processing Kraken market data
 */
export function useKrakenData() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Asset counts for stat cards
  const [assetCounts, setAssetCounts] = useState({
    crypto: 0,
    xstocks: 0,
    stablecoins: 0,
  });

  // Volume by category
  const [volumeByCategory, setVolumeByCategory] = useState({
    crypto: 0,
    xstock: 0,
    stablecoin: 0,
    total: 0,
  });

  // Top movers by category
  const [topMovers, setTopMovers] = useState({
    crypto: [],
    xstock: [],
    stablecoin: [],
  });

  // xStocks worker status
  const [xstocksAvailable, setXstocksAvailable] = useState(false);

  /**
   * Process assets to get counts by category
   */
  const processAssets = useCallback((assets) => {
    let crypto = 0;
    let xstocks = 0;
    let stablecoins = 0;

    Object.entries(assets).forEach(([symbol, data]) => {
      // Skip non-currency assets
      if (data.aclass !== 'currency') return;

      const category = classifyAsset(symbol);

      if (category === 'xstock') {
        xstocks++;
      } else if (category === 'stablecoin') {
        stablecoins++;
      } else {
        crypto++;
      }
    });

    return { crypto, xstocks, stablecoins };
  }, []);

  /**
   * Process tickers to get volume and top movers (crypto + stablecoins only)
   */
  const processTickers = useCallback((tickers) => {
    const volumes = {
      crypto: 0,
      stablecoin: 0,
    };

    const allPairs = {
      crypto: [],
      stablecoin: [],
    };

    Object.entries(tickers).forEach(([pairName, data]) => {
      // Only process USD pairs for volume
      if (!isUSDPair(pairName)) return;

      const category = classifyPair(pairName);

      // Skip xstocks from public API (we get them from worker)
      if (category === 'xstock') return;

      const volume24h = parseFloat(data.v?.[1]) || 0;
      const lastPrice = parseFloat(data.c?.[0]) || 0;
      const openPrice = parseFloat(data.o) || 0;
      const volumeUSD = volume24h * lastPrice;

      volumes[category] = (volumes[category] || 0) + volumeUSD;

      // Add to pairs list for top movers
      const baseAsset = extractBaseAsset(pairName);
      if (!allPairs[category]) allPairs[category] = [];
      allPairs[category].push({
        pair: pairName,
        symbol: baseAsset,
        volume24h: volumeUSD,
        price: lastPrice,
        change: calculateChange(openPrice, lastPrice),
        trades: parseInt(data.t?.[1]) || 0,
        high: parseFloat(data.h?.[1]) || 0,
        low: parseFloat(data.l?.[1]) || 0,
      });
    });

    // Sort each category by volume and take top 5
    const movers = {
      crypto: (allPairs.crypto || [])
        .sort((a, b) => b.volume24h - a.volume24h)
        .slice(0, 5),
      stablecoin: (allPairs.stablecoin || [])
        .sort((a, b) => b.volume24h - a.volume24h)
        .slice(0, 5),
    };

    return { volumes, movers };
  }, []);

  /**
   * Fetch all data from Kraken + Worker
   */
  const fetchData = useCallback(async () => {
    try {
      setError(null);

      // Fetch from public API and worker in parallel
      const [assets, tickers, xstocksData] = await Promise.all([
        fetchAssets(),
        fetchTickers(),
        fetchXStocks(),
      ]);

      // Process assets for counts
      const counts = processAssets(assets);

      // Update xstocks count from worker if available
      if (xstocksData.available && xstocksData.count) {
        counts.xstocks = xstocksData.count;
      }

      setAssetCounts(counts);
      setXstocksAvailable(xstocksData.available);

      // Process tickers for volume and top movers
      const { volumes, movers } = processTickers(tickers);

      // Add xStocks data from worker
      const xstockVolume = xstocksData.totalVolume || 0;
      const xstockMovers = (xstocksData.xstocks || []).slice(0, 5).map(x => ({
        pair: x.pair,
        symbol: x.symbol,
        company: x.company,
        volume24h: x.volumeUSD,
        price: x.price,
        change: x.change24h,
        trades: x.trades24h,
      }));

      // Combine volumes
      const totalVolumes = {
        crypto: volumes.crypto,
        xstock: xstockVolume,
        stablecoin: volumes.stablecoin,
        total: volumes.crypto + xstockVolume + volumes.stablecoin,
      };

      setVolumeByCategory(totalVolumes);

      // Combine movers
      setTopMovers({
        crypto: movers.crypto,
        xstock: xstockMovers,
        stablecoin: movers.stablecoin,
      });

      setLastUpdated(new Date());
      setLoading(false);
    } catch (err) {
      console.error('Error fetching Kraken data:', err);
      setError(err.message || 'Failed to fetch data');
      setLoading(false);
    }
  }, [processAssets, processTickers]);

  /**
   * Refresh data
   */
  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  // Initial fetch and auto-refresh
  useEffect(() => {
    fetchData();

    const interval = setInterval(fetchData, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchData]);

  return {
    loading,
    error,
    lastUpdated,
    assetCounts,
    volumeByCategory,
    topMovers,
    xstocksAvailable,
    refresh,
  };
}

export default useKrakenData;
