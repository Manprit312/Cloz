module.exports = {
  source: ['tokens/design-tokens.json'],
  platforms: {
    css: {
      transformGroup: 'css',
      buildPath: 'src/theme/generated/',
      files: [
        {
          destination: 'tokens.css',
          format: 'css/variables',
          options: {
            outputReferences: true,
            selector: ':root',
          },
        },
      ],
    },
  },
};