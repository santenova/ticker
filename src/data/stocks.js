o// Curated universe of well-known, liquid US-listed symbols.
export const STOCKS = [
  { symbol: 'AAPL', name: 'Apple Inc.', sector: 'Technology' },
  { symbol: 'MSFT', name: 'Microsoft Corp.', sector: 'Technology' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', sector: 'Semiconductors' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', sector: 'Consumer' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', sector: 'Technology' },
  { symbol: 'META', name: 'Meta Platforms Inc.', sector: 'Technology' },
  { symbol: 'TSLA', name: 'Tesla Inc.', sector: 'Automotive' },
  { symbol: 'AVGO', name: 'Broadcom Inc.', sector: 'Semiconductors' },
  { symbol: 'AMD', name: 'Advanced Micro Devices', sector: 'Semiconductors' },
  { symbol: 'INTC', name: 'Intel Corp.', sector: 'Semiconductors' },
  { symbol: 'QCOM', name: 'Qualcomm Inc.', sector: 'Semiconductors' },
  { symbol: 'TSM', name: 'Taiwan Semiconductor', sector: 'Semiconductors' },
  { symbol: 'MU', name: 'Micron Technology', sector: 'Semiconductors' },
  { symbol: 'ORCL', name: 'Oracle Corp.', sector: 'Software' },
  { symbol: 'CRM', name: 'Salesforce Inc.', sector: 'Software' },
  { symbol: 'ADBE', name: 'Adobe Inc.', sector: 'Software' },
  { symbol: 'PLTR', name: 'Palantir Technologies', sector: 'Software' },
  { symbol: 'NOW', name: 'ServiceNow Inc.', sector: 'Software' },
  { symbol: 'NFLX', name: 'Netflix Inc.', sector: 'Media' },
  { symbol: 'DIS', name: 'Walt Disney Co.', sector: 'Media' },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', sector: 'Financials' },
  { symbol: 'BAC', name: 'Bank of America', sector: 'Financials' },
  { symbol: 'GS', name: 'Goldman Sachs Group', sector: 'Financials' },
  { symbol: 'V', name: 'Visa Inc.', sector: 'Financials' },
  { symbol: 'MA', name: 'Mastercard Inc.', sector: 'Financials' },
  { symbol: 'PYPL', name: 'PayPal Holdings', sector: 'Financials' },
  { symbol: 'COIN', name: 'Coinbase Global', sector: 'Financials' },
  { symbol: 'BRK-B', name: 'Berkshire Hathaway', sector: 'Financials' },
  { symbol: 'XOM', name: 'Exxon Mobil Corp.', sector: 'Energy' },
  { symbol: 'CVX', name: 'Chevron Corp.', sector: 'Energy' },
  { symbol: 'WMT', name: 'Walmart Inc.', sector: 'Retail' },
  { symbol: 'COST', name: 'Costco Wholesale', sector: 'Retail' },
  { symbol: 'HD', name: 'Home Depot Inc.', sector: 'Retail' },
  { symbol: 'NKE', name: 'Nike Inc.', sector: 'Retail' },
  { symbol: 'SBUX', name: 'Starbucks Corp.', sector: 'Consumer' },
  { symbol: 'KO', name: 'Coca-Cola Co.', sector: 'Consumer' },
  { symbol: 'PEP', name: 'PepsiCo Inc.', sector: 'Consumer' },
  { symbol: 'PG', name: 'Procter & Gamble', sector: 'Consumer' },
  { symbol: 'LLY', name: 'Eli Lilly & Co.', sector: 'Healthcare' },
  { symbol: 'UNH', name: 'UnitedHealth Group', sector: 'Healthcare' },
  { symbol: 'JNJ', name: 'Johnson & Johnson', sector: 'Healthcare' },
  { symbol: 'MRK', name: 'Merck & Co.', sector: 'Healthcare' },
  { symbol: 'ABBV', name: 'AbbVie Inc.', sector: 'Healthcare' },
  { symbol: 'BA', name: 'Boeing Co.', sector: 'Industrials' },
  { symbol: 'CAT', name: 'Caterpillar Inc.', sector: 'Industrials' },
  { symbol: 'GE', name: 'GE Aerospace', sector: 'Industrials' },
  { symbol: 'UBER', name: 'Uber Technologies', sector: 'Industrials' },
  { symbol: 'F', name: 'Ford Motor Co.', sector: 'Automotive' },
  { symbol: 'GM', name: 'General Motors Co.', sector: 'Automotive' },
  { symbol: 'SHOP', name: 'Shopify Inc.', sector: 'Software' },
];

export function searchStocks(query) {
  const q = (query || '').trim().toUpperCase();
  if (!q) return STOCKS.slice(0, 8);
  return STOCKS.filter(
    (s) => s.symbol.startsWith(q) || s.name.toUpperCase().includes(q)
  ).slice(0, 8);
}

export function getStock(symbol) {
  return STOCKS.find((s) => s.symbol === symbol);
}

export function isKnownSymbol(symbol) {
  return Boolean(getStock(symbol));
}