/**
 * SEC EDGAR API Integration
 * Official SEC API for company filings and submissions
 */

export interface Filing {
  accessionNumber: string;
  filingDate: string;
  reportDate: string;
  acceptanceDateTime: string;
  act: string;
  form: string;
  fileNumber: string;
  filmNumber: string;
  items: string;
  size: number;
  isXBRL: boolean;
  isInlineXBRL: boolean;
  primaryDocument: string;
  primaryDocDescription: string;
}

export interface CompanySubmissions {
  cik: string;
  entityType: string;
  sic: string;
  sicDescription: string;
  name: string;
  tickers: string[];
  exchanges: string[];
  ein: string;
  description: string;
  website: string;
  investorWebsite: string;
  category: string;
  fiscalYearEnd: string;
  stateOfIncorporation: string;
  stateOfIncorporationDescription: string;
  addresses: {
    mailing: Address;
    business: Address;
  };
  phone: string;
  flags: string;
  formerNames: FormerName[];
  filings: {
    recent: FilingsRecent;
    files: FileInfo[];
  };
}

export interface Address {
  street1: string;
  street2?: string;
  city: string;
  stateOrCountry: string;
  zipCode: string;
  stateOrCountryDescription: string;
}

export interface FormerName {
  name: string;
  from: string;
  to: string;
}

export interface FilingsRecent {
  accessionNumber: string[];
  filingDate: string[];
  reportDate: string[];
  acceptanceDateTime: string[];
  act: string[];
  form: string[];
  fileNumber: string[];
  filmNumber: string[];
  items: string[];
  size: number[];
  isXBRL: number[];
  isInlineXBRL: number[];
  primaryDocument: string[];
  primaryDocDescription: string[];
}

export interface FileInfo {
  name: string;
  filingCount: number;
  filingFrom: string;
  filingTo: string;
}

// Mock SEC EDGAR service for development
export class MockSECEdgarService {
  private readonly SEC_BASE_URL = 'https://data.sec.gov';
  private readonly USER_AGENT = 'AI Investment Mentor educational-only@example.com';

  private mockFilings: Record<string, Filing[]> = {
    '0000320193': [ // Apple
      {
        accessionNumber: '0000320193-23-000077',
        filingDate: '2023-08-04',
        reportDate: '2023-07-01',
        acceptanceDateTime: '2023-08-04T06:01:36.000Z',
        act: '34',
        form: '10-Q',
        fileNumber: '001-36743',
        filmNumber: '231208398',
        items: '1.01,1.02,2.02,9.01',
        size: 8547234,
        isXBRL: true,
        isInlineXBRL: true,
        primaryDocument: 'aapl-20230701x10q.htm',
        primaryDocDescription: '10-Q'
      },
      {
        accessionNumber: '0000320193-23-000106',
        filingDate: '2023-11-03',
        reportDate: '2023-09-30',
        acceptanceDateTime: '2023-11-03T06:01:41.000Z',
        act: '34',
        form: '10-K',
        fileNumber: '001-36743',
        filmNumber: '231432187',
        items: '1.01,1.02,2.02,9.01',
        size: 12847234,
        isXBRL: true,
        isInlineXBRL: true,
        primaryDocument: 'aapl-20230930x10k.htm',
        primaryDocDescription: '10-K'
      }
    ]
  };

  async searchCompanyByCIK(cik: string): Promise<CompanySubmissions | null> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (cik === '0000320193') {
      return {
        cik: '0000320193',
        entityType: 'operating',
        sic: '3571',
        sicDescription: 'Electronic Computers',
        name: 'Apple Inc.',
        tickers: ['AAPL'],
        exchanges: ['Nasdaq'],
        ein: '942404110',
        description: 'Apple Inc.',
        website: 'https://www.apple.com',
        investorWebsite: 'https://investor.apple.com',
        category: 'Large accelerated filer',
        fiscalYearEnd: '0930',
        stateOfIncorporation: 'CA',
        stateOfIncorporationDescription: 'CA',
        addresses: {
          mailing: {
            street1: 'One Apple Park Way',
            city: 'Cupertino',
            stateOrCountry: 'CA',
            zipCode: '95014',
            stateOrCountryDescription: 'CA'
          },
          business: {
            street1: 'One Apple Park Way',
            city: 'Cupertino',
            stateOrCountry: 'CA',
            zipCode: '95014',
            stateOrCountryDescription: 'CA'
          }
        },
        phone: '(408) 996-1010',
        flags: '',
        formerNames: [],
        filings: {
          recent: {
            accessionNumber: ['0000320193-23-000077', '0000320193-23-000106'],
            filingDate: ['2023-08-04', '2023-11-03'],
            reportDate: ['2023-07-01', '2023-09-30'],
            acceptanceDateTime: ['2023-08-04T06:01:36.000Z', '2023-11-03T06:01:41.000Z'],
            act: ['34', '34'],
            form: ['10-Q', '10-K'],
            fileNumber: ['001-36743', '001-36743'],
            filmNumber: ['231208398', '231432187'],
            items: ['1.01,1.02,2.02,9.01', '1.01,1.02,2.02,9.01'],
            size: [8547234, 12847234],
            isXBRL: [1, 1],
            isInlineXBRL: [1, 1],
            primaryDocument: ['aapl-20230701x10q.htm', 'aapl-20230930x10k.htm'],
            primaryDocDescription: ['10-Q', '10-K']
          },
          files: []
        }
      };
    }
    
    return null;
  }

  async searchCompanyByTicker(ticker: string): Promise<CompanySubmissions | null> {
    // For demo, only support AAPL
    if (ticker.toUpperCase() === 'AAPL') {
      return this.searchCompanyByCIK('0000320193');
    }
    return null;
  }

  async getFilings(cik: string): Promise<Filing[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.mockFilings[cik] || [];
  }

  async getFilingContent(cik: string, accessionNumber: string, primaryDocument: string): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Return mock filing content
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Form 10-K - Apple Inc.</title>
</head>
<body>
    <h1>UNITED STATES SECURITIES AND EXCHANGE COMMISSION</h1>
    <h2>FORM 10-K</h2>
    
    <div class="business-overview">
        <h3>PART I</h3>
        <h4>Item 1. Business</h4>
        <p>Apple Inc. ("Apple" or the "Company") designs, manufactures and markets smartphones, personal computers, tablets, wearables and accessories worldwide...</p>
    </div>
    
    <div class="risk-factors">
        <h4>Item 1A. Risk Factors</h4>
        <p>The Company's business, reputation, results of operations, financial condition and stock price can be affected by a number of factors...</p>
    </div>
    
    <div class="selected-financial-data">
        <h4>Item 6. Selected Financial Data</h4>
        <table>
            <tr><th>Year</th><th>Net Sales</th><th>Net Income</th></tr>
            <tr><td>2023</td><td>$383,285M</td><td>$96,995M</td></tr>
            <tr><td>2022</td><td>$394,328M</td><td>$99,803M</td></tr>
        </table>
    </div>
</body>
</html>
    `;
  }

  // Utility method to format filing URLs
  getFilingUrl(cik: string, accessionNumber: string, primaryDocument: string): string {
    const cleanAccession = accessionNumber.replace(/-/g, '');
    return `${this.SEC_BASE_URL}/Archives/edgar/data/${cik}/${cleanAccession}/${primaryDocument}`;
  }
}

// Export singleton instance
export const secEdgarService = new MockSECEdgarService();