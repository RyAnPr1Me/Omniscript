// Advanced Concurrency and Async Programming Example  
// Demonstrates: Actors, channels, async/await, worker pools, coroutines

use { Console, DateTime, Runtime, Math, UUID } from 'stdlib';

// Type definitions for concurrency
type Message<T> = {
  id :: string,
  type :: string,
  payload :: T,
  sender :: string,
  timestamp :: DateTime
};

type ActorContext = {
  self :: string,
  sender :: string,
  system :: ActorSystem
};

type WorkerTask<T, R> = {
  id :: string,
  input :: T,
  processor :: (input :: T) -> Promise<R>,
  priority :: number,
  timeout :: number
};

type Channel<T> = {
  send :: (value :: T) -> Promise<void>,
  receive :: () -> Promise<T>,
  close :: () -> void,
  isClosed :: () -> boolean
};

// Actor System implementation
object ActorSystem {
  def actors :: Map<string, Actor>;
  def messageQueue :: Map<string, Message<any>[]>;
  def isRunning :: boolean;
  def scheduler :: any;
  
  constructor() {
    this.actors = new Map();
    this.messageQueue = new Map();
    this.isRunning = true;
    this.startScheduler();
  }
  
  def createActor :: <T>(name :: string, behavior :: (message :: Message<T>, context :: ActorContext) -> Promise<void>) -> string = 
    (name, behavior) => {
      def actorId :: string = `${name}-${UUID.generate()}`;
      def actor :: Actor = new Actor(actorId, behavior, this);
      
      this.actors.set(actorId, actor);
      this.messageQueue.set(actorId, []);
      
      Console.log(`👤 Actor created: ${actorId}`);
      return actorId;
    };
  
  def send :: <T>(actorId :: string, message :: Message<T>) -> boolean = (actorId, message) => {
    match this.actors.has(actorId) {
      case false => {
        Console.warn(`Actor not found: ${actorId}`);
        return false;
      }
      case true => {
        def queue :: Message<any>[] = this.messageQueue.get(actorId) || [];
        queue.push(message);
        this.messageQueue.set(actorId, queue);
        return true;
      }
    }
  };
  
  def tell :: <T>(actorId :: string, messageType :: string, payload :: T, sender :: string) -> boolean = 
    (actorId, messageType, payload, sender) => {
      def message :: Message<T> = {
        id: UUID.generate(),
        type: messageType,
        payload,
        sender,
        timestamp: DateTime.now()
      };
      return this.send(actorId, message);
    };
  
  def startScheduler :: () -> void = () => {
    this.scheduler = setInterval(async () => {
      match this.isRunning {
        case false => {}
        case true => {
          def actorIds :: string[] = Array.from(this.actors.keys());
          
          for (def actorId of actorIds) {
            def queue :: Message<any>[] = this.messageQueue.get(actorId) || [];
            match queue.length > 0 {
              case true => {
                def message :: Message<any> = queue.shift();
                def actor :: Actor = this.actors.get(actorId);
                
                match actor {
                  case undefined => {}
                  case actor => {
                    try {
                      await actor.processMessage(message);
                    } catch (error :: Error) {
                      Console.error(`Actor ${actorId} error:`, error);
                    }
                  }
                }
              }
              case false => {}
            }
          }
        }
      }
    }, 10); // 10ms scheduler interval
  };
  
  def stop :: () -> void = () => {
    this.isRunning = false;
    match this.scheduler {
      case null => {}
      case scheduler => clearInterval(scheduler)
    }
    Console.log('🛑 Actor system stopped');
  };
  
  def getStats :: () -> any = () => ({
    totalActors: this.actors.size,
    totalQueuedMessages: Array.from(this.messageQueue.values()) |> map((q) => q.length) |> reduce(0, (a, b) => a + b),
    isRunning: this.isRunning
  });
}

// Actor implementation
object Actor {
  def id :: string;
  def behavior :: Function;
  def system :: ActorSystem;
  def state :: any;
  
  constructor(id :: string, behavior :: Function, system :: ActorSystem) {
    this.id = id;
    this.behavior = behavior;
    this.system = system;
    this.state = {};
  }
  
  def processMessage :: (message :: Message<any>) -> Promise<void> = async (message) => {
    def context :: ActorContext = {
      self: this.id,
      sender: message.sender,
      system: this.system
    };
    
    await this.behavior(message, context);
  };
  
  def tell :: <T>(actorId :: string, messageType :: string, payload :: T) -> boolean = (actorId, messageType, payload) => {
    return this.system.tell(actorId, messageType, payload, this.id);
  };
}

// Channel implementation for CSP-style communication
object ChannelImpl<T> {
  def buffer :: T[];
  def maxBufferSize :: number;
  def waitingSenders :: any[];
  def waitingReceivers :: any[];
  def closed :: boolean;
  
  constructor(maxBufferSize :: number = 0) {
    this.buffer = [];
    this.maxBufferSize = maxBufferSize;
    this.waitingSenders = [];
    this.waitingReceivers = [];
    this.closed = false;
  }
  
  def send :: (value :: T) -> Promise<void> = async (value) => {
    match this.closed {
      case true => throw new Error('Channel is closed')
      case false => {
        // If there's a waiting receiver, send directly
        match this.waitingReceivers.length > 0 {
          case true => {
            def receiver :: any = this.waitingReceivers.shift();
            receiver.resolve(value);
            return;
          }
          case false => {
            // If buffer has space, add to buffer
            match this.buffer.length < this.maxBufferSize {
              case true => {
                this.buffer.push(value);
                return;
              }
              case false => {
                // Wait for space in buffer or receiver
                return new Promise((resolve, reject) => {
                  this.waitingSenders.push({ value, resolve, reject });
                });
              }
            }
          }
        }
      }
    }
  };
  
  def receive :: () -> Promise<T> = async () => {
    match this.closed && this.buffer.length === 0 {
      case true => throw new Error('Channel is closed and empty')
      case false => {
        // If buffer has values, return immediately
        match this.buffer.length > 0 {
          case true => {
            def value :: T = this.buffer.shift();
            
            // If there are waiting senders, move one to buffer
            match this.waitingSenders.length > 0 {
              case true => {
                def sender :: any = this.waitingSenders.shift();
                this.buffer.push(sender.value);
                sender.resolve();
              }
              case false => {}
            }
            
            return value;
          }
          case false => {
            // Wait for a value
            return new Promise((resolve, reject) => {
              this.waitingReceivers.push({ resolve, reject });
            });
          }
        }
      }
    }
  };
  
  def close :: () -> void = () => {
    this.closed = true;
    
    // Reject all waiting senders
    this.waitingSenders.forEach((sender) => {
      sender.reject(new Error('Channel closed'));
    });
    this.waitingSenders = [];
    
    // For receivers, only reject if buffer is empty
    match this.buffer.length === 0 {
      case true => {
        this.waitingReceivers.forEach((receiver) => {
          receiver.reject(new Error('Channel closed'));
        });
        this.waitingReceivers = [];
      }
      case false => {}
    }
  };
  
  def isClosed :: () -> boolean = () => {
    return this.closed;
  };
}

// Worker Pool for CPU-intensive tasks
object WorkerPool<T, R> {
  def workers :: Worker<T, R>[];
  def taskQueue :: WorkerTask<T, R>[];
  def running :: boolean;
  def maxWorkers :: number;
  def activeWorkers :: number;
  
  constructor(maxWorkers :: number = 4) {
    this.workers = [];
    this.taskQueue = [];
    this.running = true;
    this.maxWorkers = maxWorkers;
    this.activeWorkers = 0;
    this.initializeWorkers();
  }
  
  def initializeWorkers :: () -> void = () => {
    for (def i = 0; i < this.maxWorkers; i++) {
      def worker :: Worker<T, R> = new Worker(i, this);
      this.workers.push(worker);
    }
    Console.log(`🏭 Worker pool initialized with ${this.maxWorkers} workers`);
  };
  
  def submit :: (task :: WorkerTask<T, R>) -> Promise<R> = async (task) => {
    return new Promise((resolve, reject) => {
      def enhancedTask :: any = {
        ...task,
        resolve,
        reject,
        submittedAt: DateTime.now()
      };
      
      // Insert task based on priority (higher priority first)
      def insertIndex :: number = this.taskQueue.findIndex((t) => t.priority < task.priority);
      match insertIndex === -1 {
        case true => this.taskQueue.push(enhancedTask)
        case false => this.taskQueue.splice(insertIndex, 0, enhancedTask)
      }
      
      this.tryAssignWork();
    });
  };
  
  def tryAssignWork :: () -> void = () => {
    match this.taskQueue.length > 0 && this.activeWorkers < this.maxWorkers {
      case true => {
        def availableWorker :: Worker<T, R> | undefined = this.workers.find((w) => !w.isBusy());
        match availableWorker {
          case undefined => {}
          case worker => {
            def task :: any = this.taskQueue.shift();
            worker.assignTask(task);
            this.activeWorkers++;
          }
        }
      }
      case false => {}
    }
  };
  
  def onWorkerComplete :: () -> void = () => {
    this.activeWorkers--;
    this.tryAssignWork();
  };
  
  def getStats :: () -> any = () => ({
    totalWorkers: this.workers.length,
    activeWorkers: this.activeWorkers,
    queuedTasks: this.taskQueue.length,
    running: this.running
  });
  
  def shutdown :: () -> Promise<void> = async () => {
    this.running = false;
    
    // Wait for all active workers to complete
    while (this.activeWorkers > 0) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    
    Console.log('🏭 Worker pool shut down');
  };
}

object Worker<T, R> {
  def id :: number;
  def pool :: WorkerPool<T, R>;
  def busy :: boolean;
  def currentTask :: any;
  
  constructor(id :: number, pool :: WorkerPool<T, R>) {
    this.id = id;
    this.pool = pool;
    this.busy = false;
  }
  
  def isBusy :: () -> boolean = () => {
    return this.busy;
  };
  
  def assignTask :: (task :: any) -> void = async (task) => {
    this.busy = true;
    this.currentTask = task;
    
    try {
      // Check for timeout
      def timeoutPromise :: Promise<never> = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Task timeout')), task.timeout || 30000);
      });
      
      def taskPromise :: Promise<R> = task.processor(task.input);
      def result :: R = await Promise.race([taskPromise, timeoutPromise]);
      
      task.resolve(result);
      Console.log(`✅ Worker ${this.id} completed task ${task.id}`);
    } catch (error :: Error) {
      task.reject(error);
      Console.error(`❌ Worker ${this.id} failed task ${task.id}:`, error.message);
    } finally {
      this.busy = false;
      this.currentTask = null;
      this.pool.onWorkerComplete();
    }
  };
}

// Coroutine implementation
object Coroutine {
  def generators :: Map<string, AsyncGenerator>;
  
  constructor() {
    this.generators = new Map();
  }
  
  def create :: <T>(name :: string, generator :: () -> AsyncGenerator<T>) -> string = (name, generator) => {
    def coroutineId :: string = `${name}-${UUID.generate()}`;
    this.generators.set(coroutineId, generator());
    Console.log(`🔄 Coroutine created: ${coroutineId}`);
    return coroutineId;
  };
  
  def resume :: <T>(coroutineId :: string, value :: T) -> Promise<any> = async (coroutineId, value) => {
    def generator :: AsyncGenerator | undefined = this.generators.get(coroutineId);
    
    match generator {
      case undefined => throw new Error(`Coroutine not found: ${coroutineId}`)
      case generator => {
        try {
          def result :: any = await generator.next(value);
          match result.done {
            case true => {
              this.generators.delete(coroutineId);
              Console.log(`🏁 Coroutine completed: ${coroutineId}`);
            }
            case false => {}
          }
          return result;
        } catch (error :: Error) {
          this.generators.delete(coroutineId);
          Console.error(`💥 Coroutine error: ${coroutineId}:`, error);
          throw error;
        }
      }
    }
  };
}

// Example concurrent applications

// Chat room actor
def createChatRoomActor :: (system :: ActorSystem) -> string = (system) => {
  return system.createActor('ChatRoom', async (message, context) => {
    static def members :: Set<string> = new Set();
    static def messageHistory :: any[] = [];
    
    match message.type {
      case 'JOIN' => {
        members.add(message.payload.userId);
        def joinMessage :: any = {
          type: 'USER_JOINED',
          userId: message.payload.userId,
          timestamp: DateTime.now()
        };
        messageHistory.push(joinMessage);
        Console.log(`👋 User ${message.payload.userId} joined the chat`);
      }
      case 'LEAVE' => {
        members.delete(message.payload.userId);
        def leaveMessage :: any = {
          type: 'USER_LEFT', 
          userId: message.payload.userId,
          timestamp: DateTime.now()
        };
        messageHistory.push(leaveMessage);
        Console.log(`👋 User ${message.payload.userId} left the chat`);
      }
      case 'MESSAGE' => {
        def chatMessage :: any = {
          type: 'CHAT_MESSAGE',
          userId: message.payload.userId,
          content: message.payload.content,
          timestamp: DateTime.now()
        };
        messageHistory.push(chatMessage);
        Console.log(`💬 ${message.payload.userId}: ${message.payload.content}`);
      }
      case 'GET_HISTORY' => {
        Console.log(`📜 Chat history (${messageHistory.length} messages)`);
        messageHistory.slice(-10).forEach((msg) => {
          Console.log(`  ${msg.timestamp.toISOString()}: ${msg.type} - ${JSON.stringify(msg)}`);
        });
      }
      case _ => {
        Console.warn(`Unknown message type: ${message.type}`);
      }
    }
  });
};

// Pipeline processor using channels
def createPipelineProcessor :: () -> Promise<void> = async () => {
  def inputChannel :: Channel<number> = new ChannelImpl<number>(10);
  def outputChannel :: Channel<string> = new ChannelImpl<string>(10);
  
  // Producer coroutine
  def producer :: AsyncGenerator<void> = async function* () {
    for (def i = 1; i <= 10; i++) {
      yield;
      await inputChannel.send(i);
      Console.log(`📤 Produced: ${i}`);
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    inputChannel.close();
    Console.log('🏁 Producer finished');
  }();
  
  // Processor coroutine
  def processor :: AsyncGenerator<void> = async function* () {
    try {
      while (true) {
        yield;
        def value :: number = await inputChannel.receive();
        def processed :: string = `processed-${value * 2}`;
        await outputChannel.send(processed);
        Console.log(`⚙️ Processed: ${value} -> ${processed}`);
      }
    } catch (error :: Error) {
      outputChannel.close();
      Console.log('🏁 Processor finished');
    }
  }();
  
  // Consumer coroutine
  def consumer :: AsyncGenerator<void> = async function* () {
    try {
      while (true) {
        yield;
        def result :: string = await outputChannel.receive();
        Console.log(`📥 Consumed: ${result}`);
      }
    } catch (error :: Error) {
      Console.log('🏁 Consumer finished');
    }
  }();
  
  // Run all coroutines concurrently
  def coroutineManager :: Coroutine = new Coroutine();
  def producerId :: string = coroutineManager.create('producer', () => producer);
  def processorId :: string = coroutineManager.create('processor', () => processor);
  def consumerId :: string = coroutineManager.create('consumer', () => consumer);
  
  // Resume coroutines in round-robin fashion
  for (def i = 0; i < 50; i++) { // Run for a while
    try {
      await coroutineManager.resume(producerId, null);
      await coroutineManager.resume(processorId, null);
      await coroutineManager.resume(consumerId, null);
      await new Promise((resolve) => setTimeout(resolve, 50));
    } catch (error :: Error) {
      // Some coroutines may finish early
    }
  }
};

// Main demonstration
def main :: () -> Promise<void> = async () => {
  Console.log('🚀 Advanced Concurrency Examples');
  
  // Actor system demo
  Console.log('\n👥 Actor System Demo:');
  def actorSystem :: ActorSystem = new ActorSystem();
  
  def chatRoom :: string = createChatRoomActor(actorSystem);
  
  // Simulate chat activity
  actorSystem.tell(chatRoom, 'JOIN', { userId: 'Alice' }, 'system');
  actorSystem.tell(chatRoom, 'JOIN', { userId: 'Bob' }, 'system');
  
  setTimeout(() => {
    actorSystem.tell(chatRoom, 'MESSAGE', { userId: 'Alice', content: 'Hello everyone!' }, 'alice-client');
  }, 100);
  
  setTimeout(() => {
    actorSystem.tell(chatRoom, 'MESSAGE', { userId: 'Bob', content: 'Hi Alice! How are you?' }, 'bob-client');
  }, 200);
  
  setTimeout(() => {
    actorSystem.tell(chatRoom, 'GET_HISTORY', {}, 'system');
  }, 300);
  
  setTimeout(() => {
    actorSystem.tell(chatRoom, 'LEAVE', { userId: 'Alice' }, 'system');
  }, 400);
  
  // Worker pool demo
  Console.log('\n🏭 Worker Pool Demo:');
  def workerPool :: WorkerPool<number, number> = new WorkerPool<number, number>(3);
  
  // CPU-intensive task simulation
  def cpuIntensiveTask :: (input :: number) -> Promise<number> = async (input) => {
    // Simulate heavy computation
    def result :: number = 0;
    for (def i = 0; i < input * 1000000; i++) {
      result += Math.sin(i) * Math.cos(i);
    }
    return Math.floor(result);
  };
  
  def tasks :: Promise<number>[] = [];
  for (def i = 1; i <= 8; i++) {
    def task :: WorkerTask<number, number> = {
      id: `task-${i}`,
      input: i,
      processor: cpuIntensiveTask,
      priority: Math.random() * 10,
      timeout: 10000
    };
    
    tasks.push(workerPool.submit(task));
  }
  
  Console.log('📋 Submitted 8 CPU-intensive tasks to 3 workers');
  def results :: number[] = await Promise.all(tasks);
  Console.log(`✅ All tasks completed. Results: [${results.join(', ')}]`);
  
  // Pipeline processing demo
  Console.log('\n🔄 Pipeline Processing Demo:');
  await createPipelineProcessor();
  
  // Show system stats
  setTimeout(() => {
    Console.log('\n📊 System Statistics:');
    Console.log('Actor System:', actorSystem.getStats());
    Console.log('Worker Pool:', workerPool.getStats());
    
    // Cleanup
    actorSystem.stop();
    workerPool.shutdown();
  }, 2000);
  
  Console.log('\n🎉 Concurrency examples completed!');
};

// Run the demonstration
main().catch((error) => {
  Console.error('💥 Main execution error:', error);
  process.exit(1);
});