/**
 * Format a large number with appropriate suffix (K, M, B, T)
 * @param {number} value - Number to format
 * @param {number} decimals - Decimal places
 * @returns {string} Formatted string
 */
export function formatCompact(value, decimals = 1) {
  if (value === null || value === undefined || isNaN(value)) return '$0';

  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  if (absValue >= 1e12) {
    return `${sign}$${(absValue / 1e12).toFixed(decimals)}T`;
  }
  if (absValue >= 1e9) {
    return `${sign}$${(absValue / 1e9).toFixed(decimals)}B`;
  }
  if (absValue >= 1e6) {
    return `${sign}$${(absValue / 1e6).toFixed(decimals)}M`;
  }
  if (absValue >= 1e3) {
    return `${sign}$${(absValue / 1e3).toFixed(decimals)}K`;
  }

  return `${sign}$${absValue.toFixed(decimals)}`;
}

/**
 * Format currency with full precision
 * @param {number} value - Number to format
 * @returns {string} Formatted currency string
 */
export function formatCurrency(value) {
  if (value === null || value === undefined || isNaN(value)) return '$0.00';

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format a price with appropriate decimal places
 * @param {number} price - Price to format
 * @returns {string} Formatted price
 */
export function formatPrice(price) {
  if (price === null || price === undefined || isNaN(price)) return '$0.00';

  if (price >= 1000) {
    return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  if (price >= 1) {
    return `$${price.toFixed(2)}`;
  }
  if (price >= 0.01) {
    return `$${price.toFixed(4)}`;
  }
  return `$${price.toFixed(6)}`;
}

/**
 * Format a percentage change
 * @param {number} change - Percentage change
 * @returns {string} Formatted percentage with sign
 */
export function formatPercent(change) {
  if (change === null || change === undefined || isNaN(change)) return '0.00%';

  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(2)}%`;
}

/**
 * Format a number with commas
 * @param {number} value - Number to format
 * @returns {string} Formatted number
 */
export function formatNumber(value) {
  if (value === null || value === undefined || isNaN(value)) return '0';
  return value.toLocaleString('en-US');
}

/**
 * Calculate percentage change from open to current price
 * @param {number} open - Opening price
 * @param {number} current - Current price
 * @returns {number} Percentage change
 */
export function calculateChange(open, current) {
  if (!open || !current || open === 0) return 0;
  return ((current - open) / open) * 100;
}
