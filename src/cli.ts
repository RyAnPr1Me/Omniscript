#!/usr/bin/env node
/// <reference types="node" />
import { Command } from 'commander';
import { readFile } from 'node:fs/promises';
import { Interface as ReadlineInterface, createInterface } from 'node:readline';
import { Omniscript } from './index';
import { enableDebugger, enableComponentDebug, DebugLevel } from './debug';

const program = new Command();
const omniscript = new Omniscript();

function startRepl(engine: Omniscript) {
  const rl: ReadlineInterface = createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'omni> '
  });

  rl.prompt();

  rl.on('line', async (line: string) => {
    try {
      const result = await engine.execute(line);
      console.log(result);
    } catch (error) {
      console.error('Error:', error);
    }
    rl.prompt();
  });

  rl.on('close', () => {
    process.exit(0);
  });
}

program
  .name('omni')
  .description('Omniscript CLI')
  .version('0.1.0');

program
  .command('run')
  .description('Run an Omniscript file')
  .argument('<file>', 'Path to Omniscript file')
  .action(async (file: string) => {
    try {
      const source = await readFile(file, 'utf-8');
      const result = await omniscript.execute(source);
      if (result !== undefined) {
        console.log(result);
      }
    } catch (error) {
      console.error('Error:', error);
      process.exit(1);
    }
  });

program
  .command('eval')
  .description('Evaluate inline Omniscript/functional code snippet')
  .argument('<code...>', 'Code to execute (wrap in quotes)')
  .action(async (codeParts: string[]) => {
    const code = codeParts.join(' ');
    try {
      const result = await omniscript.execute(code);
      if (result !== undefined) console.log(result);
    } catch (error) {
      console.error('Error:', error);
      process.exit(1);
    }
  });

program
  .command('repl')
  .description('Start Omniscript REPL')
  .action(() => {
    startRepl(omniscript);
  });

program
  .command('debug')
  .description('Debug commands')
  .argument('<action>', 'Debug action: enable, disable, level, component')
  .argument('[value]', 'Value for the action')
  .action((action: string, value?: string) => {
    switch (action) {
      case 'enable':
        enableDebugger();
        console.log('Debug mode enabled for all components');
        break;
      case 'level':
        if (value) {
          const level = parseInt(value) as DebugLevel;
          enableComponentDebug('*', level);
          console.log(`Debug level set to ${level}`);
        } else {
          console.log('Please specify a debug level (0-4)');
        }
        break;
      case 'component':
        if (value) {
          enableComponentDebug(value);
          console.log(`Debug enabled for component: ${value}`);
        } else {
          console.log('Please specify a component name');
        }
        break;
      default:
        console.log('Available debug actions: enable, level <0-4>, component <name>');
    }
  });

program
  .command('new')
  .description('Create a new Omniscript project')
  .argument('<name>', 'Project name')
  .action(async (name: string) => {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const projectDir = path.join(process.cwd(), name);
    
    try {
      // Create project directory
      await fs.mkdir(projectDir, { recursive: true });
      
      // Create basic project structure
      await fs.mkdir(path.join(projectDir, 'src'));
      await fs.mkdir(path.join(projectDir, 'docs'));
      
      // Create main.omni file
      const mainContent = `// Welcome to Omniscript!
// This is your main application file.

@component
class App {
  constructor() {
    this.message = "Hello, Omniscript!";
  }
  
  render() {
    console.log(this.message + " - Built with Omniscript");
  }
}
`;
      await fs.writeFile(path.join(projectDir, 'src', 'main.omni'), mainContent);
      
      // Create package.json
      const packageJson = {
        name,
        version: "1.0.0",
        description: "An Omniscript application",
        main: "src/main.omni",
        scripts: {
          "dev": "omni dev",
          "build": "omni build",
          "start": "omni run src/main.omni"
        },
        omniscript: {
          stdlib: ["http", "collections"],
          plugins: []
        }
      };
      await fs.writeFile(path.join(projectDir, 'package.json'), JSON.stringify(packageJson, null, 2));
      
      // Create README
      const readmeContent = `# ${name}

An Omniscript application.

## Getting Started

\`\`\`bash
cd ${name}
omni dev
\`\`\`

## Available Commands

- \`omni dev\` - Start development server
- \`omni build\` - Build for production  
- \`omni run src/main.omni\` - Run the application
`;
      await fs.writeFile(path.join(projectDir, 'README.md'), readmeContent);
      
      console.log(`✅ Created project '${name}' successfully!`);
      console.log(`\nNext steps:`);
      console.log(`  cd ${name}`);
      console.log(`  omni dev`);
      
    } catch (error) {
      console.error(`❌ Failed to create project: ${error}`);
    }
  });

program
  .command('dev')
  .description('Start development server with watch mode')
  .option('-p, --port <port>', 'Port to run on', '3000')
  .action(async (options: { port: string }) => {
    console.log(`🚀 Starting Omniscript development server on port ${options.port}...`);
    console.log('📁 Watching for file changes...');
    
    // Basic file watching and execution
    const fs = await import('fs');
    
    const watchFile = 'src/main.omni';
    
    if (fs.existsSync(watchFile)) {
      console.log(`👀 Watching ${watchFile}`);
      
      // Initial run
      try {
        const source = await fs.promises.readFile(watchFile, 'utf-8');
        console.log('\n📄 Running initial build...');
        const result = await omniscript.execute(source);
        if (result !== undefined) {
          console.log('✅ Output:', result);
        }
      } catch (error) {
        console.error('❌ Error:', error);
      }
      
      // Watch for changes
      fs.watchFile(watchFile, async () => {
        console.log('\n🔄 File changed, reloading...');
        try {
          const source = await fs.promises.readFile(watchFile, 'utf-8');
          const result = await omniscript.execute(source);
          if (result !== undefined) {
            console.log('✅ Output:', result);
          }
        } catch (error) {
          console.error('❌ Error:', error);
        }
      });
      
      // Keep process alive
      console.log('\n⏸️  Press Ctrl+C to stop');
      process.on('SIGINT', () => {
        console.log('\n👋 Development server stopped');
        process.exit(0);
      });
      
      // Keep the process running
      await new Promise(() => {
        // Intentionally empty - keeps process alive
      });
      
    } else {
      console.error(`❌ Could not find ${watchFile}. Make sure you're in an Omniscript project directory.`);
      console.log('\nTo create a new project, run: omni new <project-name>');
    }
  });

program
  .command('add')
  .description('Add a package or enable stdlib module')
  .argument('<package>', 'Package name or stdlib module (e.g., stdlib/http)')
  .action(async (packageName: string) => {
    const { PackageManager } = await import('./package-manager');
    const pm = new PackageManager();
    
    try {
      await pm.loadConfig();
      
      if (packageName.startsWith('stdlib/')) {
        const module = packageName.replace('stdlib/', '');
        await pm.enableStdLib(module);
        console.log(`✅ Enabled stdlib module: ${module}`);
      } else {
        // For now, just add to dependencies with latest version
        await pm.installDependency(packageName, 'latest');
        console.log(`✅ Added package: ${packageName}`);
      }
      
      console.log('📦 Package configuration updated');
    } catch (error) {
      console.error(`❌ Failed to add package: ${error}`);
    }
  });

program
  .command('build')
  .description('Build project for production')
  .option('-o, --output <dir>', 'Output directory', 'dist')
  .option('--target <target>', 'Build target (node, browser)', 'node')
  .action(async (options: { output: string, target: string }) => {
    console.log(`🔨 Building project for ${options.target}...`);
    
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      
      // Create output directory
      await fs.mkdir(options.output, { recursive: true });
      
      // Find and compile Omniscript files
      const mainFile = 'src/main.omni';
      if (await fs.access(mainFile).then(() => true).catch(() => false)) {
        console.log(`📄 Compiling ${mainFile}...`);
        
        const source = await fs.readFile(mainFile, 'utf-8');
        const ast = omniscript['parser'].parse(source);
        const bytecode = omniscript['compiler'].compile(ast);
        
        // Save compiled output
        const outputFile = path.join(options.output, 'main.js');
        const jsOutput = `// Compiled Omniscript\nmodule.exports = ${JSON.stringify(bytecode, null, 2)};`;
        await fs.writeFile(outputFile, jsOutput);
        
        console.log(`✅ Build complete! Output saved to ${outputFile}`);
      } else {
        console.error(`❌ Could not find ${mainFile}. Make sure you're in an Omniscript project directory.`);
      }
      
    } catch (error) {
      console.error(`❌ Build failed: ${error}`);
      process.exit(1);
    }
  });

program
  .command('test')
  .description('Run tests using Jest')
  .option('--watch', 'Run in watch mode')
  .option('--coverage', 'Run with coverage report')
  .action(async (options: { watch?: boolean, coverage?: boolean }) => {
    console.log('🧪 Running tests...');
    
    try {
      const { spawn } = await import('child_process');
      
      const jestArgs = ['--config', 'jest.config.ts'];
      
      if (options.watch) {
        jestArgs.push('--watch');
      }
      
      if (options.coverage) {
        jestArgs.push('--coverage');
      }
      
      const jestProcess = spawn('npx', ['jest', ...jestArgs], {
        stdio: 'inherit',
        shell: true
      });
      
      jestProcess.on('close', (code) => {
        if (code === 0) {
          console.log('✅ All tests passed!');
        } else {
          console.log(`❌ Tests failed with exit code ${code}`);
          process.exit(code || 1);
        }
      });
      
    } catch (error) {
      console.error(`❌ Failed to run tests: ${error}`);
      process.exit(1);
    }
  });

program
  .command('install')
  .description('Install project dependencies')
  .action(async () => {
    console.log('📦 Installing dependencies...');
    
    try {
      const { spawn } = await import('child_process');
      
      const npmProcess = spawn('npm', ['install'], {
        stdio: 'inherit',
        shell: true
      });
      
      npmProcess.on('close', (code) => {
        if (code === 0) {
          console.log('✅ Dependencies installed successfully!');
        } else {
          console.log(`❌ Installation failed with exit code ${code}`);
          process.exit(code || 1);
        }
      });
      
    } catch (error) {
      console.error(`❌ Failed to install dependencies: ${error}`);
      process.exit(1);
    }
  });

program
  .command('enable')
  .description('Enable a standard library module')
  .argument('<module>', 'Module name (e.g., http, database, crypto)')
  .action(async (moduleName: string) => {
    const { PackageManager } = await import('./package-manager');
    const pm = new PackageManager();
    
    try {
      await pm.loadConfig();
      await pm.enableStdLib(moduleName);
      console.log(`✅ Enabled stdlib module: ${moduleName}`);
      console.log('📦 Package configuration updated');
    } catch (error) {
      console.error(`❌ Failed to enable module: ${error}`);
    }
  });

program.parse();
