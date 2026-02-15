// Input validation utilities for financial data and user inputs

// Ticker symbol validation
export const validateTicker = (ticker: string): { isValid: boolean; error?: string } => {
  if (!ticker) {
    return { isValid: false, error: 'Ticker symbol is required' };
  }
  
  const cleanTicker = ticker.trim().toUpperCase();
  
  // Ticker should be 1-5 uppercase letters
  if (!/^[A-Z]{1,5}$/.test(cleanTicker)) {
    return { isValid: false, error: 'Ticker must be 1-5 uppercase letters (e.g., AAPL, SPY)' };
  }
  
  return { isValid: true };
};

// Share quantity validation
export const validateShares = (shares: string): { isValid: boolean; error?: string; value?: number } => {
  if (!shares) {
    return { isValid: false, error: 'Number of shares is required' };
  }
  
  const numShares = parseFloat(shares);
  
  if (isNaN(numShares)) {
    return { isValid: false, error: 'Please enter a valid number' };
  }
  
  if (numShares <= 0) {
    return { isValid: false, error: 'Number of shares must be greater than 0' };
  }
  
  if (numShares > 1000000) {
    return { isValid: false, error: 'Number of shares cannot exceed 1,000,000' };
  }
  
  // Check for reasonable decimal precision (max 6 decimal places)
  if ((shares.split('.')[1]?.length || 0) > 6) {
    return { isValid: false, error: 'Maximum 6 decimal places allowed' };
  }
  
  return { isValid: true, value: numShares };
};

// Cost basis validation
export const validateCostBasis = (costBasis: string): { isValid: boolean; error?: string; value?: number } => {
  if (!costBasis) {
    return { isValid: false, error: 'Cost basis is required' };
  }
  
  const numCostBasis = parseFloat(costBasis);
  
  if (isNaN(numCostBasis)) {
    return { isValid: false, error: 'Please enter a valid number' };
  }
  
  if (numCostBasis <= 0) {
    return { isValid: false, error: 'Cost basis must be greater than $0' };
  }
  
  if (numCostBasis > 100000) {
    return { isValid: false, error: 'Cost basis cannot exceed $100,000 per share' };
  }
  
  // Check for reasonable decimal precision (max 2 decimal places for currency)
  if ((costBasis.split('.')[1]?.length || 0) > 2) {
    return { isValid: false, error: 'Maximum 2 decimal places allowed for currency' };
  }
  
  return { isValid: true, value: numCostBasis };
};

// Purchase date validation
export const validatePurchaseDate = (date: string): { isValid: boolean; error?: string } => {
  if (!date) {
    return { isValid: false, error: 'Purchase date is required' };
  }
  
  const purchaseDate = new Date(date);
  const today = new Date();
  
  if (isNaN(purchaseDate.getTime())) {
    return { isValid: false, error: 'Please enter a valid date' };
  }
  
  if (purchaseDate > today) {
    return { isValid: false, error: 'Purchase date cannot be in the future' };
  }
  
  // Don't allow dates before 1900 (reasonable limit)
  const minDate = new Date('1900-01-01');
  if (purchaseDate < minDate) {
    return { isValid: false, error: 'Purchase date must be after 1900' };
  }
  
  return { isValid: true };
};

// Password strength validation
export const validatePassword = (password: string): { 
  isValid: boolean; 
  error?: string; 
  strength: 'weak' | 'medium' | 'strong' 
} => {
  if (!password) {
    return { isValid: false, error: 'Password is required', strength: 'weak' };
  }
  
  if (password.length < 8) {
    return { 
      isValid: false, 
      error: 'Password must be at least 8 characters long', 
      strength: 'weak' 
    };
  }
  
  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  let score = 0;
  
  // Check for different character types
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  
  // Length bonus
  if (password.length >= 12) score++;
  
  if (score >= 4) {
    strength = 'strong';
  } else if (score >= 2) {
    strength = 'medium';
  }
  
  if (strength === 'weak') {
    return {
      isValid: false,
      error: 'Password should include uppercase, lowercase, numbers, and special characters',
      strength
    };
  }
  
  return { isValid: true, strength };
};

// Email validation
export const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  if (!email) {
    return { isValid: false, error: 'Email is required' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }
  
  return { isValid: true };
};

// Chat input sanitization
export const sanitizeChatInput = (input: string): string => {
  if (!input) return '';
  
  const cleaned = input
    // Strip dangerous protocols first
    .replace(/data:/gi, '')
    .replace(/vbscript:/gi, '')
    // Remove full <script ...>...</script> blocks (including attributes)
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    // Remove any remaining HTML tags
    .replace(/<[^>]+>/g, '')
    // Remove javascript: protocol
    .replace(/javascript:/gi, '')
    // Remove inline event handlers
    .replace(/on\w+\s*=/gi, '')
    .trim();
  
  // Limit length to prevent abuse
  return cleaned.length > 2000 ? cleaned.substring(0, 2000) + '...' : cleaned;
};

// Name validation
export const validateName = (name: string, fieldName: string): { isValid: boolean; error?: string } => {
  if (!name || !name.trim()) {
    return { isValid: false, error: `${fieldName} is required` };
  }
  
  const trimmedName = name.trim();
  
  if (trimmedName.length < 1) {
    return { isValid: false, error: `${fieldName} cannot be empty` };
  }
  
  if (trimmedName.length > 50) {
    return { isValid: false, error: `${fieldName} cannot exceed 50 characters` };
  }
  
  // Allow letters, spaces, hyphens, and apostrophes
  if (!/^[a-zA-Z\s\-']+$/.test(trimmedName)) {
    return { isValid: false, error: `${fieldName} can only contain letters, spaces, hyphens, and apostrophes` };
  }
  
  return { isValid: true };
};