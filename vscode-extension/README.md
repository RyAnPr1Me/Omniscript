# Omniscript VS Code Extension

A comprehensive VS Code extension for the Omniscript programming language, providing compilation, syntax highlighting, debugging, and development tools.

## Features

### Language Support

- **Syntax Highlighting**: Full syntax highlighting for `.os` and `.omni` files
- **IntelliSense**: Code completion, hover information, and error detection
- **Code Formatting**: Automatic code formatting with customizable options
- **Error Detection**: Real-time error checking and type validation

### Compilation & Execution

- **File Compilation**: Compile individual Omniscript files (`Ctrl+Shift+B`)
- **Project Compilation**: Build entire Omniscript projects
- **Run Files**: Execute Omniscript files directly (`Ctrl+F5`)
- **Debug Support**: Integrated debugging with breakpoints (`F5`)

### Development Tools

- **Type Checking**: Static type analysis and validation
- **Project Creation**: Create new Omniscript projects with scaffolding
- **CLI Integration**: Seamless integration with Omniscript CLI tools
- **Multiple Installation Options**: npm, source, or binary installation

### Advanced Features

- **Configurable Compiler**: Customizable compilation settings
- **Output Directory Control**: Specify build output locations
- **Target Selection**: Choose JavaScript target versions (ES5-ES2022)
- **Strict Mode**: Enable/disable strict type checking
- **Real-time Diagnostics**: Live error reporting and suggestions

## Installation

1. Install the extension from VS Code Marketplace
2. Install Omniscript CLI using one of these methods:
   - **Via npm**: `npm install -g omniscript`
   - **From source**: Clone and build the Omniscript repository
   - **Binary download**: Download pre-built binaries

## Usage

### Compiling Files

- Right-click on `.os` or `.omni` files and select "Compile Omniscript File"
- Use keyboard shortcut `Ctrl+Shift+B` in an open Omniscript file
- Use Command Palette: `Omniscript: Compile Omniscript File`

### Running Code

- Right-click and select "Run Omniscript File"
- Use keyboard shortcut `Ctrl+F5`
- Use Command Palette: `Omniscript: Run Omniscript File`

### Debugging

- Set breakpoints by clicking in the gutter
- Press `F5` to start debugging
- Use Command Palette: `Omniscript: Debug Omniscript File`

### Creating New Projects

- Use Command Palette: `Omniscript: Create New Omniscript Project`
- Follow the prompts to select location and project name
- Extension will automatically scaffold a new project

## Configuration

Configure the extension through VS Code settings:

```json
{
  "omniscript.compiler.path": "",
  "omniscript.compiler.outputDirectory": "dist",
  "omniscript.compiler.target": "ES2020",
  "omniscript.compiler.strictMode": true,
  "omniscript.format.enable": true,
  "omniscript.debug.enable": true,
  "omniscript.linting.enable": true
}
```

### Settings Reference

| Setting                               | Type    | Default    | Description                         |
| ------------------------------------- | ------- | ---------- | ----------------------------------- |
| `omniscript.compiler.path`            | string  | `""`       | Custom path to Omniscript compiler  |
| `omniscript.compiler.outputDirectory` | string  | `"dist"`   | Output directory for compiled files |
| `omniscript.compiler.target`          | string  | `"ES2020"` | JavaScript target version           |
| `omniscript.compiler.strictMode`      | boolean | `true`     | Enable strict type checking         |
| `omniscript.format.enable`            | boolean | `true`     | Enable automatic formatting         |
| `omniscript.debug.enable`             | boolean | `true`     | Enable debugging support            |
| `omniscript.linting.enable`           | boolean | `true`     | Enable error checking               |

## Commands

| Command                                     | Keyboard Shortcut | Description                    |
| ------------------------------------------- | ----------------- | ------------------------------ |
| `Omniscript: Compile Omniscript File`       | `Ctrl+Shift+B`    | Compile current file           |
| `Omniscript: Compile Omniscript Project`    | -                 | Build entire project           |
| `Omniscript: Run Omniscript File`           | `Ctrl+F5`         | Execute current file           |
| `Omniscript: Debug Omniscript File`         | `F5`              | Debug current file             |
| `Omniscript: Check Types`                   | -                 | Validate types in current file |
| `Omniscript: Format Document`               | -                 | Format current document        |
| `Omniscript: Create New Omniscript Project` | -                 | Create new project             |
| `Omniscript: Install Omniscript CLI`        | -                 | Install CLI tools              |

## File Associations

The extension automatically recognizes:

- `.os` files as Omniscript source files
- `.omni` files as Omniscript module files

## Requirements

- **VS Code**: Version 1.74.0 or higher
- **Node.js**: Version 16.0.0 or higher
- **Omniscript CLI**: Latest version (automatically prompted for installation)

## Troubleshooting

### Common Issues

**Q: "Omniscript CLI not found" error**
A: Install the Omniscript CLI using the extension's install command or manually via npm:

```bash
npm install -g omniscript
```

**Q: Compilation fails with type errors**
A: Ensure you have the latest version of Omniscript CLI and check your tsconfig.json settings.

**Q: Syntax highlighting not working**
A: Verify your file has the correct extension (`.os` or `.omni`) and restart VS Code if necessary.

**Q: Debugging not working**
A: Make sure debugging is enabled in settings and you have breakpoints set properly.

### Getting Help

- [Omniscript Repository](https://github.com/RyAnPr1Me/Omniscript)
- [Issue Tracker](https://github.com/RyAnPr1Me/Omniscript/issues)
- [Documentation](https://github.com/RyAnPr1Me/Omniscript#readme)

## Contributing

Contributions are welcome! Please see the [Contributing Guide](https://github.com/RyAnPr1Me/Omniscript/blob/main/CONTRIBUTING.md) for details.

## License

This extension is licensed under the [MIT License](https://github.com/RyAnPr1Me/Omniscript/blob/main/LICENSE).

## Changelog

### 1.0.0

- Initial release
- Full Omniscript language support
- Compilation and execution features
- Debugging support
- Project scaffolding
- Comprehensive configuration options
