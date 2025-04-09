import { Runtime } from '../../src/runtime';

describe('Runtime - Operator Overloading', () => {
  const runtime = new Runtime();

  test('demonstrates operator overloading', () => {
    console.log = jest.fn();
    runtime.operatorOverloadingExample();
    expect(console.log).toHaveBeenCalledWith("Operator overloading example executed.");
    expect(console.log).toHaveBeenCalledWith("Result of vector addition:", { x: 4, y: 6 });
  });
});