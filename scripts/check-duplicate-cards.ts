#!/usr/bin/env node

import { readFileSync } from 'fs';
import { glob } from 'glob';
import path from 'path';

interface CardReference {
  route?: string;
  key?: string;
  title?: string;
  file: string;
  line: number;
}

/**
 * Build-time check to prevent duplicate dashboard cards
 * Scans for hardcoded card instances and config duplicates
 */
async function checkDuplicateCards() {
  console.log('🔍 Checking for duplicate dashboard cards...');
  
  let hasErrors = false;
  const cardReferences: CardReference[] = [];
  
  // Check dashboard layout config
  try {
    const configPath = path.join(process.cwd(), 'src/config/dashboard.layout.ts');
    const configContent = readFileSync(configPath, 'utf-8');
    
    // Extract DASHBOARD_CARDS array and check for duplicates
    const duplicates = checkConfigDuplicates(configContent, configPath);
    if (duplicates.length > 0) {
      hasErrors = true;
      console.error('❌ Duplicate cards found in dashboard config:');
      duplicates.forEach(({ type, value, lines }) => {
        console.error(`  - Duplicate ${type}: "${value}" on lines: ${lines.join(', ')}`);
      });
    }
  } catch (error) {
    console.error('❌ Error reading dashboard config:', error);
    hasErrors = true;
  }
  
  // Scan component files for hardcoded card instances
  const componentFiles = await glob('src/pages/Dashboard.tsx');
  
  for (const file of componentFiles) {
    try {
      const content = readFileSync(file, 'utf-8');
      const hardcodedCards = findHardcodedCards(content, file);
      cardReferences.push(...hardcodedCards);
    } catch (error) {
      console.error(`❌ Error reading ${file}:`, error);
      hasErrors = true;
    }
  }
  
  // Check for hardcoded duplicates
  if (cardReferences.length > 0) {
    console.warn('⚠️  Found hardcoded card references (should use config):');
    cardReferences.forEach(ref => {
      console.warn(`  - ${ref.route || ref.key || ref.title} in ${ref.file}:${ref.line}`);
    });
    console.warn('  Consider moving these to dashboard.layout.ts config');
  }
  
  if (hasErrors) {
    console.error('\n❌ Build failed due to duplicate dashboard cards');
    process.exit(1);
  } else if (cardReferences.length === 0) {
    console.log('✅ No duplicate cards found');
  } else {
    console.log('✅ No critical duplicates found (warnings above)');
  }
}

function checkConfigDuplicates(content: string, file: string) {
  const duplicates: Array<{ type: string; value: string; lines: number[] }> = [];
  const lines = content.split('\n');
  
  // Track occurrences of keys, routes, and titles
  const keyMap = new Map<string, number[]>();
  const routeMap = new Map<string, number[]>();
  const titleMap = new Map<string, number[]>();
  
  lines.forEach((line, index) => {
    const lineNum = index + 1;
    
    // Extract key
    const keyMatch = line.match(/key:\s*["']([^"']+)["']/);
    if (keyMatch) {
      const key = keyMatch[1];
      if (!keyMap.has(key)) keyMap.set(key, []);
      keyMap.get(key)!.push(lineNum);
    }
    
    // Extract route  
    const routeMatch = line.match(/route:\s*["']([^"']+)["']/);
    if (routeMatch) {
      const route = routeMatch[1];
      if (!routeMap.has(route)) routeMap.set(route, []);
      routeMap.get(route)!.push(lineNum);
    }
    
    // Extract title
    const titleMatch = line.match(/title:\s*["']([^"']+)["']/);
    if (titleMatch) {
      const title = titleMatch[1];
      if (!titleMap.has(title)) titleMap.set(title, []);
      titleMap.get(title)!.push(lineNum);
    }
  });
  
  // Find duplicates
  keyMap.forEach((lines, key) => {
    if (lines.length > 1) {
      duplicates.push({ type: 'key', value: key, lines });
    }
  });
  
  routeMap.forEach((lines, route) => {
    if (lines.length > 1) {
      duplicates.push({ type: 'route', value: route, lines });
    }
  });
  
  return duplicates;
}

function findHardcodedCards(content: string, file: string): CardReference[] {
  const references: CardReference[] = [];
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    const lineNum = index + 1;
    
    // Look for navigation calls to known card routes
    const knownRoutes = [
      '/portfolio-simulator', '/portfolio', '/chat', '/learn', 
      '/filings', '/insights', '/markets', '/activity'
    ];
    
    knownRoutes.forEach(route => {
      if (line.includes(`'${route}'`) || line.includes(`"${route}"`)) {
        references.push({
          route,
          file: path.relative(process.cwd(), file),
          line: lineNum
        });
      }
    });
    
    // Look for hardcoded card titles
    const cardTitlePatterns = [
      /AI Portfolio Simulator/,
      /Portfolio Overview/,
      /Learning Paths/,
      /SEC Filings/,
      /AI Insights/,
      /Chat with ELIN/,
      /Market Feed/
    ];
    
    cardTitlePatterns.forEach(pattern => {
      if (pattern.test(line)) {
        const match = line.match(pattern);
        if (match) {
          references.push({
            title: match[0],
            file: path.relative(process.cwd(), file),
            line: lineNum
          });
        }
      }
    });
  });
  
  return references;
}

// Run the check
checkDuplicateCards().catch(console.error);