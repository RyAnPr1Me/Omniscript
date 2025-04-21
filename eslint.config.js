const eslintRecommended = require('eslint/conf/eslint-recommended');
const tsRecommended = require('@typescript-eslint/eslint-plugin').configs.recommended;
const prettierRecommended = require('eslint-config-prettier');

module.exports = [
  {
    // ESLint recommended rules
    ...eslintRecommended,
    // TypeScript recommended rules
    ...tsRecommended,
    // Prettier rules to avoid conflicts
    ...prettierRecommended,
    parser: '@typescript-eslint/parser',
    parserOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
    },
    plugins: ['@typescript-eslint'],
    languageOptions: {
      globals: {
        // Define global variables here if needed, e.g., process: 'readonly'
      },
    },
    rules: {
      'no-console': 'warn',
      'no-debugger': 'warn',
    },
  },
];

