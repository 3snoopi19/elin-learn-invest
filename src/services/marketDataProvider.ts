/**
 * Market Data Provider Interface
 * Abstraction layer for market data APIs (Polygon, IEX, Yahoo Finance, etc.)
 */

export interface MarketData {
  ticker: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  lastUpdated: string;
}

export interface CompanyInfo {
  ticker: string;
  name: string;
  sector: string;
  industry: string;
  description: string;
  website?: string;
  employees?: number;
  cik?: string; // SEC CIK for filing lookups
}

export interface MarketDataProvider {
  getQuote(ticker: string): Promise<MarketData>;
  getCompanyInfo(ticker: string): Promise<CompanyInfo>;
  searchCompanies(query: string): Promise<CompanyInfo[]>;
}

// Mock provider for development
export class MockMarketDataProvider implements MarketDataProvider {
  private mockData: Record<string, { market: MarketData; company: CompanyInfo }> = {
    'AAPL': {
      market: {
        ticker: 'AAPL',
        price: 175.50,
        change: 2.15,
        changePercent: 1.24,
        volume: 45230000,
        marketCap: 2800000000000,
        lastUpdated: new Date().toISOString()
      },
      company: {
        ticker: 'AAPL',
        name: 'Apple Inc.',
        sector: 'Technology',
        industry: 'Consumer Electronics',
        description: 'Apple Inc. designs, manufactures, and markets consumer electronics, computer software, and online services.',
        website: 'https://www.apple.com',
        employees: 164000,
        cik: '0000320193'
      }
    },
    'TSLA': {
      market: {
        ticker: 'TSLA',
        price: 238.75,
        change: -5.25,
        changePercent: -2.15,
        volume: 89450000,
        marketCap: 758000000000,
        lastUpdated: new Date().toISOString()
      },
      company: {
        ticker: 'TSLA',
        name: 'Tesla, Inc.',
        sector: 'Consumer Discretionary',
        industry: 'Automobiles',
        description: 'Tesla, Inc. designs, develops, manufactures, leases, and sells electric vehicles, and energy generation and storage systems.',
        website: 'https://www.tesla.com',
        employees: 127855,
        cik: '0001318605'
      }
    },
    'SPY': {
      market: {
        ticker: 'SPY',
        price: 445.20,
        change: 0.85,
        changePercent: 0.19,
        volume: 23150000,
        lastUpdated: new Date().toISOString()
      },
      company: {
        ticker: 'SPY',
        name: 'SPDR S&P 500 ETF Trust',
        sector: 'Exchange Traded Fund',
        industry: 'Large Blend',
        description: 'The SPDR S&P 500 ETF Trust seeks to track the S&P 500 Index, which is a market-cap weighted index of 500 leading U.S. companies.',
        website: 'https://www.ssga.com'
      }
    }
  };

  async getQuote(ticker: string): Promise<MarketData> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const data = this.mockData[ticker.toUpperCase()];
    if (!data) {
      throw new Error(`Quote not found for ticker: ${ticker}`);
    }
    
    return data.market;
  }

  async getCompanyInfo(ticker: string): Promise<CompanyInfo> {
    await new Promise(resolve => setTimeout(resolve, 150));
    
    const data = this.mockData[ticker.toUpperCase()];
    if (!data) {
      throw new Error(`Company info not found for ticker: ${ticker}`);
    }
    
    return data.company;
  }

  async searchCompanies(query: string): Promise<CompanyInfo[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const results = Object.values(this.mockData)
      .map(data => data.company)
      .filter(company => 
        company.name.toLowerCase().includes(query.toLowerCase()) ||
        company.ticker.toLowerCase().includes(query.toLowerCase())
      );
    
    return results;
  }
}

// Export singleton instance
export const marketDataProvider = new MockMarketDataProvider();