import { CardConfig } from '../utils/dashboard/dedupe';

export const DASHBOARD_CARDS: CardConfig[] = [
  {
    key: "hero-summary",
    title: "Portfolio Summary",
    subtitle: "Your investment overview",
    route: "/dashboard",
    position: 5,
    component: "HeroSummaryCard",
    ctas: [
      { label: "Take Risk Quiz", href: "/risk-quiz", variant: "primary", analytics: "hero_risk_quiz_click" }
    ],
    analyticsTags: ["card_view"],
    lastUpdated: "2024-01-15T00:00:00Z",
    ariaLabel: "Portfolio summary and risk assessment"
  },
  {
    key: "portfolio-overview", 
    title: "Portfolio Overview",
    subtitle: "Asset allocation and performance",
    route: "/portfolio",
    position: 10,
    component: "PortfolioOverviewCard",
    ctas: [
      { label: "View Details", href: "/portfolio", variant: "primary", analytics: "portfolio_details_click" },
      { label: "Rebalance", href: "/portfolio/rebalance", variant: "secondary", analytics: "portfolio_rebalance_click" }
    ],
    badges: [
      { label: "Updated", variant: "secondary", icon: "Clock" }
    ],
    analyticsTags: ["card_view", "open_click"],
    chartConfigs: {
      type: "pie",
      showLegend: true,
      responsive: true
    },
    lastUpdated: "2024-01-15T00:00:00Z",
    ariaLabel: "Portfolio allocation and performance overview"
  },
  {
    key: "ai-portfolio-simulator",
    title: "AI Portfolio Simulator", 
    subtitle: "Model scenarios and visualize risk",
    description: "Test different allocation strategies with AI-powered scenario analysis",
    route: "/portfolio-simulator",
    position: 15,
    component: "AIPortfolioSimulatorCard",
    ctas: [
      { label: "Start Simulation", href: "/portfolio-simulator", variant: "primary", icon: "Play", analytics: "simulator_start_click" },
      { label: "View Scenarios", href: "/portfolio-simulator/scenarios", variant: "outline", analytics: "simulator_scenarios_click" }
    ],
    badges: [
      { label: "New", variant: "default", icon: "Sparkles" },
      { label: "Educational", variant: "outline", icon: "ShieldCheck" }
    ],
    analyticsTags: ["card_view", "open_click", "secondary_click"],
    chartConfigs: {
      type: "sparkline",
      showTooltip: true,
      height: 60
    },
    gridSpan: { default: 1, md: 2, xl: 2 },
    lastUpdated: "2024-01-15T00:00:00Z",
    ariaLabel: "AI-powered portfolio simulation and scenario modeling"
  },
  {
    key: "live-market-feed",
    title: "Live Market Feed",
    subtitle: "Real-time market data",
    route: "/markets",
    position: 20,
    component: "LiveMarketFeed", 
    ctas: [
      { label: "View Markets", href: "/markets", variant: "outline", analytics: "markets_view_click" }
    ],
    badges: [
      { label: "Live", variant: "default", className: "text-emerald-400" }
    ],
    analyticsTags: ["card_view"],
    lastUpdated: "2024-01-15T00:00:00Z",
    ariaLabel: "Live market data and ticker information"
  },
  {
    key: "money-flow-router",
    title: "Money Flow Router",
    subtitle: "Visualize cashflow & get smart suggestions", 
    description: "Connect accounts and get AI-powered money flow recommendations",
    route: "/router",
    position: 21,
    component: "MoneyFlowRouterCard",
    ctas: [
      { label: "Connect Accounts", href: "/router", variant: "primary", icon: "Building2", analytics: "router_connect_click" },
      { label: "View Rules", href: "/router#rules", variant: "outline", analytics: "router_rules_click" }
    ],
    badges: [
      { label: "New", variant: "default", icon: "Sparkles" },
      { label: "Read-Only", variant: "outline", icon: "ShieldCheck" }
    ],
    analyticsTags: ["card_view", "open_click"],
    gridSpan: { default: 1, lg: 1 },
    lastUpdated: "2024-01-15T00:00:00Z",
    ariaLabel: "Money flow visualization and smart financial rules"
  },
  {
    key: "credit-card-helper",
    title: "Credit Card AI Helper",
    subtitle: "Smart payment recommendations",
    description: "AI-powered credit card payment optimization",
    route: "/cards",
    position: 22,
    component: "CreditCardHelperCard",
    ctas: [
      { label: "Connect Cards", href: "/cards/connect", variant: "primary", icon: "CreditCard", analytics: "cards_connect_click" },
      { label: "View History", href: "/cards/history", variant: "outline", analytics: "cards_history_click" }
    ],
    badges: [
      { label: "AI Powered", variant: "default", icon: "Brain" }
    ],
    analyticsTags: ["card_view", "open_click"],
    gridSpan: { default: 1, lg: 1 },
    lastUpdated: "2024-01-15T00:00:00Z",
    ariaLabel: "AI-powered credit card payment recommendations"
  },
  {
    key: "recent-activity",
    title: "Recent Activity",
    subtitle: "Your latest actions and insights",
    route: "/activity", 
    position: 25,
    component: "RecentActivityCard",
    ctas: [
      { label: "View All", href: "/activity", variant: "outline", analytics: "activity_view_all_click" }
    ],
    analyticsTags: ["card_view"],
    lastUpdated: "2024-01-15T00:00:00Z",
    ariaLabel: "Recent portfolio activities and AI insights"
  },
  {
    key: "ai-insights",
    title: "AI Insights",
    subtitle: "Personalized recommendations",
    description: "AI-driven suggestions for portfolio optimization",
    route: "/insights",
    position: 30,
    component: "AIInsightsCard",
    ctas: [
      { label: "View Recommendation", href: "/insights", variant: "primary", analytics: "insights_view_click" },
      { label: "Request Analysis", href: "/insights/analyze", variant: "outline", icon: "Brain", analytics: "insights_analyze_click" }
    ],
    badges: [
      { label: "AI Powered", variant: "default", icon: "Brain" }
    ],
    analyticsTags: ["card_view", "open_click"],
    gridSpan: { default: 1, lg: 1 },
    lastUpdated: "2024-01-15T00:00:00Z",
    ariaLabel: "AI-powered investment insights and recommendations"
  },
  {
    key: "risk-analysis",
    title: "Risk Analysis",
    subtitle: "Portfolio risk assessment",
    description: "AI-powered risk analysis with diversification insights",
    route: "/risk",
    position: 32,
    component: "RiskAnalysisCard",
    ctas: [
      { label: "Optimize Risk", href: "/portfolio/optimize", variant: "primary", analytics: "risk_optimize_click" },
      { label: "Learn Risk Management", href: "/learn/risk", variant: "outline", analytics: "risk_learn_click" }
    ],
    badges: [
      { label: "Live Analysis", variant: "default", icon: "Activity" }
    ],
    analyticsTags: ["card_view", "open_click"],
    gridSpan: { default: 1, lg: 1 },
    lastUpdated: "2024-01-15T00:00:00Z",
    ariaLabel: "Real-time portfolio risk analysis and optimization"
  },
  {
    key: "glossary",
    title: "Investment Glossary",
    subtitle: "Learn key investment terms", 
    description: "Searchable glossary with tooltips and examples",
    route: "/glossary",
    position: 33,
    component: "GlossaryCard",
    ctas: [
      { label: "Search Terms", href: "/glossary", variant: "primary", icon: "Search", analytics: "glossary_search_click" },
      { label: "Learning Path", href: "/learn", variant: "outline", analytics: "glossary_learn_click" }
    ],
    badges: [
      { label: "Educational", variant: "outline", icon: "BookOpen" }
    ],
    analyticsTags: ["card_view", "open_click"],
    gridSpan: { default: 1, lg: 1 },
    lastUpdated: "2024-01-15T00:00:00Z",
    ariaLabel: "Investment terminology glossary and learning resource"
  },
  {
    key: "market-simulator",
    title: "Paper Trading Simulator",
    subtitle: "Practice with virtual money",
    description: "Risk-free trading simulation with real market data",
    route: "/simulator",
    position: 34,
    component: "MarketSimulatorCard", 
    ctas: [
      { label: "Start Trading", href: "/simulator", variant: "primary", icon: "Activity", analytics: "simulator_trade_click" },
      { label: "View Leaderboard", href: "/simulator/leaderboard", variant: "outline", analytics: "simulator_leaderboard_click" }
    ],
    badges: [
      { label: "Risk-Free", variant: "secondary", icon: "Shield" },
      { label: "Real Data", variant: "outline", icon: "TrendingUp" }
    ],
    analyticsTags: ["card_view", "open_click"],
    gridSpan: { default: 1, lg: 1 },
    lastUpdated: "2024-01-15T00:00:00Z",
    ariaLabel: "Paper trading simulator for risk-free investment practice"
  },
  {
    key: "learning-paths",
    title: "Learning Paths", 
    subtitle: "Structured investment education",
    description: "Master investing with our comprehensive course library",
    route: "/learn",
    position: 35,
    component: "LearningPathsCard",
    ctas: [
      { label: "Continue Learning", href: "/learn", variant: "primary", icon: "Play", analytics: "learning_continue_click" },
      { label: "Browse Courses", href: "/learn/browse", variant: "outline", analytics: "learning_browse_click" }
    ],
    badges: [
      { label: "Level 7", variant: "secondary", icon: "Trophy" }
    ],
    analyticsTags: ["card_view", "open_click"],
    chartConfigs: {
      type: "progress",
      animated: true,
      showPercentage: true
    },
    gridSpan: { default: 1, lg: 1 },
    lastUpdated: "2024-01-15T00:00:00Z",
    ariaLabel: "Investment education learning paths and progress"
  },
  {
    key: "sec-filings",
    title: "SEC Filings Explorer",
    subtitle: "Financial document analysis", 
    description: "AI-powered SEC filing search and analysis",
    route: "/filings",
    position: 40,
    component: "SECFilingsExplorer",
    ctas: [
      { label: "Search Filings", href: "/filings", variant: "primary", icon: "Search", analytics: "filings_search_click" },
      { label: "Watchlist", href: "/filings/watchlist", variant: "outline", analytics: "filings_watchlist_click" }
    ],
    badges: [
      { label: "Live Data", variant: "outline", icon: "Activity" }
    ],
    analyticsTags: ["card_view", "open_click"],
    lastUpdated: "2024-01-15T00:00:00Z",
    ariaLabel: "SEC filings search and AI-powered document analysis"
  },
  {
    key: "automated-investing",
    title: "Robo-Advisor",
    subtitle: "Automated portfolio management",
    description: "AI-powered investment automation with rebalancing",
    route: "/robo-advisor",
    position: 36,
    component: "AutomatedInvestingCard",
    ctas: [
      { label: "Setup Portfolio", href: "/robo-advisor/setup", variant: "primary", icon: "Bot", analytics: "robo_setup_click" },
      { label: "View Performance", href: "/robo-advisor/performance", variant: "outline", analytics: "robo_performance_click" }
    ],
    badges: [
      { label: "Automated", variant: "default", icon: "Zap" }
    ],
    analyticsTags: ["card_view", "open_click"],
    gridSpan: { default: 1, lg: 1 },
    lastUpdated: "2024-01-15T00:00:00Z",
    ariaLabel: "Automated investing and portfolio management"
  },
  {
    key: "portfolio-optimization",
    title: "Portfolio Optimization",
    subtitle: "AI-powered allocation analysis",
    description: "Optimize your portfolio with historical data and AI insights",
    route: "/portfolio/optimize",
    position: 37,
    component: "PortfolioOptimizationCard",
    ctas: [
      { label: "Run Analysis", href: "/portfolio/optimize", variant: "primary", icon: "BarChart3", analytics: "optimize_analysis_click" },
      { label: "View History", href: "/portfolio/optimize/history", variant: "outline", analytics: "optimize_history_click" }
    ],
    badges: [
      { label: "AI Powered", variant: "default", icon: "Brain" }
    ],
    analyticsTags: ["card_view", "open_click"],
    gridSpan: { default: 1, lg: 1 },
    lastUpdated: "2024-01-15T00:00:00Z",
    ariaLabel: "Portfolio optimization and performance analysis"
  },
  {
    key: "personalized-learning",
    title: "Smart Learning Paths",
    subtitle: "Personalized education",
    description: "AI-curated learning based on your knowledge gaps",
    route: "/learn/personalized",
    position: 38,
    component: "PersonalizedLearningPathsCard",
    ctas: [
      { label: "Continue Learning", href: "/learn/personalized", variant: "primary", icon: "Brain", analytics: "personal_learn_click" },
      { label: "Assessment", href: "/learn/assessment", variant: "outline", analytics: "personal_assess_click" }
    ],
    badges: [
      { label: "Personalized", variant: "secondary", icon: "Target" }
    ],
    analyticsTags: ["card_view", "open_click"],
    gridSpan: { default: 1, lg: 1 },
    lastUpdated: "2024-01-15T00:00:00Z",
    ariaLabel: "Personalized learning paths and knowledge assessment"
  },
  {
    key: "trend-prediction",
    title: "Trend Prediction",
    subtitle: "AI market forecasting",
    description: "Advanced ML models for market and stock predictions",
    route: "/predictions",
    position: 39,
    component: "TrendPredictionCard",
    ctas: [
      { label: "View Predictions", href: "/predictions", variant: "primary", icon: "TrendingUp", analytics: "predictions_view_click" },
      { label: "Analyze Stock", href: "/predictions/stock", variant: "outline", analytics: "predictions_stock_click" }
    ],
    badges: [
      { label: "Beta", variant: "outline", icon: "Zap" }
    ],
    analyticsTags: ["card_view", "open_click"],
    gridSpan: { default: 1, lg: 1 },
    lastUpdated: "2024-01-15T00:00:00Z",
    ariaLabel: "AI-powered market trend predictions and analysis"
  },
  {
    key: "chat-with-elin",
    title: "Chat with ELIN",
    subtitle: "Your AI investment mentor",
    description: "Get personalized investment guidance and answers",
    route: "/chat",
    position: 45,
    component: "ChatCard",
    ctas: [
      { label: "Start Chat", href: "/chat", variant: "primary", icon: "MessageSquare", analytics: "chat_start_click" },
      { label: "View History", href: "/chat/history", variant: "outline", analytics: "chat_history_click" }
    ],
    badges: [
      { label: "24/7 Available", variant: "secondary", icon: "Clock" }
    ],
    analyticsTags: ["card_view", "open_click"],
    lastUpdated: "2024-01-15T00:00:00Z",
    ariaLabel: "Chat with ELIN AI investment mentor"
  }
];