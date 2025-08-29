import { actorSystem, createCounterActor, createAccumulatorActor } from '../../src/runtime/actor';

describe('Actor Model System', () => {
  beforeEach(() => {
    // Clean up any existing actors
    actorSystem.stopAll();
  });

  test('counter actor basic operations', async () => {
    const counter = createCounterActor(10);
    
    // Test increment
    const result1 = await counter.ask({ 
      id: 'inc1', 
      type: 'increment', 
      payload: 5,
      timestamp: Date.now() 
    });
    expect(result1).toBe(15);
    
    // Test get current value
    const result2 = await counter.ask({
      id: 'get1',
      type: 'get',
      payload: null,
      timestamp: Date.now()
    });
    expect(result2).toBe(15);
    
    // Test decrement
    const result3 = await counter.ask({
      id: 'dec1',
      type: 'decrement',
      payload: 3,
      timestamp: Date.now()
    });
    expect(result3).toBe(12);
  });

  test('accumulator actor operations', async () => {
    const accumulator = createAccumulatorActor<string>([]);
    
    // Add items
    const result1 = await accumulator.ask({
      id: 'add1',
      type: 'add',
      payload: 'hello',
      timestamp: Date.now()
    });
    expect(result1).toBe(1);
    
    const result2 = await accumulator.ask({
      id: 'add2',
      type: 'add',
      payload: 'world',
      timestamp: Date.now()
    });
    expect(result2).toBe(2);
    
    // Get items
    const result3 = await accumulator.ask({
      id: 'get1',
      type: 'get',
      payload: null,
      timestamp: Date.now()
    });
    expect(result3).toEqual(['hello', 'world']);
  });

  test('custom actor behavior', async () => {
    const calculator = actorSystem.createActor(
      async (message, state: number) => {
        switch (message.type) {
          case 'multiply':
            return { newState: state * message.payload, reply: state * message.payload };
          case 'divide':
            return { newState: state / message.payload, reply: state / message.payload };
          default:
            return { newState: state, reply: state };
        }
      },
      100, // Initial state
      { name: 'calculator', enableLogging: false }
    );
    
    const result1 = await calculator.ask({
      id: 'mult1',
      type: 'multiply',
      payload: 2,
      timestamp: Date.now()
    });
    expect(result1).toBe(200);
    
    const result2 = await calculator.ask({
      id: 'div1',
      type: 'divide',
      payload: 4,
      timestamp: Date.now()
    });
    expect(result2).toBe(50);
  });

  test('actor system metrics', () => {
    createCounterActor(0);
    createAccumulatorActor([]);
    
    const metrics = actorSystem.getSystemMetrics();
    expect(metrics.totalActors).toBe(2);
    expect(metrics.activeActors).toBe(2);
  });

  test('message sending without reply', async () => {
    const counter = createCounterActor(0);
    
    // Send message without waiting for reply
    await counter.send({
      id: 'inc_no_reply',
      type: 'increment',
      payload: 1,
      timestamp: Date.now()
    });
    
    // Verify state changed
    const result = await counter.ask({
      id: 'get1',
      type: 'get',
      payload: null,
      timestamp: Date.now()
    });
    expect(result).toBe(1);
  });

  test('broadcast message to all actors', async () => {
    const counter1 = createCounterActor(0);
    const counter2 = createCounterActor(0);
    
    await actorSystem.broadcastMessage({
      id: 'broadcast1',
      type: 'increment',
      payload: 5,
      timestamp: Date.now()
    });
    
    // Both counters should have received the message
    const result1 = await counter1.ask({
      id: 'get1',
      type: 'get',
      payload: null,
      timestamp: Date.now()
    });
    
    const result2 = await counter2.ask({
      id: 'get2',
      type: 'get',
      payload: null,
      timestamp: Date.now()
    });
    
    expect(result1).toBe(5);
    expect(result2).toBe(5);
  });
});