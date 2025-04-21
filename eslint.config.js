module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  languageOptions: {
    globals: {
      // You can define any global variables here (if needed)
      // e.g., process: 'readonly',
    },
  },
  rules: {
    'no-console': 'warn',
    'no-debugger': 'warn',
  },
};
