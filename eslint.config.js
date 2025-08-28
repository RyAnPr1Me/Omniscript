// eslint.config.js
const js = require('@eslint/js'); // ESLint's core recommended rules
const tseslint = require('typescript-eslint'); // Recommended rules for TypeScript
const prettierConfig = require('eslint-config-prettier'); // Disables rules conflicting with Prettier

module.exports = [
  // Apply ESLint's recommended rules
  js.configs.recommended,

  // Apply TypeScript recommended rules from typescript-eslint.
  // `tseslint.configs.recommended` is itself an array, so we spread it.
  ...tseslint.configs.recommended,

  // Disable rules that conflict with Prettier
  prettierConfig,

  // Optional: Add specific overrides or additional settings in a separate object
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js'],
    ignores: [
      'demo.js',
      'dist/**/*',
      'node_modules/**/*',
      '**/*.d.ts',
    ],
    // Define the parser for your TypeScript files
    languageOptions: {
      parser: tseslint.parser, // Use the TypeScript parser provided by typescript-eslint
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module',
        // Add project: ['tsconfig.json'] or similar if you need type-aware linting
      },
    },
    // Define custom rules or overrides
    rules: {
      'no-console': 'warn',
      'no-debugger': 'warn',
      '@typescript-eslint/no-explicit-any': 'off', // Allow 'any' type for flexibility during development
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-require-imports': 'off', // Allow require for demo files
      'no-undef': 'off', // TypeScript handles this better
      // Add any other custom rules here
    },
  },
];
