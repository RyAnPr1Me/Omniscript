import { Runtime, Actor } from '../../src/runtime';

describe('Actor Model', () => {
  let runtime: Runtime;

  beforeEach(() => {
    runtime = new Runtime();
  });

  test('basic actor creation and message sending', async () => {
    interface CounterState {
      count: number;
    }

    const counterActor = runtime.createActor<CounterState>(
      (message: any, state: CounterState) => {
        if (message.type === 'increment') {
          return { count: state.count + 1 };
        }
        if (message.type === 'add') {
          return { count: state.count + message.value };
        }
        return state;
      },
      { count: 0 }
    );

    counterActor.send({ type: 'increment' });
    counterActor.send({ type: 'add', value: 5 });
    
    // Give actor time to process messages
    await new Promise(resolve => setTimeout(resolve, 10));
    
    expect(counterActor.getState().count).toBe(6);
  });

  test('actor supervision and child spawning', async () => {
    interface ParentState {
      children: string[];
      messages: any[];
    }

    const parentActor = runtime.createActor<ParentState>(
      (message: any, state: ParentState) => {
        if (message.type === 'spawn_child') {
          state.children.push(message.name);
        }
        if (message.type === 'child_error') {
          state.messages.push({
            type: 'error_received',
            child: message.child.getName(),
            error: message.error.message
          });
        }
        return state;
      },
      { children: [], messages: [] },
      'parent'
    );

    // Spawn a child that will error
    const childActor = parentActor.spawn(
      (message: any, state: any) => {
        if (message.type === 'error') {
          throw new Error('Child error');
        }
        return state;
      },
      {},
      'child1'
    );

    parentActor.send({ type: 'spawn_child', name: 'child1' });
    childActor.send({ type: 'error' });

    await new Promise(resolve => setTimeout(resolve, 20));

    const parentState = parentActor.getState();
    expect(parentState.children).toContain('child1');
    expect(parentState.messages).toHaveLength(1);
    expect(parentState.messages[0].type).toBe('error_received');
    expect(parentState.messages[0].child).toBe('child1');
  });

  test('actor error handling with custom error handler', async () => {
    interface ErrorHandlingState {
      value: number;
      errors: string[];
    }

    const errorActor = runtime.createActor<ErrorHandlingState>(
      (message: any, state: ErrorHandlingState) => {
        if (message.type === 'divide') {
          if (message.divisor === 0) {
            throw new Error('Division by zero');
          }
          return { ...state, value: state.value / message.divisor };
        }
        return state;
      },
      { value: 100, errors: [] }
    );

    // Set up error handler
    errorActor.onError((error: Error, message: any, state: ErrorHandlingState) => {
      return {
        ...state,
        errors: [...state.errors, error.message]
      };
    });

    errorActor.send({ type: 'divide', divisor: 2 }); // Should work
    errorActor.send({ type: 'divide', divisor: 0 }); // Should error but be handled
    errorActor.send({ type: 'divide', divisor: 5 }); // Should work

    await new Promise(resolve => setTimeout(resolve, 20));

    const state = errorActor.getState();
    expect(state.value).toBe(10); // 100 / 2 / 5 = 10 (division by zero was handled)
    expect(state.errors).toContain('Division by zero');
  });

  test('actor lifecycle management', async () => {
    const lifecycleActor = runtime.createActor(
      (message: any, state: any) => {
        return { ...state, lastMessage: message };
      },
      { lastMessage: null }
    );

    lifecycleActor.send({ type: 'test1' });
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(lifecycleActor.getState().lastMessage.type).toBe('test1');

    // Stop the actor
    lifecycleActor.stop();
    lifecycleActor.send({ type: 'test2' }); // Should be ignored

    await new Promise(resolve => setTimeout(resolve, 10));
    expect(lifecycleActor.getState().lastMessage.type).toBe('test1'); // Still test1

    // Restart the actor
    lifecycleActor.restart();
    lifecycleActor.send({ type: 'test3' });

    await new Promise(resolve => setTimeout(resolve, 10));
    expect(lifecycleActor.getState().lastMessage.type).toBe('test3');
  });

  test('actor mailbox size tracking', async () => {
    const slowActor = runtime.createActor(
      async (message: any, state: any) => {
        // Simulate slow processing
        await new Promise(resolve => setTimeout(resolve, 50));
        return { ...state, processed: (state.processed || 0) + 1 };
      },
      {}
    );

    // Send multiple messages quickly
    slowActor.send({ type: 'msg1' });
    slowActor.send({ type: 'msg2' });
    slowActor.send({ type: 'msg3' });

    // Check mailbox size before processing
    expect(slowActor.getMailboxSize()).toBeGreaterThan(0);

    // Wait for processing to complete
    await new Promise(resolve => setTimeout(resolve, 200));

    expect(slowActor.getMailboxSize()).toBe(0);
    expect(slowActor.getState().processed).toBe(3);
  });

  test('complex actor system with multiple actors', async () => {
    interface RouterState {
      routes: { [key: string]: Actor<any> };
      messageCount: number;
    }

    interface WorkerState {
      id: string;
      tasksCompleted: number;
    }

    // Create a router actor
    const routerActor = runtime.createActor<RouterState>(
      (message: any, state: RouterState) => {
        if (message.type === 'register_worker') {
          state.routes[message.id] = message.worker;
        }
        if (message.type === 'route_task') {
          const worker = state.routes[message.workerId];
          if (worker) {
            worker.send({ type: 'task', data: message.data });
          }
          return { ...state, messageCount: state.messageCount + 1 };
        }
        return state;
      },
      { routes: {}, messageCount: 0 },
      'router'
    );

    // Create worker actors
    const worker1 = runtime.createActor<WorkerState>(
      (message: any, state: WorkerState) => {
        if (message.type === 'task') {
          return { ...state, tasksCompleted: state.tasksCompleted + 1 };
        }
        return state;
      },
      { id: 'worker1', tasksCompleted: 0 },
      'worker1'
    );

    const worker2 = runtime.createActor<WorkerState>(
      (message: any, state: WorkerState) => {
        if (message.type === 'task') {
          return { ...state, tasksCompleted: state.tasksCompleted + 1 };
        }
        return state;
      },
      { id: 'worker2', tasksCompleted: 0 },
      'worker2'
    );

    // Register workers with router
    routerActor.send({ type: 'register_worker', id: 'worker1', worker: worker1 });
    routerActor.send({ type: 'register_worker', id: 'worker2', worker: worker2 });

    // Route tasks to workers
    routerActor.send({ type: 'route_task', workerId: 'worker1', data: 'task1' });
    routerActor.send({ type: 'route_task', workerId: 'worker1', data: 'task2' });
    routerActor.send({ type: 'route_task', workerId: 'worker2', data: 'task3' });

    await new Promise(resolve => setTimeout(resolve, 50));

    expect(routerActor.getState().messageCount).toBe(3);
    expect(worker1.getState().tasksCompleted).toBe(2);
    expect(worker2.getState().tasksCompleted).toBe(1);
  });
});