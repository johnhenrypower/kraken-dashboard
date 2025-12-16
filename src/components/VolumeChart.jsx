import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { formatCompact } from '../utils/formatters';

const COLORS = {
  crypto: '#FF6B6B',
  stablecoin: '#10B981',
};

const LABELS = {
  crypto: 'Crypto',
  stablecoin: 'Stablecoins',
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-dark-800 border border-white/10 rounded-lg px-4 py-3 shadow-xl">
        <p className="font-semibold text-white">{data.name}</p>
        <p className="text-gray-300">{formatCompact(data.value)}</p>
        <p className="text-gray-400 text-sm">{data.percentage.toFixed(1)}% of total</p>
      </div>
    );
  }
  return null;
};

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.05) return null; // Don't show labels for small segments

  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      className="text-sm font-semibold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export function VolumeChart({ volumeByCategory, loading }) {
  // Calculate total from crypto + stablecoin only (xStocks not available via API)
  const total = volumeByCategory.crypto + volumeByCategory.stablecoin;

  const data = [
    {
      name: LABELS.crypto,
      value: volumeByCategory.crypto,
      percentage: total > 0 ? (volumeByCategory.crypto / total) * 100 : 0,
      color: COLORS.crypto,
    },
    {
      name: LABELS.stablecoin,
      value: volumeByCategory.stablecoin,
      percentage: total > 0 ? (volumeByCategory.stablecoin / total) * 100 : 0,
      color: COLORS.stablecoin,
    },
  ].filter(d => d.value > 0);

  return (
    <section className="px-4 mb-12">
      <div className="card max-w-4xl mx-auto">
        <h2 className="text-xl font-semibold text-white mb-2 text-center">
          24H Volume by Product Type
        </h2>
        <p className="text-gray-400 text-center mb-6">
          Total: {loading ? '...' : formatCompact(total)}
        </p>

        {loading ? (
          <div className="h-80 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-kraken-purple"></div>
          </div>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={120}
                  innerRadius={60}
                  fill="#8884d8"
                  dataKey="value"
                  stroke="rgba(0,0,0,0.3)"
                  strokeWidth={2}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value, entry) => (
                    <span className="text-gray-300">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Volume breakdown cards */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          {Object.entries(LABELS).map(([key, label]) => (
            <div
              key={key}
              className="text-center p-4 rounded-xl bg-dark-700/50"
            >
              <div
                className="w-3 h-3 rounded-full mx-auto mb-2"
                style={{ backgroundColor: COLORS[key] }}
              />
              <div className="text-sm text-gray-400">{label}</div>
              <div className="text-lg font-bold text-white">
                {loading ? '...' : formatCompact(volumeByCategory[key])}
              </div>
              <div className="text-xs text-gray-500">
                {loading ? '...' : `${((volumeByCategory[key] / total) * 100 || 0).toFixed(1)}%`}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default VolumeChart;
