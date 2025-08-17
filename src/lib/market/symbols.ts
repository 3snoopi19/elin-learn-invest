export interface SymbolInfo {
  symbol: string;
  displayName: string;
  assetClass: 'equity' | 'etf' | 'crypto';
  providerSymbol?: string;
}

export const SYMBOL_REGISTRY: Record<string, SymbolInfo> = {
  'AAPL': {
    symbol: 'AAPL',
    displayName: 'Apple Inc.',
    assetClass: 'equity'
  },
  'MSFT': {
    symbol: 'MSFT',
    displayName: 'Microsoft Corp.',
    assetClass: 'equity'
  },
  'TSLA': {
    symbol: 'TSLA',
    displayName: 'Tesla Inc.',
    assetClass: 'equity'
  },
  'NVDA': {
    symbol: 'NVDA',
    displayName: 'NVIDIA Corp.',
    assetClass: 'equity'
  },
  'GOOGL': {
    symbol: 'GOOGL',
    displayName: 'Alphabet Inc.',
    assetClass: 'equity'
  },
  'AMZN': {
    symbol: 'AMZN',
    displayName: 'Amazon.com Inc.',
    assetClass: 'equity'
  },
  'SPY': {
    symbol: 'SPY',
    displayName: 'SPDR S&P 500 ETF',
    assetClass: 'etf'
  },
  'QQQ': {
    symbol: 'QQQ',
    displayName: 'Invesco QQQ Trust',
    assetClass: 'etf'
  },
  'BTC-USD': {
    symbol: 'BTC-USD',
    displayName: 'Bitcoin',
    assetClass: 'crypto',
    providerSymbol: 'BINANCE:BTCUSDT'
  },
  'ETH-USD': {
    symbol: 'ETH-USD',
    displayName: 'Ethereum',
    assetClass: 'crypto',
    providerSymbol: 'BINANCE:ETHUSDT'
  }
};

export function getSymbolInfo(symbol: string): SymbolInfo {
  const normalizedSymbol = symbol.toUpperCase();
  return SYMBOL_REGISTRY[normalizedSymbol] || {
    symbol: normalizedSymbol,
    displayName: normalizedSymbol,
    assetClass: 'equity'
  };
}

export function getProviderSymbol(symbol: string): string {
  const info = getSymbolInfo(symbol);
  return info.providerSymbol || info.symbol;
}

export const DEFAULT_SYMBOLS = ['AAPL', 'MSFT', 'TSLA', 'NVDA', 'GOOGL', 'SPY'];