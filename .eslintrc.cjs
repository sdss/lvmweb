module.exports = {
  extends: [
    'next/core-web-vitals',
    'prettier',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  root: true,
  rules: {
    'max-len': [
      'error',
      { code: 88, ignorePattern: '^import\\s.+\\sfrom\\s.+;$', ignoreUrls: true },
    ],
  },
};
