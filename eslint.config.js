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

  // Ignore patterns
  {
    ignores: [
      'dist/**/*',
      'node_modules/**/*',
      'coverage/**/*',
      '*.log',
      '.omni/**/*',
      'demo.js',
      'eslint.config.js'
    ]
  },

  // Optional: Add specific overrides or additional settings in a separate object
  {
    // Define the parser for your TypeScript files
    languageOptions: {
      parser: tseslint.parser, // Use the TypeScript parser provided by typescript-eslint
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module',
        // Add project: ['tsconfig.json'] or similar if you need type-aware linting
      },
    },
    // Only apply TypeScript rules to TypeScript files
    files: ['**/*.ts', '**/*.tsx'],
    // Define custom rules or overrides
    rules: {
      'no-console': 'warn',
      'no-debugger': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-empty-function': 'warn',
    },
  },
  
  // Allow console statements in CLI and install files
  {
    files: ['src/cli.ts', 'src/bin/**/*.ts'],
    rules: {
      'no-console': 'off',
    },
  },
  
  // Separate configuration for JavaScript files
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'commonjs',
      globals: {
        'console': 'readonly',
        'require': 'readonly',
        'module': 'readonly',
        'exports': 'readonly',
        '__dirname': 'readonly',
        '__filename': 'readonly',
        'process': 'readonly',
        'Buffer': 'readonly',
        'global': 'readonly'
      }
    },
    rules: {
      'no-console': 'off',  // Allow console in demo files
      'no-undef': 'error',
    },
  },
];
