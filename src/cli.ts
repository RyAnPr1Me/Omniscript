#!/usr/bin/env node
/// <reference types="node" />
import { Command } from 'commander';
import { readFile } from 'node:fs/promises';
import { Interface as ReadlineInterface, createInterface } from 'node:readline';
import { Omniscript } from './index';
import { enableDebugger, enableComponentDebug, DebugLevel } from './debug';

const program = new Command();
let omniscript: Omniscript;

function getOmniscript(options?: any): Omniscript {
  if (!omniscript) {
    omniscript = new Omniscript(options);
  }
  return omniscript;
}

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
  .version('2.0.0', '-v, --version', 'output the version number');

program
  .command('run')
  .description('Run an Omniscript file')
  .argument('<file>', 'Path to Omniscript file')
  .option('-f, --fast', 'Enable fast compilation mode (skip type checking, use AOT)')
  .option('--no-cache', 'Disable compilation caching')
  .action(async (file: string, options: any) => {
    try {
      // Get omniscript instance with performance options
      const omniscriptOptions = {
        fastMode: options.fast || false,
        compiler: {
          enableCaching: options.noCache !== true
        }
      };
      
      const omniscriptInstance = getOmniscript(omniscriptOptions);
      
      const source = await readFile(file, 'utf-8');
      const result = await omniscriptInstance.execute(source);
      if (result !== undefined) {
        console.log(result);
      }
      
      // Force process exit to prevent hanging
      process.exit(0);
    } catch (error) {
      console.error('Error:', error);
      process.exit(1);
    }
  });

program
  .command('eval')
  .description('Evaluate inline Omniscript/functional code snippet')
  .argument('<code...>', 'Code to execute (wrap in quotes)')
  .option('-f, --fast', 'Enable fast compilation mode')
  .action(async (codeParts: string[], options: any) => {
    const code = codeParts.join(' ');
    try {
      // Get omniscript instance with fast mode if requested
      const omniscriptOptions = options.fast ? { fastMode: true } : {};
      const omniscriptInstance = getOmniscript(omniscriptOptions);
      
      const result = await omniscriptInstance.execute(code);
      if (result !== undefined) console.log(result);
      
      // Force process exit to prevent hanging
      process.exit(0);
    } catch (error) {
      console.error('Error:', error);
      process.exit(1);
    }
  });

program
  .command('repl')
  .description('Start Omniscript REPL')
  .action(() => {
    startRepl(getOmniscript());
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
    const path = await import('path');
    
    const watchFile = 'src/main.omni';
    
    if (fs.existsSync(watchFile)) {
      console.log(`👀 Watching ${watchFile}`);
      
      // Initial run
      try {
        const source = await fs.promises.readFile(watchFile, 'utf-8');
        console.log('\n📄 Running initial build...');
        const result = await getOmniscript().execute(source);
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
          const result = await getOmniscript().execute(source);
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
      await new Promise(() => {});
      
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

program
  .command('fuzz')
  .description('Run fuzzing tests for parser and runtime safety')
  .option('-i, --iterations <number>', 'Number of test iterations', '1000')
  .option('-t, --timeout <ms>', 'Timeout per test in milliseconds', '5000')
  .option('--no-unicode', 'Disable unicode character generation')
  .option('--control-chars', 'Include control characters in fuzzing')
  .option('-p, --property <property>', 'Run specific property test (parser-never-hangs, runtime-memory-safe, type-safety)')
  .action(async (options) => {
    try {
      const { runFuzzTest, runPropertyTest } = await import('./testing/fuzzer');
      
      if (options.property) {
        console.log(`🔍 Running property test: ${options.property}`);
        const result = await runPropertyTest(options.property, parseInt(options.iterations) || 100);
        if (result) {
          console.log(`✅ Property test passed: ${options.property}`);
        } else {
          console.log(`❌ Property test failed: ${options.property}`);
          process.exit(1);
        }
      } else {
        console.log('🎯 Running fuzzing tests...');
        const result = await runFuzzTest({
          maxIterations: parseInt(options.iterations) || 1000,
          timeout: parseInt(options.timeout) || 5000,
          includeUnicode: options.unicode !== false,
          includeControlChars: options.controlChars === true
        });
        
        console.log('\n📊 Fuzzing Results:');
        console.log(`  Total tests: ${result.totalTests}`);
        console.log(`  Crashes: ${result.crashes}`);
        console.log(`  Timeouts: ${result.timeouts}`);
        console.log(`  Success rate: ${((result.totalTests - result.crashes - result.timeouts) / result.totalTests * 100).toFixed(1)}%`);
        
        if (result.failures.length > 0) {
          console.log('\n🐛 Sample failures:');
          result.failures.slice(0, 3).forEach((failure, index) => {
            console.log(`  ${index + 1}. ${failure.type}: ${failure.error}`);
            console.log(`     Input: ${failure.input.substring(0, 50)}${failure.input.length > 50 ? '...' : ''}`);
          });
        }
        
        if (result.crashes > result.totalTests * 0.1) {
          console.log('\n⚠️  High crash rate detected - consider investigating');
        } else {
          console.log('\n✅ Fuzzing completed with acceptable crash rate');
        }
      }
    } catch (error) {
      console.error(`❌ Fuzzing failed: ${error}`);
      process.exit(1);
    }
  });

program
  .command('site')
  .description('Generate static documentation site')
  .option('-o, --output <path>', 'Output directory', './docs-site')
  .option('-s, --source <path>', 'Source documentation directory', './docs')
  .option('--theme <theme>', 'Site theme (light, dark, auto)', 'auto')
  .option('--name <name>', 'Site name', 'Omniscript')
  .option('--deploy <target>', 'Deploy to hosting service (github-pages, netlify, vercel)')
  .action(async (options) => {
    try {
      const { generateDocSite, StaticDocGenerator } = await import('./docs-site');
      const fs = await import('fs');
      
      console.log('🌐 Generating static documentation site...');
      
      // Read package.json for version
      const packagePath = './package.json';
      let version = '2.0.0';
      try {
        const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
        version = packageJson.version || '2.0.0';
      } catch {
        console.warn('Could not read package.json, using default version');
      }
      
      const config = {
        name: options.name,
        outputDir: options.output,
        sourceDir: options.source,
        theme: options.theme as 'light' | 'dark' | 'auto',
        version
      };
      
      await generateDocSite(config);
      
      if (options.deploy) {
        const generator = new StaticDocGenerator({
          name: config.name,
          description: 'A modern programming language for full-stack development',
          baseUrl: 'https://omniscript.dev',
          version: config.version,
          outputDir: config.outputDir,
          sourceDir: config.sourceDir,
          theme: config.theme,
          repository: 'https://github.com/RyAnPr1Me/Omniscript'
        });
        
        await generator.deploy(options.deploy as 'github-pages' | 'netlify' | 'vercel');
      }
      
      console.log(`\n🎉 Static site generated successfully!`);
      console.log(`📂 Output: ${options.output}`);
      console.log(`🌐 Open ${options.output}/index.html in your browser to view the site`);
      
    } catch (error) {
      console.error(`❌ Site generation failed: ${error}`);
      process.exit(1);
    }
  });

program
  .command('docs')
  .description('Generate API documentation')
  .option('-o, --output <path>', 'Output directory', './docs/api')
  .option('-f, --format <format>', 'Output format (markdown)', 'markdown')
  .action(async (options) => {
    try {
      const { TypeScriptDocGenerator, MarkdownDocGenerator } = await import('./docs-generator');
      const fs = await import('fs');
      const path = await import('path');
      
      console.log('📚 Generating API documentation...');
      
      const docGen = new TypeScriptDocGenerator();
      const modules = docGen.generateDocumentation();
      
      if (modules.length === 0) {
        console.log('⚠️  No modules found to document');
        return;
      }
      
      console.log(`📖 Found ${modules.length} modules to document`);
      
      // Ensure output directory exists
      const outputDir = path.resolve(options.output);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      if (options.format === 'markdown') {
        const markdown = MarkdownDocGenerator.generateMarkdown(modules);
        const outputFile = path.join(outputDir, 'API.md');
        fs.writeFileSync(outputFile, markdown);
        console.log(`✅ Generated markdown documentation: ${outputFile}`);
      }
      
      // Also generate individual module files
      for (const module of modules) {
        const moduleMarkdown = MarkdownDocGenerator.generateMarkdown([module]);
        const moduleFile = path.join(outputDir, `${module.name}.md`);
        fs.writeFileSync(moduleFile, moduleMarkdown);
      }
      
      console.log(`📝 Generated ${modules.length} individual module documentation files`);
      console.log('🎉 Documentation generation complete!');
      
    } catch (error) {
      console.error(`❌ Failed to generate documentation: ${error}`);
    }
  });

// Handle Windows batch file %* argument issue
const args = process.argv.slice(2);

// Filter out literal %* arguments which can occur due to Windows batch file issues
const filteredArgs = args.filter(arg => arg !== '%*');

// If we filtered out %* and have no other args, or if the original args contained only %*
if ((args.length > 0 && filteredArgs.length === 0) || (args.length === 1 && args[0] === '%*')) {
  // Show help instead of throwing unknown command error
  program.help();
} else if (filteredArgs.length !== args.length) {
  // If we filtered out some %* arguments, parse with the filtered arguments
  program.parse(['node', 'omni', ...filteredArgs]);
} else {
  // Normal case - no %* issues
  program.parse();
}
