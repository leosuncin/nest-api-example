import auto from 'eslint-config-canonical/configurations/auto.js';
import pluginSecurity from 'eslint-plugin-security';

export default [
  {
    ignores: [
      '.git/',
      'coverage/',
      'dist/',
      'node_modules/',
      'megalinter-reports/',
      'pnpm-lock.yaml',
      'package.json',
    ],
  },
  ...auto,
  pluginSecurity.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-extraneous-class': 'off',
      'func-style': 'off',
      'jsonc/array-bracket-newline': 'off',
      'jsonc/array-element-newline': 'off',
    },
  },
];
