/**
 * Convert individual SVG files to SVG Sprite format
 * 
 * Usage:
 *   node scripts/convert-icons-to-sprite.js
 * 
 * This script reads SVG files from src/assets/icons/individual/
 * and combines them into a sprite at src/assets/icons/SparkIcons.svg
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const iconsDir = path.join(__dirname, '../src/assets/icons/individual');
const outputFile = path.join(__dirname, '../src/assets/icons/SparkIcons.svg');

// Check if individual icons directory exists
if (!fs.existsSync(iconsDir)) {
  console.log('📁 Creating individual icons directory...');
  fs.mkdirSync(iconsDir, { recursive: true });
  console.log('✅ Created:', iconsDir);
  console.log('\n📝 Next steps:');
  console.log('1. Export icons from Figma as individual SVG files');
  console.log('2. Place them in:', iconsDir);
  console.log('3. Run this script again to generate sprite');
  process.exit(0);
}

// Read all SVG files
const svgFiles = fs.readdirSync(iconsDir).filter(file => file.endsWith('.svg'));

if (svgFiles.length === 0) {
  console.log('⚠️  No SVG files found in:', iconsDir);
  console.log('\n📝 To add icons:');
  console.log('1. Export icons from Figma as SVG');
  console.log('2. Place them in:', iconsDir);
  console.log('3. Run this script again');
  process.exit(0);
}

console.log(`📦 Found ${svgFiles.length} icon(s) to process...`);

// Start building sprite
let spriteContent = '<svg xmlns="http://www.w3.org/2000/svg" style="display: none;">\n';

svgFiles.forEach((file, index) => {
  const filePath = path.join(iconsDir, file);
  const svgContent = fs.readFileSync(filePath, 'utf8');
  
  // Extract icon name from filename (remove .svg extension)
  const iconName = path.basename(file, '.svg');
  
  // Try to extract viewBox and content from SVG
  const viewBoxMatch = svgContent.match(/viewBox=["']([^"']+)["']/);
  const viewBox = viewBoxMatch ? viewBoxMatch[1] : '0 0 24 24';
  
  // Extract inner content (everything between <svg> tags)
  const innerMatch = svgContent.match(/<svg[^>]*>([\s\S]*)<\/svg>/);
  const innerContent = innerMatch ? innerMatch[1].trim() : '';
  
  // Create symbol
  spriteContent += `  <symbol id="${iconName}" viewBox="${viewBox}">\n`;
  spriteContent += `    ${innerContent}\n`;
  spriteContent += `  </symbol>\n`;
  
  console.log(`  ✅ Processed: ${iconName}`);
});

spriteContent += '</svg>';

// Write sprite file
fs.writeFileSync(outputFile, spriteContent, 'utf8');

console.log(`\n🎉 Generated sprite with ${svgFiles.length} icon(s)!`);
console.log(`📄 Output: ${outputFile}`);
console.log('\n💡 Usage in components:');
console.log('  <app-icon [name]="\'icon-name\'"></app-icon>');
console.log('\n📝 Don\'t forget to add icon name to icon.types.ts!');

