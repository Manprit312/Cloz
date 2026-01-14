#!/usr/bin/env node
/**
 * Generate color-tokens.ts from Figma tokens in ionic-core.css
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cssFile = path.join(__dirname, '../src/theme/design-system/ionic-core.css');
const outputFile = path.join(__dirname, '../src/app/shared/constants/color-tokens.ts');

// Read the CSS file
const cssContent = fs.readFileSync(cssFile, 'utf8');

// Extract color variables
const colorRegex = /--([a-z]+)-(extra-dark|dark|mid|light|extra-light)-(vivid|soft|muted): (#[0-9a-f]{6});/gi;
const matches = [...cssContent.matchAll(colorRegex)];

// Group colors by family
const colorFamilies = {};
matches.forEach(([_, family, level, variation, hex]) => {
  if (!colorFamilies[family]) {
    colorFamilies[family] = [];
  }
  
  const levelName = level.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const variationName = variation.charAt(0).toUpperCase() + variation.slice(1);
  const familyName = family.charAt(0).toUpperCase() + family.slice(1);
  
  let levelData = colorFamilies[family].find(l => l.level === level);
  if (!levelData) {
    levelData = {
      level,
      levelName: `${levelName} ${familyName}`,
      variations: []
    };
    colorFamilies[family].push(levelData);
  }
  
  levelData.variations.push({
    variation,
    variationName,
    hex: hex.toUpperCase(),
    label: `${levelName} ${familyName} ${variationName}`
  });
});

// Generate TypeScript code
let tsCode = `// Color Tokens - Generated from Figma Design System
// Auto-generated from design-tokens.json via ionic-core.css
// Do not edit manually - run: node scripts/generate-color-tokens.js

export interface ColorToken {
  value: string;
  label: string;
  hex: string;
  cssVar?: string;
}

export interface ColorFamily {
  name: string;
  levels: ColorLevel[];
}

export interface ColorLevel {
  name: string;
  variations: ColorToken[];
}

// Primary Colors (Main color per family - using mid-vivid)
export const PRIMARY_COLORS: ColorToken[] = [
`;

// Add primary colors
Object.keys(colorFamilies).forEach(family => {
  const familyName = family.charAt(0).toUpperCase() + family.slice(1);
  const midLevel = colorFamilies[family].find(l => l.level === 'mid');
  const vividVariation = midLevel?.variations.find(v => v.variation === 'vivid');
  
  if (vividVariation) {
    tsCode += `  { value: '${familyName}', label: '${familyName}', hex: '${vividVariation.hex}', cssVar: '--${family}-mid-vivid' },\n`;
  }
});

tsCode += `  { value: 'Print', label: 'Print', hex: 'print' },
];

// Color Families with all variations
export const COLOR_FAMILIES: ColorFamily[] = [
`;

// Add color families
Object.keys(colorFamilies).forEach((family, familyIndex) => {
  const familyName = family.charAt(0).toUpperCase() + family.slice(1);
  
  tsCode += `  {
    name: '${familyName}',
    levels: [
`;
  
  colorFamilies[family].forEach((levelData, levelIndex) => {
    tsCode += `      {
        name: '${levelData.levelName}',
        variations: [
`;
    
    levelData.variations.forEach((varData, varIndex) => {
      const cssVar = `--${family}-${levelData.level}-${varData.variation}`;
      tsCode += `          { value: '${varData.label}', label: '${varData.label}', hex: '${varData.hex}', cssVar: '${cssVar}' }`;
      if (varIndex < levelData.variations.length - 1) tsCode += ',';
      tsCode += '\n';
    });
    
    tsCode += `        ]
      }`;
    if (levelIndex < colorFamilies[family].length - 1) tsCode += ',';
    tsCode += '\n';
  });
  
  tsCode += `    ]
  }`;
  if (familyIndex < Object.keys(colorFamilies).length - 1) tsCode += ',';
  tsCode += '\n';
});

tsCode += `];

// Helper function to get color variations by family and level
export function getColorVariations(family: string, level: string): ColorToken[] {
  const colorFamily = COLOR_FAMILIES.find(f => f.name === family);
  if (!colorFamily) return [];
  
  const colorLevel = colorFamily.levels.find(l => l.name.includes(level));
  return colorLevel ? colorLevel.variations : [];
}

// Helper function to get all levels for a color family
export function getColorLevels(family: string): string[] {
  const colorFamily = COLOR_FAMILIES.find(f => f.name === family);
  return colorFamily ? colorFamily.levels.map(l => l.name) : [];
}

// Helper function to get base color for a level (uses "Soft" variant)
export function getBaseLevelColor(family: string, level: string): string {
  const variations = getColorVariations(family, level);
  const softVariation = variations.find(v => v.label.includes('Soft'));
  return softVariation ? softVariation.hex : (variations[1]?.hex || '#000000');
}

// Helper function to get CSS variable name
export function getColorCssVar(family: string, level: string, variation: string): string {
  const familyLower = family.toLowerCase();
  const levelLower = level.toLowerCase().replace(/ /g, '-');
  const variationLower = variation.toLowerCase();
  return \`--\${familyLower}-\${levelLower}-\${variationLower}\`;
}

// Get color hex from CSS variable
export function getCssVarValue(cssVar: string): string {
  if (typeof window !== 'undefined') {
    const value = getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim();
    return value || '#000000';
  }
  return '#000000';
}
`;

// Write the TypeScript file
fs.writeFileSync(outputFile, tsCode);
console.log('✅ Generated color-tokens.ts from Figma tokens!');
console.log(`   Colors: ${Object.keys(colorFamilies).length} families`);
console.log(`   Output: ${outputFile}`);

