import { Omniscript } from '../../src/index';

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

  test('should allow common logging functions to work without errors', async () => {
    const testScript = `
      log("Using log");
      print("Using print");
      error("Using error");
      warn("Using warn");
      info("Using info");
      debug("Using debug");
    `;
    
    // This should not throw an error
    await expect(omniscript.execute(testScript)).resolves.not.toThrow();
  });

  test('should provide access to core JavaScript objects', async () => {
    const testScript = `
      const arr = new Array(1, 2, 3);
      const str = new String("test");
      const num = new Number(42);
      const bool = new Boolean(true);
      const obj = new Object();
      log("All objects created successfully");
    `;
    
    await expect(omniscript.execute(testScript)).resolves.not.toThrow();
  });
});