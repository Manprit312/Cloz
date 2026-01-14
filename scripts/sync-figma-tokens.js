/**
 * Figma Tokens Sync Helper Script
 * 
 * This script helps you sync tokens exported from Figma into your local token files.
 * 
 * Usage:
 *   node scripts/sync-figma-tokens.js <path-to-figma-export.json>
 * 
 * Example:
 *   node scripts/sync-figma-tokens.js ~/Downloads/tokens-export.json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get the exported Figma tokens file path from command line
const figmaExportPath = process.argv[2];

if (!figmaExportPath) {
  console.error('❌ Error: Please provide the path to your Figma tokens export file');
  console.log('\nUsage:');
  console.log('  node scripts/sync-figma-tokens.js <path-to-figma-export.json>');
  console.log('\nExample:');
  console.log('  node scripts/sync-figma-tokens.js ~/Downloads/tokens-export.json');
  process.exit(1);
}

// Check if file exists
if (!fs.existsSync(figmaExportPath)) {
  console.error(`❌ Error: File not found: ${figmaExportPath}`);
  process.exit(1);
}

// Read the Figma export
let figmaTokens;
try {
  const fileContent = fs.readFileSync(figmaExportPath, 'utf8');
  figmaTokens = JSON.parse(fileContent);
  console.log('✅ Successfully read Figma tokens export');
} catch (error) {
  console.error('❌ Error reading/parsing Figma tokens file:', error.message);
  process.exit(1);
}

// Paths to local token files
const tokensDir = path.join(__dirname, '../tokens');
const tokenFiles = {
  colors: path.join(tokensDir, 'colors.json'),
  spacing: path.join(tokensDir, 'spacing.json'),
  typography: path.join(tokensDir, 'typography.json'),
  radius: path.join(tokensDir, 'radius.json'),
};

// Helper function to safely merge token objects
function mergeTokens(existing, newTokens, path = '') {
  const merged = { ...existing };
  
  for (const key in newTokens) {
    if (newTokens[key] && typeof newTokens[key] === 'object' && !Array.isArray(newTokens[key])) {
      // Check if it's a token object (has $value or $type)
      if (newTokens[key].$value !== undefined || newTokens[key].$type !== undefined) {
        // This is a token, replace it
        merged[key] = newTokens[key];
      } else {
        // This is a nested object, merge recursively
        merged[key] = mergeTokens(
          existing[key] || {},
          newTokens[key],
          `${path}.${key}`
        );
      }
    } else {
      merged[key] = newTokens[key];
    }
  }
  
  return merged;
}

// Sync colors
if (figmaTokens.color || figmaTokens.colors) {
  const colorsData = figmaTokens.color || figmaTokens.colors;
  let existingColors = { $schema: 'https://schemas.tokens.studio/tokens.json' };
  
  if (fs.existsSync(tokenFiles.colors)) {
    existingColors = JSON.parse(fs.readFileSync(tokenFiles.colors, 'utf8'));
  }
  
  existingColors.color = mergeTokens(existingColors.color || {}, colorsData);
  fs.writeFileSync(tokenFiles.colors, JSON.stringify(existingColors, null, 2));
  console.log('✅ Updated colors.json');
}

// Sync spacing
if (figmaTokens.spacing) {
  let existingSpacing = { $schema: 'https://schemas.tokens.studio/tokens.json' };
  
  if (fs.existsSync(tokenFiles.spacing)) {
    existingSpacing = JSON.parse(fs.readFileSync(tokenFiles.spacing, 'utf8'));
  }
  
  existingSpacing.spacing = mergeTokens(existingSpacing.spacing || {}, figmaTokens.spacing);
  fs.writeFileSync(tokenFiles.spacing, JSON.stringify(existingSpacing, null, 2));
  console.log('✅ Updated spacing.json');
}

// Sync typography
if (figmaTokens.typography) {
  let existingTypography = { $schema: 'https://schemas.tokens.studio/tokens.json' };
  
  if (fs.existsSync(tokenFiles.typography)) {
    existingTypography = JSON.parse(fs.readFileSync(tokenFiles.typography, 'utf8'));
  }
  
  existingTypography.typography = mergeTokens(existingTypography.typography || {}, figmaTokens.typography);
  fs.writeFileSync(tokenFiles.typography, JSON.stringify(existingTypography, null, 2));
  console.log('✅ Updated typography.json');
}

// Sync radius
if (figmaTokens.radius || figmaTokens.borderRadius) {
  const radiusData = figmaTokens.radius || figmaTokens.borderRadius;
  let existingRadius = { $schema: 'https://schemas.tokens.studio/tokens.json' };
  
  if (fs.existsSync(tokenFiles.radius)) {
    existingRadius = JSON.parse(fs.readFileSync(tokenFiles.radius, 'utf8'));
  }
  
  existingRadius.radius = mergeTokens(existingRadius.radius || {}, radiusData);
  fs.writeFileSync(tokenFiles.radius, JSON.stringify(existingRadius, null, 2));
  console.log('✅ Updated radius.json');
}

console.log('\n✨ Tokens synced successfully!');
console.log('\nNext steps:');
console.log('  1. Review the updated token files in tokens/ directory');
console.log('  2. Run: npm run tokens');
console.log('  3. Restart your dev server if it\'s running');

