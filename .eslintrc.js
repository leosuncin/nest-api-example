module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    sourceType: 'module',
  },
  plugins: ['switch-case', 'simple-import-sort'],
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
    'plugin:import/recommended',
    'plugin:import/typescript',
    'prettier',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js', 'dist/**', 'coverage/**', 'report/**'],
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
    'node/no-unpublished-import': 'off',
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',
    'import/first': 'error',
    'import/newline-after-import': 'error',
    'import/no-duplicates': 'error',
  },
  overrides: [
    {
      files: ['**/*.spec.ts', '**/*.e2e-spec.ts'],
      extends: [
        'plugin:jest/recommended',
        'plugin:jest/style',
        'plugin:jest-formatting/strict',
      ],
      rules: {
        'jest/expect-expect': [
          'warn',
          {
            assertFunctionNames: [
              'expect',
              'request.**.expect',
              '**.expect\\w+',
            ],
          },
        ],
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/unbound-method': 'off',
        'jest/unbound-method': 'error',
      },
    },
  ],
  settings: {
    node: {
      tryExtensions: ['.js', '.json', '.ts'],
    },
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts'],
    },
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
      },
    },
  },
};
