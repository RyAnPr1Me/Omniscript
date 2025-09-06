# VS Code Extension Installation Guide

## Installing the Omniscript VS Code Extension

### Method 1: Install from VSIX file (Recommended)

1. **Download the Extension**
   - The extension is packaged as `omniscript-vscode-1.0.0.vsix`
   - File size: ~14KB

2. **Install in VS Code**

   ```bash
   # Option A: Command line installation
   code --install-extension omniscript-vscode-1.0.0.vsix

   # Option B: Via VS Code UI
   # 1. Open VS Code
   # 2. Press Ctrl+Shift+P (Cmd+Shift+P on macOS)
   # 3. Type "Extensions: Install from VSIX..."
   # 4. Select the omniscript-vscode-1.0.0.vsix file
   ```

3. **Verify Installation**
   - Restart VS Code
   - Open a `.os` or `.omni` file
   - Check that syntax highlighting is working
   - Verify commands are available in Command Palette

### Method 2: Development Installation

For development or customization:

```bash
# Clone the repository
git clone https://github.com/RyAnPr1Me/Omniscript.git
cd Omniscript/vscode-extension

# Install dependencies
npm install

# Compile the extension
npm run compile

# Package the extension (optional)
npm run package

# Install for development
# Open VS Code, press F5 to launch Extension Development Host
```

## Prerequisites

### Required Software

1. **VS Code**: Version 1.74.0 or higher
2. **Node.js**: Version 16.0.0 or higher
3. **Omniscript CLI**: Required for compilation features

### Installing Omniscript CLI

The extension will prompt you to install the CLI if it's not found. You can install it using:

```bash
# Method 1: Via npm (recommended)
npm install -g omniscript

# Method 2: From source
git clone https://github.com/RyAnPr1Me/Omniscript.git
cd Omniscript
npm install
npm run build
npm link

# Method 3: Download binary
# Visit: https://github.com/RyAnPr1Me/Omniscript/releases
```

## Getting Started

### 1. Create Your First Omniscript File

```bash
# Create a new file with .os extension
touch hello.os
```

Add this content:

```omniscript
function main(): void {
    console.log("Hello, Omniscript!");
}

main();
```

### 2. Use Extension Features

- **Compile**: `Ctrl+Shift+B` or Right-click → "Compile Omniscript File"
- **Run**: `Ctrl+F5` or Right-click → "Run Omniscript File"
- **Debug**: `F5` or Right-click → "Debug Omniscript File"
- **Format**: Command Palette → "Omniscript: Format Document"

### 3. Configure Settings

Go to VS Code Settings (`Ctrl+,`) and search for "omniscript":

```json
{
  "omniscript.compiler.path": "/usr/local/bin/omni",
  "omniscript.compiler.outputDirectory": "dist",
  "omniscript.compiler.target": "ES2020",
  "omniscript.compiler.strictMode": true,
  "omniscript.format.enable": true,
  "omniscript.debug.enable": true,
  "omniscript.linting.enable": true
}
```

## Features Overview

### Language Support

- ✅ Syntax highlighting for `.os` and `.omni` files
- ✅ Error detection and type checking
- ✅ Code completion and IntelliSense
- ✅ Hover information for symbols
- ✅ Code formatting

### Build & Run

- ✅ Compile individual files or entire projects
- ✅ Run scripts directly from editor
- ✅ Debug with breakpoint support
- ✅ Integrated terminal output

### Project Management

- ✅ Create new Omniscript projects
- ✅ Multi-target compilation
- ✅ Configurable build settings
- ✅ Problem detection and reporting

## Troubleshooting

### Common Issues

**"Omniscript CLI not found"**

- Install the CLI: `npm install -g omniscript`
- Set custom path in settings: `omniscript.compiler.path`

**Syntax highlighting not working**

- Check file extension is `.os` or `.omni`
- Restart VS Code
- Reinstall extension

**Compilation errors**

- Verify Omniscript CLI is working: `omni --version`
- Check TypeScript compilation errors
- Ensure all dependencies are installed

**Commands not showing**

- Check if extension is enabled
- Look for errors in Output panel
- Try reloading window: `Ctrl+Shift+P` → "Developer: Reload Window"

### Getting Help

- **Documentation**: [Omniscript Repository](https://github.com/RyAnPr1Me/Omniscript)
- **Issues**: [Bug Reports](https://github.com/RyAnPr1Me/Omniscript/issues)
- **Discussions**: [Community Forum](https://github.com/RyAnPr1Me/Omniscript/discussions)

## Version History

### 1.0.0 (Current)

- Initial release
- Full language support
- Compilation and debugging
- Project scaffolding
- Comprehensive configuration options

---

**Need help?** Open an issue in the [Omniscript repository](https://github.com/RyAnPr1Me/Omniscript/issues) with the "vscode-extension" label.
