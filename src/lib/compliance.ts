/**
 * Compliance utilities for the AI Investment Mentor
 * Ensures all AI responses follow fiduciary compliance rules
 */

export const COMPLIANCE_DISCLAIMER = "**Educational only — not financial advice.** This information is for educational purposes only and should not be considered personalized investment advice. Please consult with a licensed financial advisor for investment recommendations tailored to your specific situation.";

export const ADVICE_GUARD_PATTERNS = [
  /buy\s+\d+\s+shares/i,
  /sell\s+your/i,
  /invest\s+\$\d+/i,
  /put\s+your\s+money/i,
  /guaranteed\s+returns?/i,
  /will\s+make\s+you\s+money/i,
  /best\s+investment/i,
  /should\s+invest\s+in/i,
  /recommend\s+buying/i,
  /recommend\s+selling/i,
];

export const PROJECTION_PATTERNS = [
  /will\s+return\s+\d+%/i,
  /expect\s+\d+%\s+gains?/i,
  /projected?\s+returns?/i,
  /future\s+performance/i,
  /will\s+grow\s+to/i,
  /estimated\s+value/i,
];

export function containsAdviceLanguage(text: string): boolean {
  return ADVICE_GUARD_PATTERNS.some(pattern => pattern.test(text));
}

export function containsProjections(text: string): boolean {
  return PROJECTION_PATTERNS.some(pattern => pattern.test(text));
}

export function generateComplianceFallback(userQuery: string): string {
  return `I understand you're looking for specific investment guidance, but I can't provide personalized investment advice. 

Instead, let me share some general educational considerations:

**For investment decisions like this, consider:**
- Your risk tolerance and time horizon
- Diversification across asset classes
- Fee structures and expense ratios
- Your overall investment goals

**I'd recommend:**
- Speaking with a licensed financial advisor for personalized recommendations
- Researching the investment fundamentals
- Understanding the risks involved

Is there a specific educational topic about investing I can help explain instead?`;
}

export function addComplianceFooter(content: string): string {
  const timestamp = new Date().toISOString();
  return `${content}

---
${COMPLIANCE_DISCLAIMER}
*Generated on ${new Date(timestamp).toLocaleDateString()} at ${new Date(timestamp).toLocaleTimeString()}*`;
}

export function validateAIResponse(response: string): {
  isCompliant: boolean;
  issues: string[];
  modifiedResponse?: string;
} {
  const issues: string[] = [];
  
  if (containsAdviceLanguage(response)) {
    issues.push("Contains language that could be interpreted as investment advice");
  }
  
  if (containsProjections(response)) {
    issues.push("Contains forward-looking performance projections");
  }
  
  const isCompliant = issues.length === 0;
  
  if (!isCompliant) {
    return {
      isCompliant: false,
      issues,
      modifiedResponse: generateComplianceFallback("User query contained request for specific investment advice")
    };
  }
  
  return {
    isCompliant: true,
    issues: [],
    modifiedResponse: addComplianceFooter(response)
  };
}