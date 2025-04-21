import { Runtime } from '../../src/runtime';

describe('Runtime - Memory Management', () => {
  const runtime = new Runtime();

  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

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

describe('Runtime - Memory Management Edge Cases', () => {
  const runtime = new Runtime();

  beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('handles circular references gracefully', () => {
    const obj1: any = {};
    const obj2: any = { ref: obj1 };
    obj1.ref = obj2;

    runtime.allocate(obj1);
    runtime.allocate(obj2);

    runtime.detectCircularReferences();
    expect(console.warn).toHaveBeenCalledWith("Circular reference detected:", obj1);
  });

  test('garbage collection cleans up unreferenced objects', () => {
    const obj = {};
    runtime.allocate(obj);
    runtime.release(obj);

    runtime.runGarbageCollector();
    expect(runtime.getReferenceCounts().has(obj)).toBe(false);
  });
});