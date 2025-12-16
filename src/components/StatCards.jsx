import { formatNumber } from '../utils/formatters';

const stats = [
  {
    key: 'crypto',
    label: 'Crypto Assets',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    gradient: 'from-orange-500 to-yellow-500',
  },
  {
    key: 'xstocks',
    label: 'xStocks',
    value: '60+',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
    gradient: 'from-blue-500 to-cyan-500',
    subtitle: 'Tokenized Equities',
    isStatic: true,
  },
  {
    key: 'stablecoins',
    label: 'Stablecoins',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    key: 'stocks',
    label: 'Stocks & ETFs',
    value: '11,000+',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    gradient: 'from-purple-500 to-pink-500',
    subtitle: 'via NinjaTrader',
    isStatic: true,
  },
];

export function StatCards({ assetCounts, loading }) {
  return (
    <section className="px-4 mb-12">
      <h2 className="text-xl font-semibold text-gray-300 mb-6 text-center">
        Product Breadth
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
        {stats.map((stat) => (
          <div
            key={stat.key}
            className="card card-hover group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} bg-opacity-20`}>
                <div className="text-white">{stat.icon}</div>
              </div>
            </div>
            <div className="stat-value">
              {loading ? (
                <div className="h-9 w-24 bg-dark-700 rounded animate-pulse" />
              ) : stat.isStatic ? (
                stat.value
              ) : (
                formatNumber(assetCounts[stat.key] || 0)
              )}
            </div>
            <div className="stat-label mt-1">{stat.label}</div>
            {stat.subtitle && (
              <div className="text-xs text-gray-500 mt-1">{stat.subtitle}</div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export default StatCards;
