module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    sourceType: 'module',
  },
  plugins: ['switch-case'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:node/recommended',
    'plugin:unicorn/recommended',
    'plugin:array-func/all',
    'plugin:eslint-comments/recommended',
    'plugin:optimize-regex/recommended',
    'plugin:switch-case/recommended',
    'plugin:security/recommended',
    'prettier',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js', 'dist/**', 'coverage/**'],
  rules: {
    'unicorn/prevent-abbreviations': ['error', { checkFilenames: false }],
    'unicorn/prefer-module': 'off',
    'node/no-unsupported-features/es-syntax': [
      'error',
      {
        ignores: ['modules'],
      },
    ],
    // does not support alias paths
    'node/no-missing-import': 'off',
  },
  overrides: [
    {
      files: ['**/*.spec.ts', '**/*.e2e-spec.ts'],
      extends: [
        'plugin:jest/recommended',
        'plugin:jest/style',
        'plugin:jest-formatting/strict',
      ],
    },
  ],
  settings: {
    node: {
      tryExtensions: ['.js', '.json', '.ts'],
      allowModules: ['supertest', '@nestjs/testing', 'ts-jest'],
    },
  },
};
