import { defineConfig } from 'vite-plus';

export default defineConfig({
  staged: {
    '*': 'vp check --fix',
  },
  lint: {
    plugins: ['oxc', 'typescript', 'unicorn', 'react'],
    categories: {
      correctness: 'warn',
    },
    env: {
      builtin: true,
    },
    options: {
      typeAware: true,
      typeCheck: true,
    },
    jsPlugins: [
      {
        name: 'vite-plus',
        specifier: 'vite-plus/oxlint-plugin',
      },
    ],
    rules: {
      'vite-plus/prefer-vite-plus-imports': 'error',
    },
  },
  fmt: {
    printWidth: 88,
    singleQuote: true,
    trailingComma: 'es5',
    importOrder: [
      '.*styles.css$',
      '',
      'dayjs',
      '^react$',
      '^next$',
      '^next/.*$',
      '<BUILTIN_MODULES>',
      '<THIRD_PARTY_MODULES>',
      '^@mantine/(.*)$',
      '^@mantinex/(.*)$',
      '^@mantine-tests/(.*)$',
      '^@docs/(.*)$',
      '^@/.*$',
      '^../(?!.*.css$).*$',
      '^./(?!.*.css$).*$',
      '\\.css$',
    ],
    sortPackageJson: false,
    ignorePatterns: ['.next'],
    sortImports: {
      groups: [
        'type-import',
        ['value-builtin', 'value-external'],
        'type-internal',
        'value-internal',
        ['type-parent', 'type-sibling', 'type-index'],
        ['value-parent', 'value-sibling', 'value-index'],
        'unknown',
      ],
    },
  },
});
