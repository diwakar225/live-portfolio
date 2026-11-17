module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    // Zod 4's ESM build uses `export * as ns from`, which Metro's preset doesn't transform.
    '@babel/plugin-transform-export-namespace-from',
    [
      'module-resolver',
      {
        root: ['./'],
        alias: { '@': './src' },
        extensions: [
          '.ios.ts',
          '.android.ts',
          '.ts',
          '.ios.tsx',
          '.android.tsx',
          '.tsx',
          '.js',
          '.json',
        ],
      },
    ],
  ],
};
