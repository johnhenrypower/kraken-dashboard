const mainMetrics = [
  {
    label: 'Revenue',
    value: '$648M',
    context: '+114% YoY',
    positive: true,
  },
  {
    label: 'Trading Volume',
    value: '$561.9B',
    context: '+106% YoY',
    positive: true,
  },
  {
    label: 'Funded Accounts',
    value: '5.2M',
    context: null,
  },
  {
    label: 'Adj. EBITDA',
    value: '$178.6M',
    context: '27.6% margin',
    positive: true,
  },
];

const xstocksMetrics = [
  {
    label: 'Total Volume',
    value: '$5B+',
  },
  {
    label: 'Unique Holders',
    value: '37,000+',
  },
  {
    label: 'Countries',
    value: '160+',
  },
  {
    label: '24/7 Trading Assets',
    value: '10',
  },
];

export function Q3Snapshot() {
  return (
    <section className="px-4 mb-12">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-xl font-semibold text-gray-300 mb-6 text-center">
          Q3 2025 Snapshot
        </h2>

        {/* Main Financial Metrics */}
        <div className="card mb-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-kraken-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Financial Performance
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {mainMetrics.map((metric) => (
              <div
                key={metric.label}
                className="text-center p-4 rounded-xl bg-dark-700/50"
              >
                <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                  {metric.value}
                </div>
                <div className="text-sm text-gray-400 mb-1">{metric.label}</div>
                {metric.context && (
                  <div className={`text-xs font-medium ${metric.positive ? 'text-green-400' : 'text-gray-500'}`}>
                    {metric.context}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* xStocks Traction */}
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-kraken-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            xStocks Traction
            <span className="text-xs text-gray-500 font-normal">(since July 2025 launch)</span>
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {xstocksMetrics.map((metric) => (
              <div
                key={metric.label}
                className="text-center p-4 rounded-xl bg-gradient-to-br from-kraken-blue/10 to-kraken-purple/10 border border-kraken-blue/20"
              >
                <div className="text-2xl md:text-3xl font-bold gradient-text mb-1">
                  {metric.value}
                </div>
                <div className="text-sm text-gray-400">{metric.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Q3Snapshot;
