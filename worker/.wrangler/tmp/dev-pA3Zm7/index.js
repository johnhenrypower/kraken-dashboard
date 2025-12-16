var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/bundle-A7RkAD/checked-fetch.js
var urls = /* @__PURE__ */ new Set();
function checkURL(request, init) {
  const url = request instanceof URL ? request : new URL(
    (typeof request === "string" ? new Request(request, init) : request).url
  );
  if (url.port && url.port !== "443" && url.protocol === "https:") {
    if (!urls.has(url.toString())) {
      urls.add(url.toString());
      console.warn(
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
      );
    }
  }
}
__name(checkURL, "checkURL");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    const [request, init] = argArray;
    checkURL(request, init);
    return Reflect.apply(target, thisArg, argArray);
  }
});

// index.js
var KRAKEN_API_URL = "https://api.kraken.com";
var XSTOCK_PAIRS = [
  "AAPLxUSD",
  "TSLAxUSD",
  "NVDAxUSD",
  "GOOGLxUSD",
  "AMZNxUSD",
  "MSFTxUSD",
  "METAxUSD",
  "NFLXxUSD",
  "AMDxUSD",
  "INTCxUSD",
  "COINxUSD",
  "HOODxUSD",
  "MSTRxUSD",
  "SPYxUSD",
  "QQQxUSD",
  "IWMxUSD",
  "GLDxUSD",
  "SLVxUSD",
  "GMExUSD"
];
var COMPANY_NAMES = {
  "AAPL": "Apple Inc.",
  "TSLA": "Tesla Inc.",
  "NVDA": "NVIDIA Corp.",
  "GOOGL": "Alphabet Inc.",
  "AMZN": "Amazon.com",
  "MSFT": "Microsoft Corp.",
  "META": "Meta Platforms",
  "NFLX": "Netflix Inc.",
  "AMD": "AMD Inc.",
  "INTC": "Intel Corp.",
  "COIN": "Coinbase Global",
  "HOOD": "Robinhood",
  "MSTR": "MicroStrategy",
  "SPY": "S&P 500 ETF",
  "QQQ": "Nasdaq 100 ETF",
  "IWM": "Russell 2000 ETF",
  "GLD": "Gold ETF",
  "SLV": "Silver ETF",
  "GME": "GameStop Corp."
};
async function fetchXStocksAssets(apiKey, apiSecret) {
  const response = await fetch(
    `${KRAKEN_API_URL}/0/public/Assets?aclass=currency`
  );
  const data = await response.json();
  if (data.error && data.error.length > 0) {
    return { error: data.error };
  }
  const xstockAssets = {};
  for (const [symbol, info] of Object.entries(data.result || {})) {
    if (symbol.endsWith("x") && symbol.length > 2) {
      xstockAssets[symbol] = info;
    }
  }
  return { result: xstockAssets };
}
__name(fetchXStocksAssets, "fetchXStocksAssets");
function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400"
  };
}
__name(corsHeaders, "corsHeaders");
var index_default = {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin");
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders(origin) });
    }
    const hasKeys = !!(env.KRAKEN_API_KEY && env.KRAKEN_API_SECRET);
    try {
      if (url.pathname === "/health") {
        return Response.json(
          { status: "ok", configured: hasKeys },
          { headers: corsHeaders(origin) }
        );
      }
      if (url.pathname === "/api/xstocks") {
        const xstocks = [];
        for (const pair of XSTOCK_PAIRS) {
          try {
            const response = await fetch(
              `${KRAKEN_API_URL}/0/public/Ticker?pair=${pair}`
            );
            const data = await response.json();
            if (data.result && Object.keys(data.result).length > 0) {
              const [pairKey, tickerData] = Object.entries(data.result)[0];
              const symbol = pair.replace("xUSD", "").replace("USD", "");
              const volume24h = parseFloat(tickerData.v?.[1]) || 0;
              const lastPrice = parseFloat(tickerData.c?.[0]) || 0;
              const openPrice = parseFloat(tickerData.o) || 0;
              const change = openPrice > 0 ? (lastPrice - openPrice) / openPrice * 100 : 0;
              xstocks.push({
                pair: pairKey,
                symbol,
                company: COMPANY_NAMES[symbol] || "Tokenized Equity",
                price: lastPrice,
                change24h: change,
                volume24h,
                volumeUSD: volume24h * lastPrice,
                trades24h: parseInt(tickerData.t?.[1]) || 0,
                high24h: parseFloat(tickerData.h?.[1]) || 0,
                low24h: parseFloat(tickerData.l?.[1]) || 0
              });
            }
          } catch (e) {
            console.log(`Failed to fetch ${pair}:`, e.message);
          }
        }
        xstocks.sort((a, b) => b.volumeUSD - a.volumeUSD);
        const totalVolume = xstocks.reduce((sum, x) => sum + x.volumeUSD, 0);
        return Response.json({
          configured: hasKeys,
          available: xstocks.length > 0,
          count: xstocks.length,
          totalVolume,
          xstocks,
          knownPairs: XSTOCK_PAIRS,
          lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
        }, { headers: corsHeaders(origin) });
      }
      if (url.pathname === "/api/xstocks/count") {
        const assetData = await fetchXStocksAssets(
          env.KRAKEN_API_KEY,
          env.KRAKEN_API_SECRET
        );
        const count = Object.keys(assetData.result || {}).length;
        return Response.json({
          count,
          configured: hasKeys
        }, { headers: corsHeaders(origin) });
      }
      return Response.json(
        { error: "Not found" },
        { status: 404, headers: corsHeaders(origin) }
      );
    } catch (error) {
      console.error("Worker error:", error);
      return Response.json(
        { error: error.message || "Internal server error" },
        { status: 500, headers: corsHeaders(origin) }
      );
    }
  }
};

// ../../../../../.npm/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../../../../../.npm/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-A7RkAD/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = index_default;

// ../../../../../.npm/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-A7RkAD/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
