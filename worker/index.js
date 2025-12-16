/**
 * Kraken xStocks Proxy Worker
 * Handles authenticated requests to Kraken API for xStocks data
 */

const KRAKEN_API_URL = 'https://api.kraken.com';

// Known xStock pairs
const XSTOCK_PAIRS = [
  'AAPLxUSD', 'TSLAxUSD', 'NVDAxUSD', 'GOOGLxUSD', 'AMZNxUSD',
  'MSFTxUSD', 'METAxUSD', 'NFLXxUSD', 'AMDxUSD', 'INTCxUSD',
  'COINxUSD', 'HOODxUSD', 'MSTRxUSD', 'SPYxUSD', 'QQQxUSD',
  'IWMxUSD', 'GLDxUSD', 'SLVxUSD', 'GMExUSD'
];

// Company name mapping
const COMPANY_NAMES = {
  'AAPL': 'Apple Inc.',
  'TSLA': 'Tesla Inc.',
  'NVDA': 'NVIDIA Corp.',
  'GOOGL': 'Alphabet Inc.',
  'AMZN': 'Amazon.com',
  'MSFT': 'Microsoft Corp.',
  'META': 'Meta Platforms',
  'NFLX': 'Netflix Inc.',
  'AMD': 'AMD Inc.',
  'INTC': 'Intel Corp.',
  'COIN': 'Coinbase Global',
  'HOOD': 'Robinhood',
  'MSTR': 'MicroStrategy',
  'SPY': 'S&P 500 ETF',
  'QQQ': 'Nasdaq 100 ETF',
  'IWM': 'Russell 2000 ETF',
  'GLD': 'Gold ETF',
  'SLV': 'Silver ETF',
  'GME': 'GameStop Corp.',
};

/**
 * Generate Kraken API signature
 */
async function generateSignature(path, nonce, postData, apiSecret) {
  // Decode base64 secret
  const secretBytes = Uint8Array.from(atob(apiSecret), c => c.charCodeAt(0));

  // Create message: nonce + postData
  const message = nonce + postData;
  const msgBuffer = new TextEncoder().encode(message);

  // SHA256 hash of message
  const sha256Hash = await crypto.subtle.digest('SHA-256', msgBuffer);

  // Combine path + SHA256 hash
  const pathBytes = new TextEncoder().encode(path);
  const combined = new Uint8Array(pathBytes.length + sha256Hash.byteLength);
  combined.set(pathBytes, 0);
  combined.set(new Uint8Array(sha256Hash), pathBytes.length);

  // HMAC-SHA512
  const key = await crypto.subtle.importKey(
    'raw',
    secretBytes,
    { name: 'HMAC', hash: 'SHA-512' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, combined);

  // Base64 encode
  return btoa(String.fromCharCode(...new Uint8Array(signature)));
}

/**
 * Make authenticated request to Kraken
 */
async function krakenPrivateRequest(endpoint, params, apiKey, apiSecret) {
  const path = `/0/private/${endpoint}`;
  const nonce = Date.now() * 1000;

  const postData = new URLSearchParams({
    nonce: nonce.toString(),
    ...params
  }).toString();

  const signature = await generateSignature(path, nonce.toString(), postData, apiSecret);

  const response = await fetch(`${KRAKEN_API_URL}${path}`, {
    method: 'POST',
    headers: {
      'API-Key': apiKey,
      'API-Sign': signature,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: postData,
  });

  return response.json();
}

/**
 * Fetch xStocks ticker data using public API with specific pairs
 */
async function fetchXStocksTickers() {
  const pairString = XSTOCK_PAIRS.join(',');
  const response = await fetch(
    `${KRAKEN_API_URL}/0/public/Ticker?pair=${pairString}`
  );
  return response.json();
}

/**
 * Fetch xStocks asset info
 */
async function fetchXStocksAssets(apiKey, apiSecret) {
  // Try to get asset info for xStocks
  const response = await fetch(
    `${KRAKEN_API_URL}/0/public/Assets?aclass=currency`
  );
  const data = await response.json();

  if (data.error && data.error.length > 0) {
    return { error: data.error };
  }

  // Filter for xStock assets (ending in 'x')
  const xstockAssets = {};
  for (const [symbol, info] of Object.entries(data.result || {})) {
    if (symbol.endsWith('x') && symbol.length > 2) {
      xstockAssets[symbol] = info;
    }
  }

  return { result: xstockAssets };
}

/**
 * Handle CORS
 */
function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

/**
 * Main request handler
 */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin');

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders(origin) });
    }

    // Check if API keys are configured
    const hasKeys = !!(env.KRAKEN_API_KEY && env.KRAKEN_API_SECRET);

    try {
      // Health check
      if (url.pathname === '/health') {
        return Response.json(
          { status: 'ok', configured: hasKeys },
          { headers: corsHeaders(origin) }
        );
      }

      // xStocks endpoint
      if (url.pathname === '/api/xstocks') {
        // Try to fetch xStocks ticker data
        // First try each pair individually since bulk query might not work
        const xstocks = [];

        for (const pair of XSTOCK_PAIRS) {
          try {
            const response = await fetch(
              `${KRAKEN_API_URL}/0/public/Ticker?pair=${pair}`
            );
            const data = await response.json();

            if (data.result && Object.keys(data.result).length > 0) {
              const [pairKey, tickerData] = Object.entries(data.result)[0];
              const symbol = pair.replace('xUSD', '').replace('USD', '');
              const volume24h = parseFloat(tickerData.v?.[1]) || 0;
              const lastPrice = parseFloat(tickerData.c?.[0]) || 0;
              const openPrice = parseFloat(tickerData.o) || 0;
              const change = openPrice > 0 ? ((lastPrice - openPrice) / openPrice) * 100 : 0;

              xstocks.push({
                pair: pairKey,
                symbol,
                company: COMPANY_NAMES[symbol] || 'Tokenized Equity',
                price: lastPrice,
                change24h: change,
                volume24h,
                volumeUSD: volume24h * lastPrice,
                trades24h: parseInt(tickerData.t?.[1]) || 0,
                high24h: parseFloat(tickerData.h?.[1]) || 0,
                low24h: parseFloat(tickerData.l?.[1]) || 0,
              });
            }
          } catch (e) {
            // Skip pairs that fail
            console.log(`Failed to fetch ${pair}:`, e.message);
          }
        }

        // Sort by volume
        xstocks.sort((a, b) => b.volumeUSD - a.volumeUSD);

        // Calculate totals
        const totalVolume = xstocks.reduce((sum, x) => sum + x.volumeUSD, 0);

        return Response.json({
          configured: hasKeys,
          available: xstocks.length > 0,
          count: xstocks.length,
          totalVolume,
          xstocks,
          knownPairs: XSTOCK_PAIRS,
          lastUpdated: new Date().toISOString(),
        }, { headers: corsHeaders(origin) });
      }

      // xStocks count (for stat cards)
      if (url.pathname === '/api/xstocks/count') {
        const assetData = await fetchXStocksAssets(
          env.KRAKEN_API_KEY,
          env.KRAKEN_API_SECRET
        );

        const count = Object.keys(assetData.result || {}).length;

        return Response.json({
          count,
          configured: hasKeys,
        }, { headers: corsHeaders(origin) });
      }

      // 404 for unknown routes
      return Response.json(
        { error: 'Not found' },
        { status: 404, headers: corsHeaders(origin) }
      );

    } catch (error) {
      console.error('Worker error:', error);
      return Response.json(
        { error: error.message || 'Internal server error' },
        { status: 500, headers: corsHeaders(origin) }
      );
    }
  },
};
