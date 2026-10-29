/**
 * City normalization and comparison utilities.
 * Ensures consistent matching across cases, whitespace, and regional variants.
 */

export const CITY_OPTIONS = [
  'Bangalore',
  'Mumbai',
  'Delhi NCR',
  'Hyderabad',
  'Pune',
  'Chennai',
  'Kolkata',
  'Ahmedabad',
  'Indore',
  'Goa',
  'Chandigarh',
  'Jaipur',
  'Kochi'
];

/**
 * Normalizes a city string to a canonical lowercase token.
 * E.g. " Bangalore, Indiranagar " -> "bangalore"
 *      "Bengaluru" -> "bangalore"
 *      "New Delhi" -> "delhi ncr"
 */
export const normalizeCity = (city) => {
  if (!city || typeof city !== 'string') return '';
  const clean = city.trim().toLowerCase();

  if (clean.includes('bangalore') || clean.includes('bengaluru')) return 'bangalore';
  if (clean.includes('mumbai') || clean.includes('bombay')) return 'mumbai';
  if (clean.includes('delhi') || clean.includes('ncr') || clean.includes('gurgaon') || clean.includes('gurugram') || clean.includes('noida')) return 'delhi ncr';
  if (clean.includes('hyderabad')) return 'hyderabad';
  if (clean.includes('pune')) return 'pune';
  if (clean.includes('chennai') || clean.includes('madras')) return 'chennai';
  if (clean.includes('kolkata') || clean.includes('calcutta')) return 'kolkata';
  if (clean.includes('ahmedabad')) return 'ahmedabad';
  if (clean.includes('indore')) return 'indore';
  if (clean.includes('goa')) return 'goa';
  if (clean.includes('chandigarh')) return 'chandigarh';
  if (clean.includes('jaipur')) return 'jaipur';
  if (clean.includes('kochi') || clean.includes('cochin')) return 'kochi';

  // Fallback: strip leading/trailing whitespace, take primary segment if comma-separated
  const primary = clean.split(',')[0].trim();
  return primary || clean;
};

/**
 * Checks if two city names refer to the same city.
 */
export const isSameCity = (cityA, cityB) => {
  const normA = normalizeCity(cityA);
  const normB = normalizeCity(cityB);
  if (!normA || !normB) return false;
  return normA === normB;
};
