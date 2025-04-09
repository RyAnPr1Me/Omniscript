import { Runtime } from '../../src/runtime';

describe('Runtime - Memory Management', () => {
  const runtime = new Runtime();

  test('enables garbage collection', () => {
    runtime.enableGarbageCollection();
    expect(console.log).toHaveBeenCalledWith("Garbage collection enabled.");
  });

  test('detects circular references', () => {
    runtime.detectCircularReferences();
    expect(console.log).toHaveBeenCalledWith("Detecting circular references...");
  });

  test('enables advanced memory management', () => {
    runtime.enableMemoryManagement();
    expect(console.log).toHaveBeenCalledWith("Advanced memory management enabled.");
  });
});