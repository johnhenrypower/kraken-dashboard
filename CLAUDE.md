# Kraken IPO Marketing Dashboard - Project Memory

## Project Overview
An investor-presentation style dashboard showcasing Kraken's platform strength for their upcoming IPO (Q1 2026). Displays real-time market data via Kraken's public API.

**Live URL:** https://kraken.johnhpower.com
**GitHub:** https://github.com/johnhenrypower/kraken-dashboard

## Tech Stack
- **Frontend:** React 19 + Vite 7
- **Styling:** Tailwind CSS v4
- **Charts:** Recharts
- **Deployment:** GitHub Pages (gh-pages branch)
- **Worker:** Cloudflare Worker (for future authenticated API calls)

## Project Structure
```
kraken-dashboard/
├── src/
│   ├── components/
│   │   ├── Header.jsx        # Title, subtitle, live indicator
│   │   ├── StatCards.jsx     # 4 product breadth cards
│   │   ├── VolumeChart.jsx   # Donut chart (crypto + stablecoins)
│   │   ├── TopMovers.jsx     # Top 5 by volume (3 columns)
│   │   ├── Q3Snapshot.jsx    # Static IPO financial metrics
│   │   └── Footer.jsx        # IPO info and links
│   ├── hooks/
│   │   └── useKrakenData.js  # Main data fetching hook
│   ├── utils/
│   │   ├── api.js            # Kraken API fetch functions
│   │   ├── classifiers.js    # Asset classification (crypto/stablecoin/xstock)
│   │   ├── config.js         # Worker URL config
│   │   └── formatters.js     # Number/currency formatting
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css             # Tailwind + custom styles
├── worker/                    # Cloudflare Worker (for xStocks)
│   ├── index.js
│   ├── wrangler.toml
│   └── package.json
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── vite.config.js
```

## Key Architecture Decisions

### 1. No Backend Required (Mostly)
- Kraken's public API allows CORS, so frontend fetches directly
- Worker only needed for authenticated xStocks requests (which don't work anyway - see below)

### 2. xStocks API Limitation (IMPORTANT)
- **xStocks (tokenized equities like AAPLx, TSLAx) are NOT available via Kraken's public REST API**
- Querying `https://api.kraken.com/0/public/Ticker?pair=AAPLxUSD` returns "Unknown asset pair"
- Even with API keys, the data isn't exposed
- **Current solution:** Show static placeholder data for xStocks section
- xStocks stat card shows "60+" (static)
- Top 5 xStocks shows featured companies without live prices

### 3. Volume Chart
- Only shows Crypto and Stablecoins (not xStocks)
- Data we CAN get from public API

### 4. Auto-refresh
- Data refreshes every 60 seconds
- Configured in `useKrakenData.js` via `REFRESH_INTERVAL`

## Cloudflare Worker
**Deployed URL:** https://kraken-xstocks-proxy.johnhenry-pwr.workers.dev

The worker was set up for authenticated Kraken API requests, but xStocks still aren't available. It's deployed but currently not providing useful data.

**Secrets configured:**
- `KRAKEN_API_KEY`
- `KRAKEN_API_SECRET`

**To redeploy worker:**
```bash
cd worker
npx wrangler deploy
```

## Deployment

**To deploy frontend updates:**
```bash
npm run deploy
```
This builds the app, adds CNAME file, and pushes to gh-pages branch.

**Custom domain:** kraken.johnhpower.com
- CNAME record points to johnhenrypower.github.io
- GitHub Pages serves from gh-pages branch

## Static Data (Q3 2025 Metrics)
These are hardcoded in `Q3Snapshot.jsx`:
- Revenue: $648M (+114% YoY)
- Trading Volume: $561.9B (+106% YoY)
- Funded Accounts: 5.2M
- Adj. EBITDA: $178.6M (27.6% margin)
- xStocks Total Volume: $5B+
- xStocks Unique Holders: 37,000+
- xStocks Countries: 160+

## Design
- Dark theme with gradient accents
- Primary gradient: #FF6B6B → #FF5E9D → #C77DFF → #7B9EF4
- Glass-morphism cards
- Inter font family

## API Endpoints Used
- `GET https://api.kraken.com/0/public/Assets` - Asset list for counts
- `GET https://api.kraken.com/0/public/Ticker` - All tickers for volume/prices

## Known Issues / Future Work
1. **xStocks live data** - Would need Kraken to expose this via API, or scrape from their web app
2. **Bundle size warning** - Recharts is large (~530KB), could code-split if needed
3. **Rate limiting** - Currently makes 2 API calls per refresh, well within limits

## Session History (December 2025)
1. Started with vanilla HTML/CSS/JS dashboard
2. User requested complete rebuild with React
3. Chose Vite + React + Tailwind + Recharts
4. Discovered xStocks not available via public API
5. Set up Cloudflare Worker with API auth (didn't help)
6. Implemented static placeholder for xStocks
7. Deployed to GitHub Pages with custom domain
