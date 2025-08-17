export interface CTAConfig {
  label: string;
  href: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  icon?: string;
  analytics?: string;
}

export interface BadgeConfig {
  label: string;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  icon?: string;
  className?: string;
}

export interface CardConfig {
  key: string;
  title: string;
  subtitle?: string;
  description?: string;
  route?: string;
  position: number;
  component: string;
  props?: Record<string, any>;
  ctas: CTAConfig[];
  badges?: BadgeConfig[];
  analyticsTags?: Array<'card_view' | 'open_click' | 'secondary_click' | 'error' | 'empty_state'>;
  gridSpan?: {
    default?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  lastUpdated: string; // ISO date string for deduplication priority
  ariaLabel?: string;
  chartConfigs?: Record<string, any>;
}

/**
 * Deduplicates dashboard cards based on route, key, or title similarity
 * Keeps the most complete and newest version when duplicates are found
 */
export function dedupeCards(cards: CardConfig[]): CardConfig[] {
  // Normalize keys for comparison
  const normalizeKey = (card: CardConfig) => ({
    route: card.route?.toLowerCase().trim(),
    key: card.key.toLowerCase().trim(),
    title: card.title.toLowerCase().trim(),
    primaryCtaHref: card.ctas[0]?.href?.toLowerCase().trim()
  });

  // Build map by unique identifier (route || key || title)
  const cardMap = new Map<string, CardConfig>();
  
  for (const card of cards) {
    const normalized = normalizeKey(card);
    const uniqueId = normalized.route || normalized.key || normalized.title;
    
    if (cardMap.has(uniqueId)) {
      const existing = cardMap.get(uniqueId)!;
      const merged = mergeCards(existing, card);
      cardMap.set(uniqueId, merged);
    } else {
      cardMap.set(uniqueId, card);
    }
  }

  // Return unique list sorted by position weight
  return Array.from(cardMap.values()).sort((a, b) => a.position - b.position);
}

/**
 * Merges two duplicate cards, keeping the newest with preference for:
 * newest -> with chart configs -> with badges -> with analytics
 */
function mergeCards(existing: CardConfig, duplicate: CardConfig): CardConfig {
  // Determine which card to keep as base
  const base = selectPreferredCard(existing, duplicate);
  const other = base === existing ? duplicate : existing;

  // Merge properties
  return {
    ...base,
    // Merge CTAs (keep base, add missing from other)
    ctas: mergeCTAs(base.ctas, other.ctas),
    
    // Merge badges (union of unique badges)
    badges: mergeBadges(base.badges || [], other.badges || []),
    
    // Merge analytics tags (union)
    analyticsTags: mergeAnalyticsTags(base.analyticsTags || [], other.analyticsTags || []),
    
    // Keep chart configs from both if available
    chartConfigs: { ...other.chartConfigs, ...base.chartConfigs },
    
    // Merge props (base takes precedence)
    props: { ...other.props, ...base.props },
    
    // Use the most descriptive subtitle/description
    subtitle: base.subtitle || other.subtitle,
    description: base.description || other.description,
    ariaLabel: base.ariaLabel || other.ariaLabel
  };
}

function selectPreferredCard(card1: CardConfig, card2: CardConfig): CardConfig {
  // 1. Prefer newest
  const date1 = new Date(card1.lastUpdated);
  const date2 = new Date(card2.lastUpdated);
  if (date1.getTime() !== date2.getTime()) {
    return date1 > date2 ? card1 : card2;
  }

  // 2. Prefer card with chart configs
  if ((card1.chartConfigs && Object.keys(card1.chartConfigs).length > 0) && 
      (!card2.chartConfigs || Object.keys(card2.chartConfigs).length === 0)) {
    return card1;
  }
  if ((card2.chartConfigs && Object.keys(card2.chartConfigs).length > 0) && 
      (!card1.chartConfigs || Object.keys(card1.chartConfigs).length === 0)) {
    return card2;
  }

  // 3. Prefer card with more badges
  if ((card1.badges?.length || 0) !== (card2.badges?.length || 0)) {
    return (card1.badges?.length || 0) > (card2.badges?.length || 0) ? card1 : card2;
  }

  // 4. Prefer card with more analytics tags
  if ((card1.analyticsTags?.length || 0) !== (card2.analyticsTags?.length || 0)) {
    return (card1.analyticsTags?.length || 0) > (card2.analyticsTags?.length || 0) ? card1 : card2;
  }

  // 5. Default to first card
  return card1;
}

function mergeCTAs(baseCTAs: CTAConfig[], otherCTAs: CTAConfig[]): CTAConfig[] {
  const ctaMap = new Map<string, CTAConfig>();
  
  // Add base CTAs first
  baseCTAs.forEach(cta => ctaMap.set(cta.href, cta));
  
  // Add missing CTAs from other
  otherCTAs.forEach(cta => {
    if (!ctaMap.has(cta.href)) {
      ctaMap.set(cta.href, cta);
    }
  });
  
  return Array.from(ctaMap.values());
}

function mergeBadges(baseBadges: BadgeConfig[], otherBadges: BadgeConfig[]): BadgeConfig[] {
  const badgeMap = new Map<string, BadgeConfig>();
  
  baseBadges.forEach(badge => badgeMap.set(badge.label.toLowerCase(), badge));
  otherBadges.forEach(badge => {
    if (!badgeMap.has(badge.label.toLowerCase())) {
      badgeMap.set(badge.label.toLowerCase(), badge);
    }
  });
  
  return Array.from(badgeMap.values());
}

function mergeAnalyticsTags(
  baseTags: Array<'card_view' | 'open_click' | 'secondary_click' | 'error' | 'empty_state'>,
  otherTags: Array<'card_view' | 'open_click' | 'secondary_click' | 'error' | 'empty_state'>
): Array<'card_view' | 'open_click' | 'secondary_click' | 'error' | 'empty_state'> {
  return [...new Set([...baseTags, ...otherTags])];
}
