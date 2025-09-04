# Contributing to Omniscript

Thank you for considering contributing to Omniscript! We welcome contributions from the community.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/Omniscript.git`
3. Install dependencies: `npm install`
4. Build the project: `npm run build`
5. Run tests: `npm test`

## Development Workflow

### Setting Up Your Development Environment

```bash
# Clone the repository
git clone https://github.com/RyAnPr1Me/Omniscript.git
cd Omniscript

# Install dependencies
npm install

# Build the project
npm run build

# Link the CLI globally for testing
npm link

# Run tests
npm test
```

### Making Changes

1. Create a new branch for your feature: `git checkout -b feature/your-feature-name`
2. Make your changes
3. Add tests for new functionality
4. Ensure all tests pass: `npm test`
5. Lint your code: `npm run lint`
6. Format your code: `npm run format`
7. Commit your changes with a descriptive message
8. Push to your fork and create a pull request

## Code Style

We use ESLint and Prettier for code formatting. Please ensure your code follows these standards:

- Run `npm run lint` to check for linting issues
- Run `npm run format` to automatically format your code
- Follow TypeScript best practices
- Add JSDoc comments for public APIs

## Testing

- Write tests for new features and bug fixes
- Ensure all existing tests continue to pass
- We aim for high test coverage
- Tests are located in the `tests/` directory

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage
```

## Project Structure

```
omniscript/
├── src/                 # Source code
├── tests/              # Test files
├── docs/               # Documentation
├── examples/           # Example code
├── demos/              # Demo applications
├── benchmarks/         # Performance benchmarks
└── dist/               # Built output (generated)
```

## Documentation

- Update documentation for any API changes
- Add examples for new features
- Documentation is written in Markdown
- API documentation is generated automatically

## Pull Request Process

1. Ensure your PR has a clear description of what it does
2. Include tests for new functionality
3. Update documentation as needed
4. Ensure CI passes
5. Request review from maintainers

## Reporting Issues

When reporting issues, please include:

- Omniscript version
- Operating system and version
- Node.js version
- Clear reproduction steps
- Expected vs actual behavior
- Any relevant error messages

## Feature Requests

We welcome feature requests! Please:

- Check if the feature already exists or is planned
- Describe the use case
- Provide examples of how it would be used
- Consider implementation approaches

## Code of Conduct

Please be respectful and professional in all interactions. We aim to create a welcoming environment for all contributors.

## License

By contributing to Omniscript, you agree that your contributions will be licensed under the MIT License.
