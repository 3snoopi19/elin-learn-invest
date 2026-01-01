export interface GlossaryTerm {
  term: string;
  definition: string;
  category: 'basics' | 'investing' | 'credit' | 'budgeting' | 'taxes' | 'retirement';
  relatedTerms?: string[];
}

export const financialGlossary: GlossaryTerm[] = [
  // Basics
  {
    term: "APR",
    definition: "The yearly cost of borrowing money, shown as a percentage. It includes interest plus any fees.",
    category: "basics",
    relatedTerms: ["APY", "Interest Rate"]
  },
  {
    term: "APY",
    definition: "The real return you earn on savings in a year, including compound interest. Higher is better for your savings.",
    category: "basics",
    relatedTerms: ["APR", "Compound Interest"]
  },
  {
    term: "Compound Interest",
    definition: "When you earn interest on your interest. Your money grows faster because you're earning on a bigger pile each time.",
    category: "basics",
    relatedTerms: ["APY", "Simple Interest"]
  },
  {
    term: "Net Worth",
    definition: "Everything you own (assets) minus everything you owe (debts). It's your financial score.",
    category: "basics",
    relatedTerms: ["Assets", "Liabilities"]
  },
  {
    term: "Liquidity",
    definition: "How quickly you can turn something into cash without losing value. Cash is the most liquid.",
    category: "basics"
  },
  {
    term: "Principal",
    definition: "The original amount of money you borrow or invest, before any interest is added.",
    category: "basics",
    relatedTerms: ["Interest Rate"]
  },
  
  // Investing
  {
    term: "Expense Ratio",
    definition: "The yearly fee a fund charges to manage your money, shown as a percentage. Lower is better.",
    category: "investing",
    relatedTerms: ["ETF", "Mutual Fund"]
  },
  {
    term: "ETF",
    definition: "A basket of investments you can buy like a single stock. Often cheaper than mutual funds.",
    category: "investing",
    relatedTerms: ["Expense Ratio", "Mutual Fund", "Index Fund"]
  },
  {
    term: "Index Fund",
    definition: "A fund that automatically copies a market index like the S&P 500. Low-cost way to invest in the whole market.",
    category: "investing",
    relatedTerms: ["ETF", "S&P 500"]
  },
  {
    term: "Dividend",
    definition: "Cash payments companies send you for owning their stock. Like getting a thank-you bonus.",
    category: "investing",
    relatedTerms: ["Yield", "Stock"]
  },
  {
    term: "Diversification",
    definition: "Spreading your money across different investments so one bad pick doesn't sink you. Don't put all eggs in one basket.",
    category: "investing",
    relatedTerms: ["Asset Allocation", "Risk"]
  },
  {
    term: "Bull Market",
    definition: "When stock prices are rising and investors are optimistic. The bull charges upward.",
    category: "investing",
    relatedTerms: ["Bear Market"]
  },
  {
    term: "Bear Market",
    definition: "When stock prices drop 20% or more from recent highs. The bear swipes down.",
    category: "investing",
    relatedTerms: ["Bull Market"]
  },
  {
    term: "Market Cap",
    definition: "The total value of a company's stock. Share price times number of shares.",
    category: "investing"
  },
  {
    term: "P/E Ratio",
    definition: "Stock price divided by earnings per share. Shows how much investors pay for $1 of profit.",
    category: "investing"
  },
  {
    term: "Yield",
    definition: "The income return on an investment, shown as a percentage of what you paid.",
    category: "investing",
    relatedTerms: ["Dividend", "APY"]
  },
  
  // Credit
  {
    term: "Credit Score",
    definition: "A number (300-850) that shows how reliable you are at repaying debt. Higher means better loan terms.",
    category: "credit",
    relatedTerms: ["Credit Report", "FICO"]
  },
  {
    term: "Credit Utilization",
    definition: "How much of your available credit you're using. Keep it under 30% for a healthy score.",
    category: "credit",
    relatedTerms: ["Credit Score", "Credit Limit"]
  },
  {
    term: "Minimum Payment",
    definition: "The smallest amount you can pay on your credit card to avoid penalties. Paying only this costs you way more in interest.",
    category: "credit",
    relatedTerms: ["APR", "Interest"]
  },
  {
    term: "Hard Inquiry",
    definition: "When a lender checks your credit for a loan decision. Too many can hurt your score temporarily.",
    category: "credit",
    relatedTerms: ["Soft Inquiry", "Credit Score"]
  },
  {
    term: "Secured Card",
    definition: "A credit card backed by a cash deposit. Good for building credit from scratch.",
    category: "credit",
    relatedTerms: ["Credit Score"]
  },
  
  // Budgeting
  {
    term: "50/30/20 Rule",
    definition: "A simple budget: 50% for needs, 30% for wants, 20% for savings and debt payoff.",
    category: "budgeting",
    relatedTerms: ["Budget", "Emergency Fund"]
  },
  {
    term: "Emergency Fund",
    definition: "Savings set aside for unexpected expenses. Aim for 3-6 months of living costs.",
    category: "budgeting",
    relatedTerms: ["Savings", "Liquidity"]
  },
  {
    term: "Sinking Fund",
    definition: "Money you save a little at a time for a planned future expense, like a vacation or car repair.",
    category: "budgeting"
  },
  {
    term: "Fixed Expense",
    definition: "A bill that stays the same each month, like rent or a subscription.",
    category: "budgeting",
    relatedTerms: ["Variable Expense"]
  },
  {
    term: "Variable Expense",
    definition: "A cost that changes month to month, like groceries or gas.",
    category: "budgeting",
    relatedTerms: ["Fixed Expense"]
  },
  {
    term: "Cash Flow",
    definition: "Money coming in minus money going out. Positive means you're saving; negative means you're spending more than you earn.",
    category: "budgeting"
  },
  
  // Taxes
  {
    term: "Tax Bracket",
    definition: "The percentage rate at which your income is taxed. Higher income = higher brackets on the extra money.",
    category: "taxes",
    relatedTerms: ["Marginal Tax Rate"]
  },
  {
    term: "Tax Deduction",
    definition: "An expense that lowers your taxable income. Less income taxed = lower tax bill.",
    category: "taxes",
    relatedTerms: ["Tax Credit"]
  },
  {
    term: "Tax Credit",
    definition: "A dollar-for-dollar reduction in your tax bill. Even better than a deduction.",
    category: "taxes",
    relatedTerms: ["Tax Deduction"]
  },
  {
    term: "W-2",
    definition: "A form your employer gives you showing how much you earned and taxes withheld.",
    category: "taxes"
  },
  {
    term: "1099",
    definition: "A tax form for income you earned outside a regular job, like freelancing or investments.",
    category: "taxes"
  },
  
  // Retirement
  {
    term: "401(k)",
    definition: "A retirement savings account through your employer. Often comes with free matching money.",
    category: "retirement",
    relatedTerms: ["IRA", "Employer Match"]
  },
  {
    term: "IRA",
    definition: "Individual Retirement Account. A tax-advantaged way to save for retirement on your own.",
    category: "retirement",
    relatedTerms: ["401(k)", "Roth IRA"]
  },
  {
    term: "Roth IRA",
    definition: "A retirement account where you pay taxes now but withdrawals in retirement are tax-free.",
    category: "retirement",
    relatedTerms: ["IRA", "Traditional IRA"]
  },
  {
    term: "Employer Match",
    definition: "Free money your employer adds to your 401(k) when you contribute. Always take the full match.",
    category: "retirement",
    relatedTerms: ["401(k)"]
  },
  {
    term: "Vesting",
    definition: "How long you must work before employer contributions to your retirement are fully yours.",
    category: "retirement",
    relatedTerms: ["401(k)", "Employer Match"]
  }
];

export const categories = [
  { id: 'all', label: 'All Terms', icon: '📚' },
  { id: 'basics', label: 'Money Basics', icon: '💵' },
  { id: 'investing', label: 'Investing', icon: '📈' },
  { id: 'credit', label: 'Credit & Debt', icon: '💳' },
  { id: 'budgeting', label: 'Budgeting', icon: '📊' },
  { id: 'taxes', label: 'Taxes', icon: '🧾' },
  { id: 'retirement', label: 'Retirement', icon: '🏖️' },
];

export const downloadableTools = [
  {
    id: 'budget-sheet',
    title: '50/30/20 Budget Sheet',
    description: 'A simple spreadsheet to track your needs, wants, and savings.',
    format: 'Excel/Google Sheets',
    icon: '📊',
    color: 'from-emerald-500/20 to-emerald-600/10',
  },
  {
    id: 'debt-planner',
    title: 'Debt Payoff Planner',
    description: 'Plan your debt-free journey with avalanche or snowball methods.',
    format: 'PDF',
    icon: '💳',
    color: 'from-blue-500/20 to-blue-600/10',
  },
  {
    id: 'subscription-audit',
    title: 'Subscription Audit Checklist',
    description: 'Find and cancel subscriptions you forgot about.',
    format: 'PDF',
    icon: '✅',
    color: 'from-purple-500/20 to-purple-600/10',
  },
  {
    id: 'net-worth-tracker',
    title: 'Net Worth Tracker',
    description: 'Monthly tracker to watch your wealth grow over time.',
    format: 'Excel/Google Sheets',
    icon: '📈',
    color: 'from-amber-500/20 to-amber-600/10',
  },
  {
    id: 'emergency-fund-calc',
    title: 'Emergency Fund Calculator',
    description: 'Figure out exactly how much you need in your safety net.',
    format: 'PDF',
    icon: '🛡️',
    color: 'from-red-500/20 to-red-600/10',
  },
];
