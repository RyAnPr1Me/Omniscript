# Omniscript Programming Language

Omniscript is a modern programming language designed for full-stack web development with TypeScript foundations. It features type safety, memory management, async/await, pattern matching, and a comprehensive standard library.

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

## Working Effectively

### Bootstrap and Setup
- Clone and setup the repository:
  - `git clone https://github.com/RyAnPr1Me/Omniscript.git`
  - `cd Omniscript`
  - `npm install` -- takes 4-30 seconds. NEVER CANCEL. Set timeout to 60+ seconds.
- Build the project:
  - `npm run build` -- takes 3 seconds. Compiles TypeScript to dist/ folder.
  - `npm link` -- links the CLI globally so `omni` command is available
- Run tests:
  - `npm test -- --config jest.config.js` -- takes 8-9 seconds for 216 tests. NEVER CANCEL. Set timeout to 30+ seconds.
  - **CRITICAL**: Must use `--config jest.config.js` due to conflicting Jest configurations
- Build standalone executables:
  - `npm run build:exe` -- takes 11-13 seconds. NEVER CANCEL. Creates executables for Windows/Linux/macOS in dist/bin/

### Validation Scenarios
- ALWAYS test the complete CLI workflow after making changes:
  1. `omni --help` -- verify CLI is functional
  2. `cd /tmp && omni new testproject` -- create a test project  
  3. `cd testproject && omni run src/main.omni` -- verify project can run (should output: `[Function: Klass] { __metadata: {} }`)
  4. Test REPL: `omni repl` then type `2 + 2` (should return `4`) then Ctrl+C to exit
  5. Test package management: `omni add stdlib/http` (should show success message)
  6. Test eval: `omni eval "5 * 3"` (should return `15`)
  7. Test development server: `omni dev` (should start server on port 3000, Ctrl+C to stop)
  8. Test simple language features: `omni eval "let x = 5; x + 10"` (should return `15`)
- ALWAYS run through at least one complete end-to-end scenario after making changes
- ALWAYS verify that `omni` command works globally after building
- **Note**: Complex pattern matching may require exhaustive cases; use simple expressions for validation

### Code Quality
- Always run linting before committing (note: currently has many warnings):
  - `npm run lint` -- takes 3 seconds but currently shows warnings/errors
  - Known issue: demo.js and test files have linting warnings, focus on src/ directory
- Format code: `npm run format`
- **CRITICAL**: Always use `npm test -- --config jest.config.js` for testing due to Jest configuration conflicts

## Common Development Tasks

### Project Structure
```
omniscript/
├── src/                    # Main TypeScript source code
│   ├── cli.ts             # Command-line interface entry point
│   ├── index.ts           # Main Omniscript engine
│   ├── compiler/          # Language compiler
│   ├── parser/            # Language parser
│   ├── runtime/           # Runtime system with memory management
│   └── stdlib/            # Standard library modules
├── tests/                 # Comprehensive test suite (216 tests)
├── docs/                  # Language documentation
├── examples/              # Sample Omniscript programs
├── dist/                  # Compiled JavaScript output
└── package.json           # Dependencies and npm scripts
```

### CLI Commands Reference
- `omni --help` -- Show all available commands and options
- `omni new <name>` -- Create new Omniscript project with sample files
- `omni run <file>` -- Execute Omniscript file (.omni extension)
- `omni eval "<code>"` -- Evaluate inline Omniscript expression
- `omni repl` -- Start interactive REPL (exit with Ctrl+C, not .exit)
- `omni build` -- Build project for production
- `omni dev` -- Start development server with watch mode on port 3000
- `omni test` -- Run Jest tests (use --config jest.config.js)
- `omni add <package>` -- Add package or enable stdlib module (e.g., `omni add stdlib/http`)
- `omni enable <module>` -- Enable standard library module (e.g., `omni enable stdlib/http`)
- `omni install` -- Install project dependencies

### Making Changes
- Always build and test after changes: `npm run build && npm test -- --config jest.config.js`
- Test CLI functionality: Create a test project and run it to verify changes work
- Key files to understand:
  - `src/index.ts` -- Main Omniscript execution engine
  - `src/cli.ts` -- Command-line interface logic
  - `src/compiler/` -- Language compilation logic
  - `src/runtime/` -- Memory management and execution runtime
  - `tests/integration/` -- End-to-end test scenarios

### Standard Library Development
- Modules located in `src/stdlib/`
- Test new stdlib features in `tests/stdlib/`
- Enable modules with: `omni enable stdlib/<module-name>`
- Available modules: http, database, math, collections, crypto, reactive

## Troubleshooting

### Known Issues
- **Jest Configuration**: Must use `npm test -- --config jest.config.js` due to conflicting config files
- **REPL Exit**: Use Ctrl+C to exit REPL, `.exit` command doesn't work properly
- **Linting Warnings**: Current codebase has many linting warnings in demo.js and test files
- **Global CLI**: If `omni` command not found after `npm link`, ensure npm global bin is in PATH: `export PATH="$(npm bin -g):$PATH"`

### Build Failures
- TypeScript compilation errors: Check `tsconfig.json` and fix type issues in src/
- Missing dependencies: Run `npm install` to ensure all packages are installed
- Permission errors: Ensure executable permissions with `chmod +x dist/cli.js`

### Test Failures
- Always use the correct Jest config: `npm test -- --config jest.config.js`
- Test timeout: Increase Jest timeout for longer-running tests
- Integration test failures: Verify CLI is built and linked properly

## Development Workflows

### Adding New Language Features
1. Update parser grammar in `src/parser/`
2. Add compiler support in `src/compiler/`
3. Update runtime if needed in `src/runtime/`
4. Add comprehensive tests in `tests/`
5. Update documentation in `docs/`
6. Test with CLI: `omni run examples/new-feature.omni`

### Adding Standard Library Modules
1. Create module in `src/stdlib/`
2. Export from `src/stdlib/index.ts`
3. Add tests in `tests/stdlib/`
4. Update CLI to recognize module in package manager
5. Test: `omni enable stdlib/new-module`

### Performance Optimization
- Memory management features in `src/runtime/`
- Profile with: `runtime.enableMemoryManagement()`
- Test memory scenarios in `tests/runtime/memory-management.test.ts`

## Key Timing Expectations
- **npm install**: 4-30 seconds -- NEVER CANCEL. Set timeout to 60+ seconds.
- **npm run build**: 3 seconds -- Very fast TypeScript compilation
- **npm test**: 8-9 seconds for full suite (216 tests) -- NEVER CANCEL. Set timeout to 30+ seconds.
- **npm run build:exe**: 11-13 seconds -- NEVER CANCEL. Downloads Node.js binaries first time.
- **npm run lint**: 3 seconds -- Currently shows many warnings in demo.js and test files
- **npm run format**: 2-3 seconds -- Prettier formatting across all files

## CI/CD Integration
- GitHub Actions workflow: `.github/workflows/ci.yml`
- Runs lint, build, test on every PR
- Automatic status reporting to README
- Must pass all checks before merging

## Examples and Documentation
- Language guide: `docs/guide.md`
- Best practices: `docs/best-practices.md`
- API reference: `docs/api/README.md`
- Sample programs: `examples/` directory
- Integration tests show real-world usage patterns in `tests/integration/`