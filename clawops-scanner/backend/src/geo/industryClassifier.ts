/**
 * ClawOps Scanner - Industry Classifier for GEO Queries
 */

export interface IndustryQuerySet {
  industry: string;
  queries: string[];
}

const INDUSTRY_QUERY_MAP: Record<string, string[]> = {
  restaurant: [
    'best {type} restaurant in {city}',
    'top rated {type} near me',
    'where to eat {type} in {city}',
    '{type} restaurant recommendations {city}',
    'best lunch spots in {city}',
  ],
  healthcare: [
    'best {type} in {city}',
    'top rated {type} near me',
    '{type} recommendations {city}',
    'affordable {type} in {city}',
    'emergency {type} near me',
  ],
  legal: [
    'best {type} in {city}',
    'top {type} near me',
    '{type} recommendations {city}',
    'affordable {type} in {city}',
    'experienced {type} in {city}',
  ],
  home_services: [
    'best {type} in {city}',
    'reliable {type} near me',
    '{type} recommendations {city}',
    'affordable {type} in {city}',
    'emergency {type} near me',
  ],
  automotive: [
    'best {type} in {city}',
    'top rated {type} near me',
    '{type} recommendations {city}',
    'trusted {type} in {city}',
    'affordable {type} near me',
  ],
  retail: [
    'best {type} in {city}',
    '{type} near me',
    'where to buy {type} in {city}',
    'top {type} stores {city}',
    '{type} shop recommendations',
  ],
  general_business: [
    'best {type} in {city}',
    'top rated {type} near me',
    '{type} recommendations {city}',
    'local {type} in {city}',
    'trusted {type} near me',
  ],
};

export function getIndustryQueries(category: string, businessType: string, city: string): string[] {
  const templates = INDUSTRY_QUERY_MAP[category] || INDUSTRY_QUERY_MAP['general_business'];
  return templates.map(t =>
    t.replace(/\{type\}/g, businessType).replace(/\{city\}/g, city)
  );
}

export function classifyIndustry(types: string[], businessName: string): string {
  const typesLower = types.map(t => t.toLowerCase());
  const nameLower = businessName.toLowerCase();

  if (typesLower.some(t => ['restaurant', 'food', 'cafe', 'bakery', 'bar'].includes(t))) return 'restaurant';
  if (typesLower.some(t => ['doctor', 'dentist', 'hospital', 'health', 'pharmacy'].includes(t))) return 'healthcare';
  if (typesLower.some(t => ['lawyer', 'legal'].includes(t))) return 'legal';
  if (typesLower.some(t => ['plumber', 'electrician', 'contractor', 'roofing_contractor'].includes(t))) return 'home_services';
  if (typesLower.some(t => ['car_dealer', 'car_repair', 'car_wash'].includes(t))) return 'automotive';
  if (typesLower.some(t => ['store', 'shopping_mall', 'clothing_store'].includes(t))) return 'retail';

  if (nameLower.includes('restaurant') || nameLower.includes('pizza') || nameLower.includes('grill')) return 'restaurant';
  if (nameLower.includes('doctor') || nameLower.includes('dental') || nameLower.includes('clinic')) return 'healthcare';
  if (nameLower.includes('law') || nameLower.includes('attorney')) return 'legal';
  if (nameLower.includes('plumb') || nameLower.includes('electric') || nameLower.includes('roof')) return 'home_services';

  return 'general_business';
}
