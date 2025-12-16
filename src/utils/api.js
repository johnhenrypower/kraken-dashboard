const BASE_URL = 'https://api.kraken.com/0/public';

/**
 * Fetch all assets from Kraken
 * @returns {Promise<Object>} Asset data keyed by symbol
 */
export async function fetchAssets() {
  const response = await fetch(`${BASE_URL}/Assets`);
  if (!response.ok) {
    throw new Error(`Failed to fetch assets: ${response.status}`);
  }
  const data = await response.json();
  if (data.error && data.error.length > 0) {
    throw new Error(data.error.join(', '));
  }
  return data.result;
}

/**
 * Fetch all tickers from Kraken
 * @returns {Promise<Object>} Ticker data keyed by pair name
 */
export async function fetchTickers() {
  const response = await fetch(`${BASE_URL}/Ticker`);
  if (!response.ok) {
    throw new Error(`Failed to fetch tickers: ${response.status}`);
  }
  const data = await response.json();
  if (data.error && data.error.length > 0) {
    throw new Error(data.error.join(', '));
  }
  return data.result;
}

/**
 * Fetch asset pairs from Kraken
 * @returns {Promise<Object>} Asset pair data
 */
export async function fetchAssetPairs() {
  const response = await fetch(`${BASE_URL}/AssetPairs`);
  if (!response.ok) {
    throw new Error(`Failed to fetch asset pairs: ${response.status}`);
  }
  const data = await response.json();
  if (data.error && data.error.length > 0) {
    throw new Error(data.error.join(', '));
  }
  return data.result;
}
