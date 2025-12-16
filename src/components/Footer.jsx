export function Footer() {
  return (
    <footer className="text-center py-8 px-4 border-t border-white/5">
      <div className="max-w-4xl mx-auto">
        <p className="text-gray-400 mb-2">
          <span className="font-semibold text-white">IPO filed November 2025</span>
          {' | '}
          <span>Target: Q1 2026</span>
          {' | '}
          <span className="gradient-text font-semibold">Valuation: $20B</span>
        </p>
        <p className="text-sm text-gray-500">
          Data sourced from{' '}
          <a
            href="https://www.kraken.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-kraken-purple hover:text-kraken-pink transition-colors"
          >
            Kraken
          </a>
          {' '}Public API
        </p>
        <p className="text-xs text-gray-600 mt-4">
          This dashboard is for informational purposes only and does not constitute financial advice.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
