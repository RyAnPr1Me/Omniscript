// eslint.config.js
const js = require("@eslint/js"); // ESLint's core recommended rules
const tseslint = require("typescript-eslint"); // Recommended rules for TypeScript
const prettierConfig = require("eslint-config-prettier"); // Disables rules conflicting with Prettier

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
      "dist/**/*",
      "node_modules/**/*",
      "coverage/**/*",
      "*.log",
      ".omni/**/*",
      "demo.js",
      "eslint.config.js",
      "bin/cli.js", // Ignore CLI wrapper script
    ],
  },

  // Base TypeScript configuration
  {
    // Define the parser for your TypeScript files
    languageOptions: {
      parser: tseslint.parser, // Use the TypeScript parser provided by typescript-eslint
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: "module",
        // Add project: ['tsconfig.json'] or similar if you need type-aware linting
      },
    },
    // Only apply TypeScript rules to TypeScript files
    files: ["**/*.ts", "**/*.tsx"],
    // Define custom rules or overrides
    rules: {
      "no-console": "warn",
      "no-debugger": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-empty-function": "warn",
    },
  },

  // More relaxed rules for benchmarks, demos, examples, and tests
  {
    files: [
      "benchmarks/**/*.ts",
      "demos/**/*.ts",
      "examples/**/*.ts",
      "tests/**/*.ts",
    ],
    rules: {
      "no-console": "off", // Allow console statements in benchmarks, demos, examples, and tests
      "@typescript-eslint/no-explicit-any": "off", // Allow any type in test files for flexibility
      "@typescript-eslint/no-unused-vars": "off", // Allow unused vars in test files
    },
  },

  // CLI and installation scripts should allow console output
  {
    files: ["src/cli.ts", "src/bin/**/*.ts"],
    rules: {
      "no-console": "off", // CLI tools need console output
    },
  },

  // Separate configuration for JavaScript files
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "commonjs",
      globals: {
        console: "readonly",
        require: "readonly",
        module: "readonly",
        exports: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        process: "readonly",
        Buffer: "readonly",
        global: "readonly",
      },
    },
    rules: {
      "no-console": "off", // Allow console in demo files
      "no-undef": "error",
    },
  },
];
