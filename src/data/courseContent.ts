export const courseContent = {
  1: { // Investment Fundamentals
    modules: [
      {
        title: "Introduction to Investing",
        lessons: [
          {
            id: "intro-1",
            title: "What is Investing?",
            type: "video" as const,
            duration: "12 min",
            completed: true,
            content: {
              summary: "Learn the fundamental concepts of investing and how it differs from saving. Understand the basic principles that drive investment returns and the importance of starting early.",
              keyPoints: [
                "Investing is putting money to work to generate returns over time",
                "The power of compound interest and time in wealth building",
                "Difference between saving and investing",
                "Risk tolerance and investment timeline considerations",
                "The importance of diversification in reducing risk"
              ]
            }
          },
          {
            id: "intro-2",
            title: "Risk vs Return Basics",
            type: "article" as const,
            duration: "8 min",
            completed: true,
            content: {
              sections: [
                {
                  title: "Understanding Risk and Return",
                  content: "Risk and return are the two fundamental concepts in investing. Generally, investments with higher potential returns come with higher risk. Understanding this relationship is crucial for making informed investment decisions.",
                  example: "Government bonds typically offer lower returns but are very safe, while stocks offer higher potential returns but with more volatility."
                },
                {
                  title: "Types of Investment Risk",
                  content: "There are several types of risk investors face: market risk, inflation risk, liquidity risk, and company-specific risk. Each type affects your investments differently.",
                  example: "Market risk affects all stocks during a market downturn, while company-specific risk only affects individual companies, like when a CEO resignation causes a stock to drop."
                },
                {
                  title: "Risk Tolerance Assessment",
                  content: "Your risk tolerance depends on your age, financial goals, income stability, and personal comfort with volatility. Younger investors can typically take on more risk since they have time to recover from losses.",
                  example: "A 25-year-old saving for retirement can afford more stock exposure than a 60-year-old nearing retirement who needs capital preservation."
                }
              ]
            }
          },
          {
            id: "intro-3",
            title: "Getting Started Quiz",
            type: "quiz" as const,
            duration: "5 min",
            completed: false,
            content: {
              questions: [
                {
                  question: "What is the primary benefit of starting to invest early?",
                  options: [
                    "You can take bigger risks",
                    "Compound interest has more time to work",
                    "Investment fees are lower",
                    "Markets always go up over time"
                  ],
                  correct: "Compound interest has more time to work",
                  explanation: "Starting early allows compound interest to work over a longer period, significantly increasing wealth accumulation."
                },
                {
                  question: "Which statement about risk and return is most accurate?",
                  options: [
                    "Higher risk always means higher returns",
                    "There is generally a positive relationship between risk and potential return",
                    "Risk can be completely eliminated through diversification",
                    "Low-risk investments always outperform in the long term"
                  ],
                  correct: "There is generally a positive relationship between risk and potential return",
                  explanation: "While higher risk doesn't guarantee higher returns, there's typically a positive correlation between risk and expected return."
                }
              ]
            }
          }
        ]
      },
      {
        title: "Stock Market Fundamentals",
        lessons: [
          {
            id: "stock-1",
            title: "How Stock Markets Work",
            type: "video" as const,
            duration: "15 min",
            completed: false,
            content: {
              summary: "Explore how stock markets function, from order matching to price discovery. Learn about different types of orders, market makers, and the role of exchanges.",
              keyPoints: [
                "Stock exchanges facilitate buying and selling of shares",
                "Market makers provide liquidity and narrow bid-ask spreads",
                "Order types: market orders, limit orders, stop orders",
                "Price discovery through supply and demand",
                "Role of brokers and electronic trading systems"
              ]
            }
          },
          {
            id: "stock-2",
            title: "Types of Stocks",
            type: "article" as const,
            duration: "10 min",
            completed: false,
            content: {
              sections: [
                {
                  title: "Common vs Preferred Stocks",
                  content: "Common stocks give you ownership in a company with voting rights and potential dividends. Preferred stocks typically have fixed dividends and priority over common stockholders but usually no voting rights.",
                  example: "Apple common stock (AAPL) gives you voting rights and potential capital appreciation, while preferred stock would give you fixed dividend payments."
                },
                {
                  title: "Growth vs Value Stocks",
                  content: "Growth stocks are companies expected to grow faster than the market average, often reinvesting profits rather than paying dividends. Value stocks appear undervalued relative to their fundamentals.",
                  example: "Tesla was considered a growth stock due to rapid expansion, while Coca-Cola might be considered a value stock with steady dividends and stable business."
                },
                {
                  title: "Market Capitalization Categories",
                  content: "Companies are categorized by market cap: large-cap (>$10B), mid-cap ($2-10B), and small-cap (<$2B). Each category has different risk and return characteristics.",
                  example: "Microsoft is large-cap with stability, while a small biotech company might be small-cap with higher growth potential and risk."
                }
              ]
            }
          },
          {
            id: "stock-3",
            title: "Reading Stock Quotes",
            type: "interactive" as const,
            duration: "12 min",
            completed: false,
            content: {
              exerciseTitle: "Stock Quote Analysis",
              description: "Practice reading and interpreting real stock quotes to understand key metrics and price movements.",
              steps: [
                {
                  title: "Identify the Ticker Symbol",
                  instruction: "Look at this stock quote and identify the ticker symbol. Ticker symbols are unique identifiers for each stock.",
                  input: {
                    label: "Enter the ticker symbol",
                    placeholder: "e.g., AAPL"
                  }
                },
                {
                  title: "Analyze Price Movement",
                  instruction: "Calculate the percentage change from the previous day's closing price. Use the formula: (Current Price - Previous Close) / Previous Close × 100",
                  input: {
                    label: "Percentage change (%)",
                    placeholder: "e.g., +2.5"
                  }
                },
                {
                  title: "Evaluate Volume",
                  instruction: "Compare today's volume to the average volume. High volume often indicates significant news or investor interest.",
                  input: {
                    label: "Is volume above or below average?",
                    placeholder: "Above/Below"
                  }
                }
              ]
            }
          }
        ]
      }
    ]
  },
  2: { // Financial Statement Analysis
    modules: [
      {
        title: "Financial Statement Basics",
        lessons: [
          {
            id: "fs-1",
            title: "Three Core Financial Statements",
            type: "video" as const,
            duration: "18 min",
            completed: false,
            content: {
              summary: "Master the three fundamental financial statements that every investor must understand: Income Statement, Balance Sheet, and Cash Flow Statement.",
              keyPoints: [
                "Income Statement shows profitability over a period",
                "Balance Sheet shows financial position at a point in time",
                "Cash Flow Statement tracks actual cash movements",
                "How the three statements interconnect",
                "Key metrics derived from each statement"
              ]
            }
          },
          {
            id: "fs-2",
            title: "Understanding Annual Reports",
            type: "article" as const,
            duration: "12 min",
            completed: false,
            content: {
              sections: [
                {
                  title: "Structure of Annual Reports",
                  content: "Annual reports contain financial statements, management discussion and analysis (MD&A), notes to financial statements, and auditor reports. Each section provides crucial information for investors.",
                  example: "The MD&A section in Apple's annual report explains management's view on performance, risks, and future outlook."
                },
                {
                  title: "Key Sections to Focus On",
                  content: "Pay special attention to revenue trends, profit margins, debt levels, and cash generation. Look for one-time items that might distort normal operations.",
                  example: "A company might show higher profits due to selling assets, which isn't sustainable for future earnings."
                },
                {
                  title: "Red Flags to Watch For",
                  content: "Be cautious of frequent accounting changes, qualified audit opinions, high accounts receivable growth, or significant one-time adjustments.",
                  example: "If a company's revenue grows 20% but accounts receivable grows 40%, it might indicate collection problems."
                }
              ]
            }
          }
        ]
      }
    ]
  },
  3: { // Portfolio Management
    modules: [
      {
        title: "Portfolio Theory Foundations",
        lessons: [
          {
            id: "port-1",
            title: "Modern Portfolio Theory",
            type: "video" as const,
            duration: "20 min",
            completed: true,
            content: {
              summary: "Learn Harry Markowitz's Nobel Prize-winning theory on optimal portfolio construction through diversification and risk management.",
              keyPoints: [
                "Efficient frontier concept and optimal portfolios",
                "Risk-return trade-offs in portfolio construction",
                "Correlation between assets and diversification benefits",
                "Systematic vs unsystematic risk",
                "Capital Asset Pricing Model (CAPM) basics"
              ]
            }
          },
          {
            id: "port-2",
            title: "Asset Allocation Strategies",
            type: "interactive" as const,
            duration: "15 min",
            completed: false,
            content: {
              exerciseTitle: "Build Your Portfolio",
              description: "Create a diversified portfolio based on your risk tolerance and investment timeline.",
              steps: [
                {
                  title: "Determine Risk Tolerance",
                  instruction: "Rate your comfort with portfolio volatility on a scale of 1-10, where 1 is very conservative and 10 is very aggressive.",
                  input: {
                    label: "Risk tolerance (1-10)",
                    placeholder: "5"
                  }
                },
                {
                  title: "Set Investment Timeline",
                  instruction: "How many years until you need this money? Longer timelines allow for more growth-oriented investments.",
                  input: {
                    label: "Years until needed",
                    placeholder: "20"
                  }
                },
                {
                  title: "Allocate Asset Classes",
                  instruction: "Based on your inputs, allocate percentages to stocks, bonds, and other assets. Total should equal 100%.",
                  input: {
                    label: "Stock allocation (%)",
                    placeholder: "70"
                  }
                }
              ]
            }
          }
        ]
      }
    ]
  }
};