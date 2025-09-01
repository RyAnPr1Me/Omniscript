import { Omniscript } from '../../src/index';
import { createWriteStream } from 'fs';
import { tmpdir } from 'os';
import path from 'path';

describe('Log Function Integration', () => {
  let omniscript: Omniscript;

  beforeEach(() => {
    omniscript = new Omniscript();
  });

  test('should allow log() function to be called without error', async () => {
    const testScript = 'log("Hello World!");';
    
    // This should not throw an error
    await expect(omniscript.execute(testScript)).resolves.not.toThrow();
  });

  test('should allow console.log to work alongside log()', async () => {
    const testScript = `
      log("Using log function");
      console.log("Using console.log");
    `;
    
    // This should not throw an error
    await expect(omniscript.execute(testScript)).resolves.not.toThrow();
  });
});