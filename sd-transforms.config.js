import StyleDictionary from 'style-dictionary';
import { register, expandTypesMap } from '@tokens-studio/sd-transforms';

// Register tokens-studio transforms
register(StyleDictionary, {
  excludeParentKeys: true,
  platform: 'css',
  expand: {
    typography: true,
    shadow: true,
    border: true,
    composition: true,
  },
});

// Configure Style Dictionary
// Read from root where Token Studio syncs to GitHub
const sd = new StyleDictionary({
  source: ['design-tokens.json'],
  preprocessors: ['tokens-studio'],
  expand: {
    typesMap: expandTypesMap,
  },
  platforms: {
    'ionic-core': {
      transformGroup: 'tokens-studio',
      transforms: ['name/kebab', 'ts/color/css/hexrgba'],
      buildPath: 'src/theme/design-system/',
      files: [
        {
          destination: 'ionic-core.css',
          format: 'css/variables',
          filter: token => !token.original.value.toString().includes('{'),
          options: {
            selector: ':root',
          },
        },
      ],
    },
    'ionic-semantic': {
      transformGroup: 'tokens-studio',
      transforms: ['name/kebab'],
      buildPath: 'src/theme/design-system/',
      files: [
        {
          destination: 'ionic-semantic.css',
          format: 'css/variables',
          filter: token => {
            const valueStr = JSON.stringify(token.original.value);
            return valueStr.includes('{') && !valueStr.includes('dark');
          },
          options: {
            outputReferences: true,
            selector: ':root',
          },
        },
      ],
    },
    'ionic-semantic-dark': {
      transformGroup: 'tokens-studio',
      transforms: ['name/kebab'],
      buildPath: 'src/theme/design-system/',
      files: [
        {
          destination: 'ionic-semantic-dark.css',
          format: 'css/variables',
          filter: token =>
            JSON.stringify(token.original.value).includes('dark'),
          options: {
            outputReferences: true,
            selector: '.dark',
          },
        },
      ],
    },
  },
});

// Run build
async function build() {
  await sd.cleanAllPlatforms();
  await sd.buildAllPlatforms();
  console.log('🎉 CSS token files generated:');
  console.log(
    Object.keys(sd.options.platforms)
      .map(p => `- ${p}`)
      .join('\n')
  );
}

build().catch(err => {
  console.error('❌ Build failed:', err);
  process.exit(1);
});

