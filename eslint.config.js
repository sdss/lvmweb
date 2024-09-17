const mantine = require('eslint-config-mantine');
const tseslint = require('typescript-eslint');

module.exports = tseslint.config(
  ...mantine,
  {
    languageOptions: {},
  },
  { ignores: ['**/*.{mjs,cjs,js,d.ts,d.mts}'] }
);
