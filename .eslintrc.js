module.exports = {
  root: true,
  extends: '@react-native',
  rules: {
    'react-hooks/exhaustive-deps': 'error',
    'no-console': 'error',
    // Features talk to each other through their public API only.
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['@/features/*/*'],
            message: 'Import other features through their public API: @/features/<name>.',
          },
        ],
      },
    ],
  },
  overrides: [
    {
      // TypeScript-only rules (they need the TypeScript parser, so not for .js files).
      files: ['*.ts', '*.tsx'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'error',
        '@typescript-eslint/consistent-type-imports': [
          'error',
          { fixStyle: 'inline-type-imports' },
        ],
      },
    },
    {
      // Tests and fixtures may reach across layers to build fakes.
      files: ['**/__tests__/**', '**/testing/**'],
      rules: { 'no-restricted-imports': 'off' },
    },
    {
      files: ['*.js'],
      env: { node: true },
      rules: { 'no-console': 'off' },
    },
  ],
};
