import { debug } from '../debug';

export interface ActorMessage {
  id: string;
  type: string;
  payload: any;
  sender?: ActorRef;
  timestamp: number;
}

export interface ActorRef {
  id: string;
  send(message: ActorMessage): Promise<void>;
  ask<T>(message: ActorMessage, timeout?: number): Promise<T>;
}

export interface ActorBehavior<TState = any> {
  (message: ActorMessage, state: TState): Promise<{ newState: TState; reply?: any }>;
}

export interface ActorOptions {
  name?: string;
  supervisionStrategy?: 'restart' | 'stop' | 'escalate';
  maxRetries?: number;
  messageQueueSize?: number;
  enableLogging?: boolean;
}

export class Actor<TState = any> implements ActorRef {
  public readonly id: string;
  private state: TState;
  private behavior: ActorBehavior<TState>;
  private messageQueue: ActorMessage[] = [];
  private isProcessing: boolean = false;
  private isActive: boolean = true;
  private options: Required<ActorOptions>;
  private retryCount: number = 0;
  private metrics = {
    messagesProcessed: 0,
    messagesDropped: 0,
    errors: 0,
    averageProcessingTime: 0
  };

  constructor(
    id: string,
    behavior: ActorBehavior<TState>,
    initialState: TState,
    options: ActorOptions = {}
  ) {
    this.id = id;
    this.behavior = behavior;
    this.state = initialState;
    this.options = {
      name: options.name || id,
      supervisionStrategy: options.supervisionStrategy || 'restart',
      maxRetries: options.maxRetries || 3,
      messageQueueSize: options.messageQueueSize || 1000,
      enableLogging: options.enableLogging || false
    };

    debug.info('Actor', `Actor ${this.id} created with initial state`, this.state);
  }

  async send(message: ActorMessage): Promise<void> {
    if (!this.isActive) {
      debug.warn('Actor', `Message sent to inactive actor ${this.id}`);
      return;
    }

    if (this.messageQueue.length >= this.options.messageQueueSize) {
      this.metrics.messagesDropped++;
      debug.warn('Actor', `Message queue full for actor ${this.id}, dropping message`);
      return;
    }

    this.messageQueue.push(message);
    
    if (this.options.enableLogging) {
      debug.debug('Actor', `Actor ${this.id} received message: ${message.type}`);
    }

    this.processNextMessage();
  }

  async ask<T>(message: ActorMessage, timeout: number = 5000): Promise<T> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Ask timeout for actor ${this.id}`));
      }, timeout);

      // Create a response handler
      const originalBehavior = this.behavior;
      this.behavior = async (msg, state) => {
        if (msg.id === message.id) {
          const result = await originalBehavior(msg, state);
          clearTimeout(timer);
          resolve(result.reply);
          this.behavior = originalBehavior;
          return result;
        }
        return originalBehavior(msg, state);
      };

      this.send(message);
    });
  }

  private async processNextMessage(): Promise<void> {
    if (this.isProcessing || this.messageQueue.length === 0) {
      return;
    }

    this.isProcessing = true;
    const message = this.messageQueue.shift()!;
    const startTime = Date.now();

    try {
      const result = await this.behavior(message, this.state);
      this.state = result.newState;
      this.metrics.messagesProcessed++;
      this.retryCount = 0;

      const processingTime = Date.now() - startTime;
      this.metrics.averageProcessingTime = 
        (this.metrics.averageProcessingTime * (this.metrics.messagesProcessed - 1) + processingTime) / 
        this.metrics.messagesProcessed;

      if (this.options.enableLogging) {
        debug.debug('Actor', `Actor ${this.id} processed message ${message.type} in ${processingTime}ms`);
      }

    } catch (error) {
      this.metrics.errors++;
      debug.error('Actor', `Error in actor ${this.id}:`, error);
      
      await this.handleError(error as Error, message);
    }

    this.isProcessing = false;
    
    // Process next message if available
    if (this.messageQueue.length > 0) {
      setImmediate(() => this.processNextMessage());
    }
  }

  private async handleError(error: Error, message: ActorMessage): Promise<void> {
    this.retryCount++;

    switch (this.options.supervisionStrategy) {
      case 'restart':
        if (this.retryCount <= this.options.maxRetries) {
          debug.info('Actor', `Restarting actor ${this.id} after error (attempt ${this.retryCount})`);
          // Re-queue the failed message
          this.messageQueue.unshift(message);
        } else {
          debug.error('Actor', `Actor ${this.id} exceeded max retries, stopping`);
          this.stop();
        }
        break;

      case 'stop':
        debug.info('Actor', `Stopping actor ${this.id} due to error`);
        this.stop();
        break;

      case 'escalate':
        debug.warn('Actor', `Escalating error from actor ${this.id}`);
        throw error;
    }
  }

  stop(): void {
    this.isActive = false;
    this.messageQueue.length = 0;
    debug.info('Actor', `Actor ${this.id} stopped`);
  }

  getMetrics() {
    return {
      ...this.metrics,
      queueLength: this.messageQueue.length,
      isActive: this.isActive,
      state: this.state
    };
  }
}

export class ActorSystem {
  private actors: Map<string, Actor> = new Map();
  private nextId: number = 1;

  createActor<TState>(
    behavior: ActorBehavior<TState>,
    initialState: TState,
    options: ActorOptions = {}
  ): ActorRef {
    const id = `actor-${this.nextId++}`;
    const actor = new Actor(id, behavior, initialState, options);
    this.actors.set(id, actor);
    
    debug.info('ActorSystem', `Created actor ${id}`);
    return actor;
  }

  getActor(id: string): ActorRef | undefined {
    return this.actors.get(id);
  }

  async broadcastMessage(message: ActorMessage): Promise<void> {
    const promises = Array.from(this.actors.values()).map(actor => actor.send(message));
    await Promise.all(promises);
  }

  stopActor(id: string): void {
    const actor = this.actors.get(id);
    if (actor) {
      actor.stop();
      this.actors.delete(id);
      debug.info('ActorSystem', `Stopped and removed actor ${id}`);
    }
  }

  stopAll(): void {
    for (const [id, actor] of this.actors) {
      actor.stop();
    }
    this.actors.clear();
    debug.info('ActorSystem', 'Stopped all actors');
  }

  getSystemMetrics() {
    const actorMetrics = Array.from(this.actors.values()).map(actor => actor.getMetrics());
    
    return {
      totalActors: this.actors.size,
      activeActors: actorMetrics.filter(m => m.isActive).length,
      totalMessages: actorMetrics.reduce((sum, m) => sum + m.messagesProcessed, 0),
      totalErrors: actorMetrics.reduce((sum, m) => sum + m.errors, 0),
      actors: actorMetrics
    };
  }
}

// Global actor system instance
export const actorSystem = new ActorSystem();

// Utility functions for creating common actor patterns
export function createCounterActor(initialValue: number = 0): ActorRef {
  return actorSystem.createActor(
    async (message, state: number) => {
      switch (message.type) {
        case 'increment':
          return { newState: state + (message.payload || 1), reply: state + (message.payload || 1) };
        case 'decrement':
          return { newState: state - (message.payload || 1), reply: state - (message.payload || 1) };
        case 'get':
          return { newState: state, reply: state };
        case 'set':
          return { newState: message.payload, reply: message.payload };
        default:
          return { newState: state, reply: null };
      }
    },
    initialValue,
    { name: 'counter', enableLogging: true }
  );
}

export function createAccumulatorActor<T>(initialValue: T[] = []): ActorRef {
  return actorSystem.createActor(
    async (message, state: T[]) => {
      switch (message.type) {
        case 'add': {
          const newState = [...state, message.payload];
          return { newState, reply: newState.length };
        }
        case 'get':
          return { newState: state, reply: [...state] };
        case 'clear':
          return { newState: [], reply: state.length };
        default:
          return { newState: state, reply: null };
      }
    },
    initialValue,
    { name: 'accumulator', enableLogging: true }
  );
}