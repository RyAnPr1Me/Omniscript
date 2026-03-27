import { execSync, spawn } from 'child_process';
import { unlinkSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

describe('CLI Easter Eggs', () => {
  const configPath = join(homedir(), '.omni-config.json');
  
  beforeEach(() => {
    // Clean up config file before each test
    try {
      unlinkSync(configPath);
    } catch (error) {
      // File might not exist, that's fine
    }
  });

  afterEach(() => {
    // Clean up config file after each test
    try {
      unlinkSync(configPath);
    } catch (error) {
      // File might not exist, that's fine
    }
  });

  test('goon command appears in help', () => {
    const output = execSync('node dist/cli.js --help', { encoding: 'utf8' });
    expect(output).toContain('goon');
    expect(output).toContain('🤪 Enable goon mode for silly errors');
  });

  test('fish command appears in help', () => {
    const output = execSync('node dist/cli.js --help', { encoding: 'utf8' });
    expect(output).toContain('fish');
    expect(output).toContain('🎣 Start the fishing minigame');
  });

  test('goon mode activation displays expected messages', () => {
    const output = execSync('timeout 3 node dist/cli.js goon || true', { 
      encoding: 'utf8',
      env: { ...process.env, FORCE_COLOR: '0' }
    });
    expect(output).toContain('🤪 GOON MODE ACTIVATED!');
    expect(output).toContain('Things are about to get silly');
    expect(output).toContain('Ready for some goofy errors!');
  });

  test('fish game starts correctly', (done) => {
    const child = spawn('node', ['dist/cli.js', 'fish'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, FORCE_COLOR: '0' }
    });

    let output = '';
    child.stdout.on('data', (data) => {
      output += data.toString();
    });

    // Wait a bit for the game to start
    setTimeout(() => {
      child.stdin.write('q\n'); // Quit the game
    }, 500);

    child.on('close', () => {
      try {
        expect(output).toContain('🎣 Welcome to OMNI FISH!');
        expect(output).toContain('Cast your line and catch some fish!');
        expect(output).toContain('Thanks for playing OMNI FISH!');
        done();
      } catch (error) {
        done(error);
      }
    });

    child.on('error', (error) => {
      done(error);
    });

    // Force kill after timeout
    setTimeout(() => {
      child.kill();
      done(new Error('Fish game test timed out'));
    }, 8000);
  }, 10000);

  test('goon mode can be disabled', () => {
    // First enable goon mode
    execSync('timeout 3 node dist/cli.js goon || true', { 
      encoding: 'utf8',
      env: { ...process.env, FORCE_COLOR: '0' }
    });
    
    // Then disable it
    const output = execSync('node dist/cli.js goon --off', { 
      encoding: 'utf8',
      env: { ...process.env, FORCE_COLOR: '0' }
    });
    
    expect(output).toContain('Goon mode disabled');
    expect(output).toContain('Back to boring errors');
  });
});