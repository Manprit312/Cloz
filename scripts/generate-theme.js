const fs = require('fs');
const path = require('path');

// Read token files
const tokensPath = path.join(__dirname, '../tokens');
const colorsPath = path.join(tokensPath, 'colors.json');

let colors = {};
try {
  const colorsData = JSON.parse(fs.readFileSync(colorsPath, 'utf8'));
  colors = colorsData.color || {};
} catch (error) {
  console.error('Error reading colors.json:', error);
  process.exit(1);
}

// Helper functions
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : null;
}

function generateIonicColorCSS(colorName, colorValue, colorData) {
  let css = '';
  const baseColor = colorData?.$value || colorValue;
  const rgb = colorData?.rgb?.$value || hexToRgb(baseColor);
  const shade = colorData?.shade?.$value || baseColor;
  const tint = colorData?.tint?.$value || baseColor;
  
  css += `  --ion-color-${colorName}: ${baseColor};\n`;
  if (rgb) css += `  --ion-color-${colorName}-rgb: ${rgb};\n`;
  css += `  --ion-color-${colorName}-shade: ${shade};\n`;
  css += `  --ion-color-${colorName}-tint: ${tint};\n`;
  css += `  --ion-color-${colorName}-contrast: #ffffff;\n`;
  css += `  --ion-color-${colorName}-contrast-rgb: 255, 255, 255;\n`;
  
  return css;
}

// Generate CSS
let lightCSS = ':root {\n';
let darkCSS = '.dark {\n';

// Light theme - Primary
if (colors.primary) {
  lightCSS += generateIonicColorCSS('primary', colors.primary.$value, colors.primary);
}

// Light theme - Secondary
if (colors.secondary) {
  lightCSS += generateIonicColorCSS('secondary', colors.secondary.$value, colors.secondary);
}

lightCSS += '}\n';

// Dark theme
if (colors.dark) {
  if (colors.dark.primary) {
    darkCSS += `  --ion-color-primary: ${colors.dark.primary.$value};\n`;
  }
  if (colors.dark.secondary) {
    darkCSS += `  --ion-color-secondary: ${colors.dark.secondary.$value};\n`;
  }
  if (colors.dark.background) {
    darkCSS += `  --ion-background-color: ${colors.dark.background.$value};\n`;
  }
  if (colors.dark.text) {
    darkCSS += `  --ion-text-color: ${colors.dark.text.$value};\n`;
  }
}

darkCSS += '}\n';

// Combine and write to file
const outputPath = path.join(__dirname, '../src/theme/variables-generated.scss');
const combinedCSS = lightCSS + '\n' + darkCSS;

// Ensure directory exists
const outputDir = path.dirname(outputPath);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(outputPath, combinedCSS, 'utf8');
console.log('✅ Generated theme variables from tokens at:', outputPath);
