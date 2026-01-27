import { COLOR_FAMILIES, PRIMARY_COLORS, ColorToken } from '../constants/color-tokens';

/**
 * Color sorting utility based on token-based color order
 * 
 * Sorting order:
 * 1. Primary sort: Hue (Red → Orange → Brown → Yellow → Green → Teal → Blue → Purple → Pink → Gray → Black → White → Print)
 * 2. Secondary sort (within same hue): Lightness (Extra Dark → Dark → Mid → Light → Extra Light)
 * 3. Tertiary sort (within same hue & lightness): Saturation (Vivid → Soft → Muted)
 * 
 * Special cases:
 * - Gray / Black / White / Print follow the hue order but ignore lightness & saturation
 */

// Lightness order (darkest to lightest)
const LIGHTNESS_ORDER = ['Extra Dark', 'Dark', 'Mid', 'Light', 'Extra Light'];

// Saturation order (most to least saturated)
const SATURATION_ORDER = ['Vivid', 'Soft', 'Muted'];

// Special colors that ignore lightness & saturation
const SPECIAL_COLORS = ['Gray', 'Black', 'White', 'Print'];

/**
 * Build a flat list of all color tokens in the correct sorting order
 */
function buildColorTokenOrder(): ColorToken[] {
  const orderedTokens: ColorToken[] = [];
  
  // Process each primary color in hue order
  for (const primaryColor of PRIMARY_COLORS) {
    const family = COLOR_FAMILIES.find(f => 
      f.name.trim().toLowerCase() === primaryColor.value.toLowerCase()
    );
    
    if (!family) {
      // For special colors (Black, White, Print) that don't have families
      if (SPECIAL_COLORS.includes(primaryColor.value)) {
        orderedTokens.push(primaryColor);
      }
      continue;
    }
    
    // Process each lightness level in order
    for (const lightness of LIGHTNESS_ORDER) {
      const level = family.levels.find(l => l.name.includes(lightness));
      if (!level) continue;
      
      // For special colors, only add one token per level
      if (SPECIAL_COLORS.includes(primaryColor.value)) {
        const firstVariation = level.variations[0];
        if (firstVariation) {
          orderedTokens.push(firstVariation);
        }
      } else {
        // For regular colors, process each saturation in order
        for (const saturation of SATURATION_ORDER) {
          const variation = level.variations.find(v => 
            v.label.includes(saturation)
          );
          if (variation) {
            orderedTokens.push(variation);
          }
        }
      }
    }
  }
  
  return orderedTokens;
}

// Cache the ordered color tokens
let cachedColorTokenOrder: ColorToken[] | null = null;

function getColorTokenOrder(): ColorToken[] {
  if (!cachedColorTokenOrder) {
    cachedColorTokenOrder = buildColorTokenOrder();
  }
  return cachedColorTokenOrder;
}

/**
 * Normalize a color string for matching
 */
function normalizeColorString(color: string): string {
  return (color || '').trim().replace(/\s+/g, ' ');
}

/**
 * Find the best matching color token for a given color string
 */
function findMatchingColorToken(color: string): ColorToken | null {
  const normalized = normalizeColorString(color);
  const tokens = getColorTokenOrder();
  
  // Try exact match first
  let match = tokens.find(t => 
    normalizeColorString(t.value) === normalized ||
    normalizeColorString(t.label) === normalized
  );
  
  if (match) return match;
  
  // Try case-insensitive match
  const lowerNormalized = normalized.toLowerCase();
  match = tokens.find(t => 
    normalizeColorString(t.value).toLowerCase() === lowerNormalized ||
    normalizeColorString(t.label).toLowerCase() === lowerNormalized
  );
  
  if (match) return match;
  
  // Try partial match (e.g., "Red" matches "Mid Red Vivid")
  for (const token of tokens) {
    const tokenNormalized = normalizeColorString(token.label).toLowerCase();
    if (tokenNormalized.includes(lowerNormalized) || lowerNormalized.includes(tokenNormalized)) {
      return token;
    }
  }
  
  // Try matching by primary color name
  const primaryMatch = PRIMARY_COLORS.find(p => 
    normalizeColorString(p.value).toLowerCase() === lowerNormalized ||
    lowerNormalized.includes(normalizeColorString(p.value).toLowerCase())
  );
  
  if (primaryMatch) {
    // Return the first token for this primary color
    const firstToken = tokens.find(t => {
      const tokenFamily = COLOR_FAMILIES.find(f => 
        f.name.trim().toLowerCase() === primaryMatch.value.toLowerCase()
      );
      return tokenFamily && t.label.toLowerCase().includes(primaryMatch.value.toLowerCase());
    });
    return firstToken || null;
  }
  
  return null;
}

/**
 * Get the sort order index for a color
 * Returns a number representing the position in the sorted order
 * Lower numbers come first
 */
export function getColorSortOrder(color: string): number {
  const token = findMatchingColorToken(color);
  if (!token) {
    // Unknown colors go to the end
    return Number.MAX_SAFE_INTEGER;
  }
  
  const tokens = getColorTokenOrder();
  const index = tokens.findIndex(t => 
    t.value === token.value && t.label === token.label
  );
  
  return index >= 0 ? index : Number.MAX_SAFE_INTEGER;
}

/**
 * Compare two colors for sorting
 * Returns negative if a should come before b, positive if after, 0 if equal
 */
export function compareColors(a: string, b: string): number {
  const orderA = getColorSortOrder(a);
  const orderB = getColorSortOrder(b);
  return orderA - orderB;
}
