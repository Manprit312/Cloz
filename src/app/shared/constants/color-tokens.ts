// Color Tokens - Generated from Figma Design System
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
// Ordered as per design requirements:
// 1. Red, 2. Orange, 3. Brown, 4. Yellow, 5. Green, 6. Teal, 7. Blue, 8. Purple, 9. Pink, 10. Gray, 11. White, 12. Black, 13. Print
export const PRIMARY_COLORS: ColorToken[] = [
  { value: 'Red', label: 'Red', hex: '#FF1400', cssVar: '--red-mid-vivid' },
  { value: 'Orange', label: 'Orange', hex: '#FF5500', cssVar: '--orange-mid-vivid' },
  { value: 'Brown', label: 'Brown', hex: '#FF8800', cssVar: '--brown-mid-vivid' },
  { value: 'Yellow', label: 'Yellow', hex: '#FFD700', cssVar: '--yellow-mid-vivid' },
  { value: 'Green', label: 'Green', hex: '#52FF00', cssVar: '--green-mid-vivid' },
  { value: 'Teal', label: 'Teal', hex: '#00FFFF', cssVar: '--teal-mid-vivid' },
  { value: 'Blue', label: 'Blue', hex: '#007FFF', cssVar: '--blue-mid-vivid' },
  { value: 'Purple', label: 'Purple', hex: '#6F00FF', cssVar: '--purple-mid-vivid' },
  { value: 'Pink', label: 'Pink', hex: '#FF0080', cssVar: '--pink-mid-vivid' },
  { value: 'Gray', label: 'Gray', hex: '#808080', cssVar: '--gray-mid-vivid' },
  { value: 'White', label: 'White', hex: '#FFFFFF', cssVar: '--white' },
  { value: 'Black', label: 'Black', hex: '#000000', cssVar: '--black' },
  { value: 'Print', label: 'Print', hex: 'print' },
];

// Color Families with all variations
export const COLOR_FAMILIES: ColorFamily[] = [
  {
    name: 'Red',
    levels: [
      {
        name: 'Extra Dark Red Soft ',
        variations: [
          { value: 'Extra Dark Red Vivid', label: 'Extra Dark Red Vivid', hex: '#4C0600', cssVar: '--red-extra-dark-vivid' },
          { value: 'Extra Dark Red Soft', label: 'Extra Dark Red Soft', hex: '#430E0A', cssVar: '--red-extra-dark-soft' },
          { value: 'Extra Dark Red Muted', label: 'Extra Dark Red Muted', hex: '#361917', cssVar: '--red-extra-dark-muted' }
        ]
      },
      {
        name: 'Dark Red Soft',
        variations: [
          { value: 'Dark Red Vivid', label: 'Dark Red Vivid', hex: '#8A0B00', cssVar: '--red-dark-vivid' },
          { value: 'Dark Red Soft', label: 'Dark Red Soft', hex: '#781911', cssVar: '--red-dark-soft' },
          { value: 'Dark Red Muted', label: 'Dark Red Muted', hex: '#602E29', cssVar: '--red-dark-muted' }
        ]
      },
      {
        name: 'Mid Red Soft',
        variations: [
          { value: 'Mid Red Vivid', label: 'Mid Red Vivid', hex: '#FF1400', cssVar: '--red-mid-vivid' },
          { value: 'Mid Red Soft', label: 'Mid Red Soft', hex: '#DF2F20', cssVar: '--red-mid-soft' },
          { value: 'Mid Red Muted', label: 'Mid Red Muted', hex: '#B2554D', cssVar: '--red-mid-muted' }
        ]
      },
      {
        name: 'Light Red Soft ',
        variations: [
          { value: 'Light Red Vivid', label: 'Light Red Vivid', hex: '#FF8075', cssVar: '--red-light-vivid' },
          { value: 'Light Red Soft', label: 'Light Red Soft', hex: '#EE8F87', cssVar: '--red-light-soft' },
          { value: 'Light Red Muted', label: 'Light Red Muted', hex: '#D6A39F', cssVar: '--red-light-muted' }
        ]
      },
      {
        name: 'Extra Light Red Soft',
        variations: [
          { value: 'Extra Light Red Vivid', label: 'Extra Light Red Vivid', hex: '#FFC2BD', cssVar: '--red-extra-light-vivid' },
          { value: 'Extra Light Red Soft', label: 'Extra Light Red Soft', hex: '#F7C9C5', cssVar: '--red-extra-light-soft' },
          { value: 'Extra Light Red Muted', label: 'Extra Light Red Muted', hex: '#EBD3D1', cssVar: '--red-extra-light-muted' }
        ]
      }
    ]
  },
  {
    name: 'Orange ',
    levels: [
      {
        name: 'Extra Dark Orange Soft',
        variations: [
          { value: 'Extra Dark Orange Vivid', label: 'Extra Dark Orange Vivid', hex: '#4D1A00', cssVar: '--orange-extra-dark-vivid' },
          { value: 'Extra Dark Orange Soft', label: 'Extra Dark Orange Soft', hex: '#431D0A', cssVar: '--orange-extra-dark-soft' },
          { value: 'Extra Dark Orange Muted', label: 'Extra Dark Orange Muted', hex: '#362117', cssVar: '--orange-extra-dark-muted' }
        ]
      },
      {
        name: 'Dark Orange Soft',
        variations: [
          { value: 'Dark Orange Vivid', label: 'Dark Orange Vivid', hex: '#8A2E00', cssVar: '--orange-dark-vivid' },
          { value: 'Dark Orange Soft', label: 'Dark Orange Soft', hex: '#783411', cssVar: '--orange-dark-soft' },
          { value: 'Dark Orange Muted', label: 'Dark Orange Muted', hex: '#603C29', cssVar: '--orange-dark-muted' }
        ]
      },
      {
        name: 'Mid Orange Soft',
        variations: [
          { value: 'Mid Orange Vivid', label: 'Mid Orange Vivid', hex: '#FF5500', cssVar: '--orange-mid-vivid' },
          { value: 'Mid Orange Soft', label: 'Mid Orange Soft', hex: '#DF6020', cssVar: '--orange-mid-soft' },
          { value: 'Mid Orange Muted', label: 'Mid Orange Muted', hex: '#B26F4D', cssVar: '--orange-mid-muted' }
        ]
      },
      {
        name: 'Light Orange Soft',
        variations: [
          { value: 'Light Orange Vivid', label: 'Light Orange Vivid', hex: '#FFA375', cssVar: '--orange-light-vivid' },
          { value: 'Light Orange Soft', label: 'Light Orange Soft', hex: '#EEA987', cssVar: '--orange-light-soft' },
          { value: 'Light Orange Muted', label: 'Light Orange Muted', hex: '#D6B19F', cssVar: '--orange-light-muted' }
        ]
      },
      {
        name: 'Extra Light Orange Soft',
        variations: [
          { value: 'Extra Light Orange Vivid', label: 'Extra Light Orange Vivid', hex: '#FFD3BD', cssVar: '--orange-extra-light-vivid' },
          { value: 'Extra Light Orange Soft', label: 'Extra Light Orange Soft', hex: '#F7D6C5', cssVar: '--orange-extra-light-soft' },
          { value: 'Extra Light Orange Muted', label: 'Extra Light Orange Muted', hex: '#EBDAD1', cssVar: '--orange-extra-light-muted' }
        ]
      }
    ]
  },
  {
    name: 'Yellow',
    levels: [
      {
        name: 'Extra Dark Yellow Soft',
        variations: [
          { value: 'Extra Dark Yellow Vivid', label: 'Extra Dark Yellow Vivid', hex: '#4D4100', cssVar: '--yellow-extra-dark-vivid' },
          { value: 'Extra Dark Yellow Soft', label: 'Extra Dark Yellow Soft', hex: '#433A0A', cssVar: '--yellow-extra-dark-soft' },
          { value: 'Extra Dark Yellow Muted', label: 'Extra Dark Yellow Muted', hex: '#363117', cssVar: '--yellow-extra-dark-muted' }
        ]
      },
      {
        name: 'Dark Yellow Soft',
        variations: [
          { value: 'Dark Yellow Vivid', label: 'Dark Yellow Vivid', hex: '#8A7400', cssVar: '--yellow-dark-vivid' },
          { value: 'Dark Yellow Soft', label: 'Dark Yellow Soft', hex: '#786811', cssVar: '--yellow-dark-soft' },
          { value: 'Dark Yellow Muted', label: 'Dark Yellow Muted', hex: '#605829', cssVar: '--yellow-dark-muted' }
        ]
      },
      {
        name: 'Mid Yellow Soft',
        variations: [
          { value: 'Mid Yellow Vivid', label: 'Mid Yellow Vivid', hex: '#FFD700', cssVar: '--yellow-mid-vivid' },
          { value: 'Mid Yellow Soft', label: 'Mid Yellow Soft', hex: '#DFC120', cssVar: '--yellow-mid-soft' },
          { value: 'Mid Yellow Muted', label: 'Mid Yellow Muted', hex: '#B2A24D', cssVar: '--yellow-mid-muted' }
        ]
      },
      {
        name: 'Light Yellow Soft',
        variations: [
          { value: 'Light Yellow Vivid', label: 'Light Yellow Vivid', hex: '#FFED8B', cssVar: '--yellow-light-vivid' },
          { value: 'Light Yellow Soft', label: 'Light Yellow Soft', hex: '#F0E399', cssVar: '--yellow-light-soft' },
          { value: 'Light Yellow Muted', label: 'Light Yellow Muted', hex: '#DCD5AE', cssVar: '--yellow-light-muted' }
        ]
      },
      {
        name: 'Extra Light Yellow Soft',
        variations: [
          { value: 'Extra Light Yellow Vivid', label: 'Extra Light Yellow Vivid', hex: '#FFF7CC', cssVar: '--yellow-extra-light-vivid' },
          { value: 'Extra Light Yellow Soft', label: 'Extra Light Yellow Soft', hex: '#F9F3D2', cssVar: '--yellow-extra-light-soft' },
          { value: 'Extra Light Yellow Muted', label: 'Extra Light Yellow Muted', hex: '#F0EDDB', cssVar: '--yellow-extra-light-muted' }
        ]
      }
    ]
  },
  {
    name: 'Green',
    levels: [
      {
        name: 'Extra Dark Green Soft',
        variations: [
          { value: 'Extra Dark Green Vivid', label: 'Extra Dark Green Vivid', hex: '#194D00', cssVar: '--green-extra-dark-vivid' },
          { value: 'Extra Dark Green Soft', label: 'Extra Dark Green Soft', hex: '#1C430A', cssVar: '--green-extra-dark-soft' },
          { value: 'Extra Dark Green Muted', label: 'Extra Dark Green Muted', hex: '#213617', cssVar: '--green-extra-dark-muted' }
        ]
      },
      {
        name: 'Dark Green Soft',
        variations: [
          { value: 'Dark Green Vivid', label: 'Dark Green Vivid', hex: '#2D8A00', cssVar: '--green-dark-vivid' },
          { value: 'Dark Green Soft', label: 'Dark Green Soft', hex: '#337811', cssVar: '--green-dark-soft' },
          { value: 'Dark Green Muted', label: 'Dark Green Muted', hex: '#3B6029', cssVar: '--green-dark-muted' }
        ]
      },
      {
        name: 'Mid Green Soft',
        variations: [
          { value: 'Mid Green Vivid', label: 'Mid Green Vivid', hex: '#52FF00', cssVar: '--green-mid-vivid' },
          { value: 'Mid Green Soft', label: 'Mid Green Soft', hex: '#5EDF20', cssVar: '--green-mid-soft' },
          { value: 'Mid Green Muted', label: 'Mid Green Muted', hex: '#6DB24D', cssVar: '--green-mid-muted' }
        ]
      },
      {
        name: 'Light Green Soft',
        variations: [
          { value: 'Light Green Vivid', label: 'Light Green Vivid', hex: '#A2FF75', cssVar: '--green-light-vivid' },
          { value: 'Light Green Soft', label: 'Light Green Soft', hex: '#A8EE87', cssVar: '--green-light-soft' },
          { value: 'Light Green Muted', label: 'Light Green Muted', hex: '#B0D69F', cssVar: '--green-light-muted' }
        ]
      },
      {
        name: 'Extra Light Green Soft',
        variations: [
          { value: 'Extra Light Green Vivid', label: 'Extra Light Green Vivid', hex: '#D2FFBD', cssVar: '--green-extra-light-vivid' },
          { value: 'Extra Light Green Soft', label: 'Extra Light Green Soft', hex: '#D5F7C5', cssVar: '--green-extra-light-soft' },
          { value: 'Extra Light Green Muted', label: 'Extra Light Green Muted', hex: '#D9EBD1', cssVar: '--green-extra-light-muted' }
        ]
      }
    ]
  },
  {
    name: 'Teal',
    levels: [
      {
        name: 'Extra Dark Teal Soft',
        variations: [
          { value: 'Extra Dark Teal Vivid', label: 'Extra Dark Teal Vivid', hex: '#004D4D', cssVar: '--teal-extra-dark-vivid' },
          { value: 'Extra Dark Teal Soft', label: 'Extra Dark Teal Soft', hex: '#0A4343', cssVar: '--teal-extra-dark-soft' },
          { value: 'Extra Dark Teal Muted', label: 'Extra Dark Teal Muted', hex: '#173636', cssVar: '--teal-extra-dark-muted' }
        ]
      },
      {
        name: 'Dark Teal Soft',
        variations: [
          { value: 'Dark Teal Vivid', label: 'Dark Teal Vivid', hex: '#008A8A', cssVar: '--teal-dark-vivid' },
          { value: 'Dark Teal Soft', label: 'Dark Teal Soft', hex: '#117878', cssVar: '--teal-dark-soft' },
          { value: 'Dark Teal Muted', label: 'Dark Teal Muted', hex: '#296060', cssVar: '--teal-dark-muted' }
        ]
      },
      {
        name: 'Mid Teal Soft',
        variations: [
          { value: 'Mid Teal Vivid', label: 'Mid Teal Vivid', hex: '#00FFFF', cssVar: '--teal-mid-vivid' },
          { value: 'Mid Teal Soft', label: 'Mid Teal Soft', hex: '#20DFDF', cssVar: '--teal-mid-soft' },
          { value: 'Mid Teal Muted', label: 'Mid Teal Muted', hex: '#4CB2B2', cssVar: '--teal-mid-muted' }
        ]
      },
      {
        name: 'Light Teal Soft',
        variations: [
          { value: 'Light Teal Vivid', label: 'Light Teal Vivid', hex: '#75FFFF', cssVar: '--teal-light-vivid' },
          { value: 'Light Teal Soft', label: 'Light Teal Soft', hex: '#87EEEE', cssVar: '--teal-light-soft' },
          { value: 'Light Teal Muted', label: 'Light Teal Muted', hex: '#9FD6D6', cssVar: '--teal-light-muted' }
        ]
      },
      {
        name: 'Extra Light Teal Soft',
        variations: [
          { value: 'Extra Light Teal Vivid', label: 'Extra Light Teal Vivid', hex: '#BDFFFF', cssVar: '--teal-extra-light-vivid' },
          { value: 'Extra Light Teal Soft', label: 'Extra Light Teal Soft', hex: '#C5F7F7', cssVar: '--teal-extra-light-soft' },
          { value: 'Extra Light Teal Muted', label: 'Extra Light Teal Muted', hex: '#D1EBEB', cssVar: '--teal-extra-light-muted' }
        ]
      }
    ]
  },
  {
    name: 'Blue',
    levels: [
      {
        name: 'Extra Dark Blue Soft',
        variations: [
          { value: 'Extra Dark Blue Vivid', label: 'Extra Dark Blue Vivid', hex: '#00264D', cssVar: '--blue-extra-dark-vivid' },
          { value: 'Extra Dark Blue Soft', label: 'Extra Dark Blue Soft', hex: '#0A2643', cssVar: '--blue-extra-dark-soft' },
          { value: 'Extra Dark Blue Muted', label: 'Extra Dark Blue Muted', hex: '#1B2632', cssVar: '--blue-extra-dark-muted' }
        ]
      },
      {
        name: 'Dark Blue Soft',
        variations: [
          { value: 'Dark Blue Vivid', label: 'Dark Blue Vivid', hex: '#00458A', cssVar: '--blue-dark-vivid' },
          { value: 'Dark Blue Soft', label: 'Dark Blue Soft', hex: '#114578', cssVar: '--blue-dark-soft' },
          { value: 'Dark Blue Muted', label: 'Dark Blue Muted', hex: '#294560', cssVar: '--blue-dark-muted' }
        ]
      },
      {
        name: 'Mid Blue Soft',
        variations: [
          { value: 'Mid Blue Vivid', label: 'Mid Blue Vivid', hex: '#007FFF', cssVar: '--blue-mid-vivid' },
          { value: 'Mid Blue Soft', label: 'Mid Blue Soft', hex: '#207FDF', cssVar: '--blue-mid-soft' },
          { value: 'Mid Blue Muted', label: 'Mid Blue Muted', hex: '#597FA6', cssVar: '--blue-mid-muted' }
        ]
      },
      {
        name: 'Light Blue Soft',
        variations: [
          { value: 'Light Blue Vivid', label: 'Light Blue Vivid', hex: '#75BAFF', cssVar: '--blue-light-vivid' },
          { value: 'Light Blue Soft', label: 'Light Blue Soft', hex: '#87BAEE', cssVar: '--blue-light-soft' },
          { value: 'Light Blue Muted', label: 'Light Blue Muted', hex: '#9FBAD6', cssVar: '--blue-light-muted' }
        ]
      },
      {
        name: 'Extra Light Blue Soft',
        variations: [
          { value: 'Extra Light Blue Vivid', label: 'Extra Light Blue Vivid', hex: '#BDDEFF', cssVar: '--blue-extra-light-vivid' },
          { value: 'Extra Light Blue Soft', label: 'Extra Light Blue Soft', hex: '#C5DEF7', cssVar: '--blue-extra-light-soft' },
          { value: 'Extra Light Blue Muted', label: 'Extra Light Blue Muted', hex: '#D1DEEB', cssVar: '--blue-extra-light-muted' }
        ]
      }
    ]
  },
  {
    name: 'Purple',
    levels: [
      {
        name: 'Extra Dark Purple Soft',
        variations: [
          { value: 'Extra Dark Purple Vivid', label: 'Extra Dark Purple Vivid', hex: '#21004D', cssVar: '--purple-extra-dark-vivid' },
          { value: 'Extra Dark Purple Soft', label: 'Extra Dark Purple Soft', hex: '#230A43', cssVar: '--purple-extra-dark-soft' },
          { value: 'Extra Dark Purple Muted', label: 'Extra Dark Purple Muted', hex: '#241736', cssVar: '--purple-extra-dark-muted' }
        ]
      },
      {
        name: 'Dark Purple Soft',
        variations: [
          { value: 'Dark Purple Vivid', label: 'Dark Purple Vivid', hex: '#3C008A', cssVar: '--purple-dark-vivid' },
          { value: 'Dark Purple Soft', label: 'Dark Purple Soft', hex: '#3E1178', cssVar: '--purple-dark-soft' },
          { value: 'Dark Purple Muted', label: 'Dark Purple Muted', hex: '#412960', cssVar: '--purple-dark-muted' }
        ]
      },
      {
        name: 'Mid Purple Soft',
        variations: [
          { value: 'Mid Purple Vivid', label: 'Mid Purple Vivid', hex: '#6F00FF', cssVar: '--purple-mid-vivid' },
          { value: 'Mid Purple Soft', label: 'Mid Purple Soft', hex: '#7320DF', cssVar: '--purple-mid-soft' },
          { value: 'Mid Purple Muted', label: 'Mid Purple Muted', hex: '#794DB2', cssVar: '--purple-mid-muted' }
        ]
      },
      {
        name: 'Light Purple Soft',
        variations: [
          { value: 'Light Purple Vivid', label: 'Light Purple Vivid', hex: '#B175FF', cssVar: '--purple-light-vivid' },
          { value: 'Light Purple Soft', label: 'Light Purple Soft', hex: '#B387EE', cssVar: '--purple-light-soft' },
          { value: 'Light Purple Muted', label: 'Light Purple Muted', hex: '#B69FD6', cssVar: '--purple-light-muted' }
        ]
      },
      {
        name: 'Extra Light Purple Soft',
        variations: [
          { value: 'Extra Light Purple Vivid', label: 'Extra Light Purple Vivid', hex: '#E2CCFF', cssVar: '--purple-extra-light-vivid' },
          { value: 'Extra Light Purple Soft', label: 'Extra Light Purple Soft', hex: '#E3D2F9', cssVar: '--purple-extra-light-soft' },
          { value: 'Extra Light Purple Muted', label: 'Extra Light Purple Muted', hex: '#E4DBF0', cssVar: '--purple-extra-light-muted' }
        ]
      }
    ]
  },
  {
    name: 'Pink',
    levels: [
      {
        name: 'Extra Dark Pink Soft',
        variations: [
          { value: 'Extra Dark Pink Vivid', label: 'Extra Dark Pink Vivid', hex: '#4D0026', cssVar: '--pink-extra-dark-vivid' },
          { value: 'Extra Dark Pink Soft', label: 'Extra Dark Pink Soft', hex: '#430A26', cssVar: '--pink-extra-dark-soft' },
          { value: 'Extra Dark Pink Muted', label: 'Extra Dark Pink Muted', hex: '#361726', cssVar: '--pink-extra-dark-muted' }
        ]
      },
      {
        name: 'Dark Pink Soft',
        variations: [
          { value: 'Dark Pink Vivid', label: 'Dark Pink Vivid', hex: '#8A0045', cssVar: '--pink-dark-vivid' },
          { value: 'Dark Pink Soft', label: 'Dark Pink Soft', hex: '#781145', cssVar: '--pink-dark-soft' },
          { value: 'Dark Pink Muted', label: 'Dark Pink Muted', hex: '#602945', cssVar: '--pink-dark-muted' }
        ]
      },
      {
        name: 'Mid Pink Soft',
        variations: [
          { value: 'Mid Pink Vivid', label: 'Mid Pink Vivid', hex: '#FF0080', cssVar: '--pink-mid-vivid' },
          { value: 'Mid Pink Soft', label: 'Mid Pink Soft', hex: '#DF2080', cssVar: '--pink-mid-soft' },
          { value: 'Mid Pink Muted', label: 'Mid Pink Muted', hex: '#B24D80', cssVar: '--pink-mid-muted' }
        ]
      },
      {
        name: 'Light Pink Soft',
        variations: [
          { value: 'Light Pink Vivid', label: 'Light Pink Vivid', hex: '#FF75BA', cssVar: '--pink-light-vivid' },
          { value: 'Light Pink Soft', label: 'Light Pink Soft', hex: '#EE87BA', cssVar: '--pink-light-soft' },
          { value: 'Light Pink Muted', label: 'Light Pink Muted', hex: '#D69FBA', cssVar: '--pink-light-muted' }
        ]
      },
      {
        name: 'Extra Light Pink Soft',
        variations: [
          { value: 'Extra Light Pink Vivid', label: 'Extra Light Pink Vivid', hex: '#FFCCE5', cssVar: '--pink-extra-light-vivid' },
          { value: 'Extra Light Pink Soft', label: 'Extra Light Pink Soft', hex: '#F9D2E5', cssVar: '--pink-extra-light-soft' },
          { value: 'Extra Light Pink Muted', label: 'Extra Light Pink Muted', hex: '#F0DBE5', cssVar: '--pink-extra-light-muted' }
        ]
      }
    ]
  },
  {
    name: 'Brown',
    levels: [
      {
        name: 'Extra Dark Brown Soft',
        variations: [
          { value: 'Extra Dark Brown Vivid', label: 'Extra Dark Brown Vivid', hex: '#4D2900', cssVar: '--brown-extra-dark-vivid' },
          { value: 'Extra Dark Brown Soft', label: 'Extra Dark Brown Soft', hex: '#43280A', cssVar: '--brown-extra-dark-soft' },
          { value: 'Extra Dark Brown Muted', label: 'Extra Dark Brown Muted', hex: '#362817', cssVar: '--brown-extra-dark-muted' }
        ]
      },
      {
        name: 'Dark Brown Soft',
        variations: [
          { value: 'Dark Brown Vivid', label: 'Dark Brown Vivid', hex: '#8A4900', cssVar: '--brown-dark-vivid' },
          { value: 'Dark Brown Soft', label: 'Dark Brown Soft', hex: '#784811', cssVar: '--brown-dark-soft' },
          { value: 'Dark Brown Muted', label: 'Dark Brown Muted', hex: '#604729', cssVar: '--brown-dark-muted' }
        ]
      },
      {
        name: 'Mid Brown Soft',
        variations: [
          { value: 'Mid Brown Vivid', label: 'Mid Brown Vivid', hex: '#FF8800', cssVar: '--brown-mid-vivid' },
          { value: 'Mid Brown Soft', label: 'Mid Brown Soft', hex: '#DF8620', cssVar: '--brown-mid-soft' },
          { value: 'Mid Brown Muted', label: 'Mid Brown Muted', hex: '#B2834D', cssVar: '--brown-mid-muted' }
        ]
      },
      {
        name: 'Light Brown Soft',
        variations: [
          { value: 'Light Brown Vivid', label: 'Light Brown Vivid', hex: '#FFBF75', cssVar: '--brown-light-vivid' },
          { value: 'Light Brown Soft', label: 'Light Brown Soft', hex: '#EEBE87', cssVar: '--brown-light-soft' },
          { value: 'Light Brown Muted', label: 'Light Brown Muted', hex: '#D6BC9F', cssVar: '--brown-light-muted' }
        ]
      },
      {
        name: 'Extra Light Brown Soft' ,
        variations: [
          { value: 'Extra Light Brown Vivid', label: 'Extra Light Brown Vivid', hex: '#FFE0BD', cssVar: '--brown-extra-light-vivid' },
          { value: 'Extra Light Brown Soft', label: 'Extra Light Brown Soft', hex: '#F7E0C5', cssVar: '--brown-extra-light-soft' },
          { value: 'Extra Light Brown Muted', label: 'Extra Light Brown Muted', hex: '#EBDFD1', cssVar: '--brown-extra-light-muted' }
        ]
      }
    ]
  },
  {
    name: 'Gray',
    levels: [
      {
        name: 'Extra Dark Gray',
        variations: [
          { value: 'Extra Dark Gray', label: 'Extra Dark Gray', hex: '#262626', cssVar: '--gray-extra-dark' }
        ]
      },
      {
        name: 'Dark Gray',
        variations: [
          { value: 'Dark Gray', label: 'Dark Gray', hex: '#454545', cssVar: '--gray-dark' }
        ]
      },
      {
        name: 'Mid Gray',
        variations: [
          { value: 'Mid Gray', label: 'Mid Gray', hex: '#808080', cssVar: '--gray-mid' }
        ]
      },
      {
        name: 'Light Gray',
        variations: [
          { value: 'Light Gray', label: 'Light Gray', hex: '#BABABA', cssVar: '--gray-light' }
        ]
      },
      {
        name: 'Extra Light Gray',
        variations: [
          { value: 'Extra Light Gray', label: 'Extra Light Gray', hex: '#E6E6E6', cssVar: '--gray-extra-light' }
        ]
      }
    ]
  }
];

/**
 * Resolve a color string (e.g. "Extra Dark Blue Vivid") to its family and level.
 * Returns null if the color is empty or not found as a variation in COLOR_FAMILIES.
 * Used to open the color selection modal at the saturation step when editing in garment details.
 */
export function getColorFamilyAndLevel(color: string): { family: string; level: string } | null {
  if (!color || !String(color).trim()) return null;
  const n = (s: string) => String(s).trim().toLowerCase();
  const needle = n(color);
  for (const family of COLOR_FAMILIES) {
    for (const level of family.levels) {
      const found = level.variations.some(
        (v) => n(v.value) === needle || n(v.label) === needle
      );
      if (found) return { family: family.name, level: level.name };
    }
  }
  return null;
}

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
  return `--${familyLower}-${levelLower}-${variationLower}`;
}

// Get color hex from CSS variable
export function getCssVarValue(cssVar: string): string {
  if (typeof window !== 'undefined') {
    const value = getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim();
    return value || '#000000';
  }
  return '#000000';
}
