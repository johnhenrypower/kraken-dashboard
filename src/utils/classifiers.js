// Known stablecoins
export const STABLECOINS = [
  'USDT', 'USDC', 'DAI', 'PYUSD', 'USDG', 'TUSD', 'BUSD',
  'FRAX', 'LUSD', 'USDD', 'GUSD', 'PAX', 'USDP', 'USDK',
  'ZUSD', 'USD'
];

// Known xStock symbols (tokenized equities on Kraken)
export const XSTOCK_SYMBOLS = [
  'AAPLx', 'TSLAx', 'NVDAx', 'SPYx', 'QQQx', 'GOOGLx',
  'AMZNx', 'MSTRx', 'HOODx', 'GMEx', 'CRCLx', 'GLDx',
  'MSFTx', 'METAx', 'AMDx', 'COINx', 'NFLXx', 'INTCx'
];

/**
 * Check if a symbol is an xStock (tokenized equity)
 * @param {string} symbol - Asset symbol
 * @returns {boolean}
 */
export function isXStock(symbol) {
  if (!symbol) return false;
  // xStocks end with 'x' and are in our known list
  return XSTOCK_SYMBOLS.some(x => symbol.includes(x)) ||
         (symbol.endsWith('x') && symbol.length > 2 && /^[A-Z]+x$/.test(symbol));
}

/**
 * Check if a symbol is a stablecoin
 * @param {string} symbol - Asset symbol
 * @returns {boolean}
 */
export function isStablecoin(symbol) {
  if (!symbol) return false;
  const normalized = symbol.toUpperCase().replace(/^[XZ]/, '');
  return STABLECOINS.some(stable =>
    normalized === stable ||
    normalized.startsWith(stable) ||
    symbol.toUpperCase().startsWith(stable)
  );
}

/**
 * Classify an asset symbol into a category
 * @param {string} symbol - Asset symbol
 * @returns {'crypto' | 'xstock' | 'stablecoin'}
 */
export function classifyAsset(symbol) {
  if (isXStock(symbol)) return 'xstock';
  if (isStablecoin(symbol)) return 'stablecoin';
  return 'crypto';
}

/**
 * Classify a trading pair into a category
 * @param {string} pairName - Trading pair name (e.g., 'XXBTZUSD', 'AAPLxUSD')
 * @returns {'crypto' | 'xstock' | 'stablecoin'}
 */
export function classifyPair(pairName) {
  if (!pairName) return 'crypto';

  // Check for xStock pairs
  if (isXStock(pairName)) return 'xstock';

  // Check if the base asset (before USD/EUR etc) is a stablecoin
  // Common patterns: USDTZUSD, USDCUSD, etc.
  const stablePattern = new RegExp(`^(${STABLECOINS.join('|')})`, 'i');
  if (stablePattern.test(pairName)) return 'stablecoin';

  return 'crypto';
}

/**
 * Extract the base asset from a pair name
 * @param {string} pairName - Trading pair name
 * @returns {string} Base asset symbol
 */
export function extractBaseAsset(pairName) {
  if (!pairName) return '';

  // Remove common quote currencies
  const quotes = ['ZUSD', 'USD', 'ZEUR', 'EUR', 'XXBT', 'XBT', 'ZXBT'];
  let base = pairName;

  for (const quote of quotes) {
    if (pairName.endsWith(quote)) {
      base = pairName.slice(0, -quote.length);
      break;
    }
  }

  // Remove leading X or Z (Kraken's notation)
  if (base.length > 3 && (base.startsWith('X') || base.startsWith('Z'))) {
    base = base.slice(1);
  }

  return base || pairName;
}

/**
 * Check if a pair is USD-quoted (needed for volume calculation)
 * @param {string} pairName - Trading pair name
 * @returns {boolean}
 */
export function isUSDPair(pairName) {
  if (!pairName) return false;
  return pairName.endsWith('USD') || pairName.endsWith('ZUSD');
}
