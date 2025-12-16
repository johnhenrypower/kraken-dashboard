import { formatCompact, formatPrice, formatPercent } from '../utils/formatters';

// Static xStocks data (API doesn't expose live data)
const STATIC_XSTOCKS = [
  { pair: 'NVDAxUSD', symbol: 'NVDAx', company: 'NVIDIA Corp.', volume24h: null, price: null, change: null },
  { pair: 'TSLAxUSD', symbol: 'TSLAx', company: 'Tesla Inc.', volume24h: null, price: null, change: null },
  { pair: 'AAPLxUSD', symbol: 'AAPLx', company: 'Apple Inc.', volume24h: null, price: null, change: null },
  { pair: 'MSFTxUSD', symbol: 'MSFTx', company: 'Microsoft Corp.', volume24h: null, price: null, change: null },
  { pair: 'AMZNxUSD', symbol: 'AMZNx', company: 'Amazon.com', volume24h: null, price: null, change: null },
];

const CATEGORIES = [
  {
    key: 'crypto',
    title: 'Top 5 Crypto',
    color: '#FF6B6B',
    gradient: 'from-kraken-red to-kraken-pink',
  },
  {
    key: 'xstock',
    title: 'Top 5 xStocks',
    color: '#7B9EF4',
    gradient: 'from-kraken-blue to-blue-400',
  },
  {
    key: 'stablecoin',
    title: 'Top 5 Stablecoins',
    color: '#10B981',
    gradient: 'from-green-500 to-emerald-400',
  },
];

function MoverCard({ asset, color, rank, isStatic }) {
  const changeColor = asset.change >= 0 ? 'text-green-400' : 'text-red-400';
  const hasData = asset.price !== null && asset.volume24h !== null;

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-dark-700/30 hover:bg-dark-700/50 transition-colors">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
        style={{ backgroundColor: color }}
      >
        {rank}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-white truncate">{asset.symbol}</div>
        {asset.company && (
          <div className="text-xs text-gray-500 truncate">{asset.company}</div>
        )}
        {hasData && (
          <div className="text-sm text-gray-400">{formatPrice(asset.price)}</div>
        )}
      </div>
      {hasData ? (
        <div className="text-right">
          <div className="font-semibold text-white">{formatCompact(asset.volume24h)}</div>
          <div className={`text-sm ${changeColor}`}>{formatPercent(asset.change)}</div>
        </div>
      ) : (
        <div className="text-right">
          <div className="text-sm text-gray-500">24/7 Trading</div>
        </div>
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-dark-700/30">
          <div className="w-8 h-8 rounded-full bg-dark-600 animate-pulse" />
          <div className="flex-1">
            <div className="h-4 w-20 bg-dark-600 rounded animate-pulse mb-2" />
            <div className="h-3 w-16 bg-dark-600 rounded animate-pulse" />
          </div>
          <div className="text-right">
            <div className="h-4 w-16 bg-dark-600 rounded animate-pulse mb-2" />
            <div className="h-3 w-12 bg-dark-600 rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ title, isXStock }) {
  return (
    <div className="text-center py-8 text-gray-500">
      <p>No {title.toLowerCase()} data available</p>
      {isXStock && (
        <p className="text-xs mt-2 text-gray-600">
          Requires worker with API keys
        </p>
      )}
    </div>
  );
}

export function TopMovers({ topMovers, loading }) {
  return (
    <section className="px-4 mb-12">
      <h2 className="text-xl font-semibold text-gray-300 mb-6 text-center">
        Top 5 by 24H Volume
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {CATEGORIES.map((category) => {
          // Use static data for xStocks since API doesn't expose it
          const isXStock = category.key === 'xstock';
          const data = isXStock ? STATIC_XSTOCKS : topMovers[category.key];
          const hasData = data?.length > 0;

          return (
            <div key={category.key} className="card">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-2 h-6 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <h3 className="text-lg font-semibold text-white">{category.title}</h3>
                {isXStock && (
                  <span className="text-xs text-gray-500 ml-auto">Featured</span>
                )}
              </div>

              {loading && !isXStock ? (
                <LoadingSkeleton />
              ) : hasData ? (
                <div className="space-y-3">
                  {data.map((asset, index) => (
                    <MoverCard
                      key={asset.pair}
                      asset={asset}
                      color={category.color}
                      rank={index + 1}
                      isStatic={isXStock}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState title={category.title} isXStock={isXStock} />
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default TopMovers;
