// Reactive Programming and Observables Example
// Demonstrates: Reactive streams, signal processing, event handling, data flow

use { Console, DateTime, Math, Runtime } from 'stdlib';

// Type definitions for reactive programming
type Observer<T> = {
  next :: (value :: T) -> void,
  error :: (error :: Error) -> void,
  complete :: () -> void
};

type Subscription = {
  unsubscribe :: () -> void
};

type Signal<T> = {
  value :: T,
  subscribe :: (observer :: Observer<T>) -> Subscription,
  map :: <U>(fn :: (T) -> U) -> Signal<U>,
  filter :: (predicate :: (T) -> boolean) -> Signal<T>,
  reduce :: <U>(accumulator :: (U, T) -> U, initial :: U) -> Signal<U>
};

// Enhanced Observable implementation
object Observable<T> {
  def subscriptionFn :: (observer :: Observer<T>) -> Subscription;
  
  constructor(subscriptionFn :: (observer :: Observer<T>) -> Subscription) {
    this.subscriptionFn = subscriptionFn;
  }
  
  def subscribe :: (observer :: Observer<T>) -> Subscription = (observer) => {
    return this.subscriptionFn(observer);
  };
  
  // Transformation operators
  def map :: <U>(transform :: (T) -> U) -> Observable<U> = (transform) => {
    return new Observable<U>((observer) => {
      return this.subscribe({
        next: (value) => {
          try {
            def transformedValue :: U = transform(value);
            observer.next(transformedValue);
          } catch (error :: Error) {
            observer.error(error);
          }
        },
        error: observer.error,
        complete: observer.complete
      });
    });
  };
  
  def filter :: (predicate :: (T) -> boolean) -> Observable<T> = (predicate) => {
    return new Observable<T>((observer) => {
      return this.subscribe({
        next: (value) => {
          try {
            match predicate(value) {
              case true => observer.next(value)
              case false => {} // Skip this value
            }
          } catch (error :: Error) {
            observer.error(error);
          }
        },
        error: observer.error,
        complete: observer.complete
      });
    });
  };
  
  def flatMap :: <U>(transform :: (T) -> Observable<U>) -> Observable<U> = (transform) => {
    return new Observable<U>((observer) => {
      def activeSubscriptions :: Set<Subscription> = new Set();
      def completed :: boolean = false;
      def sourceCompleted :: boolean = false;
      
      def checkForCompletion :: () -> void = () => {
        match sourceCompleted && activeSubscriptions.size === 0 {
          case true => observer.complete()
          case false => {}
        }
      };
      
      def sourceSubscription :: Subscription = this.subscribe({
        next: (value) => {
          try {
            def innerObservable :: Observable<U> = transform(value);
            def innerSubscription :: Subscription = innerObservable.subscribe({
              next: observer.next,
              error: observer.error,
              complete: () => {
                activeSubscriptions.delete(innerSubscription);
                checkForCompletion();
              }
            });
            activeSubscriptions.add(innerSubscription);
          } catch (error :: Error) {
            observer.error(error);
          }
        },
        error: observer.error,
        complete: () => {
          sourceCompleted = true;
          checkForCompletion();
        }
      });
      
      return {
        unsubscribe: () => {
          sourceSubscription.unsubscribe();
          activeSubscriptions.forEach((sub) => sub.unsubscribe());
          activeSubscriptions.clear();
        }
      };
    });
  };
  
  def debounce :: (delayMs :: number) -> Observable<T> = (delayMs) => {
    return new Observable<T>((observer) => {
      def timeoutId :: any = null;
      def lastValue :: T;
      
      return this.subscribe({
        next: (value) => {
          lastValue = value;
          match timeoutId {
            case null => {}
            case id => clearTimeout(id)
          }
          
          timeoutId = setTimeout(() => {
            observer.next(lastValue);
            timeoutId = null;
          }, delayMs);
        },
        error: observer.error,
        complete: () => {
          match timeoutId {
            case null => {}
            case id => {
              clearTimeout(id);
              observer.next(lastValue);
            }
          }
          observer.complete();
        }
      });
    });
  };
  
  def throttle :: (intervalMs :: number) -> Observable<T> = (intervalMs) => {
    return new Observable<T>((observer) => {
      def lastEmitTime :: number = 0;
      
      return this.subscribe({
        next: (value) => {
          def now :: number = DateTime.now().getTime();
          match now - lastEmitTime >= intervalMs {
            case true => {
              observer.next(value);
              lastEmitTime = now;
            }
            case false => {} // Skip this value
          }
        },
        error: observer.error,
        complete: observer.complete
      });
    });
  };
  
  def scan :: <U>(accumulator :: (U, T) -> U, initial :: U) -> Observable<U> = (accumulator, initial) => {
    return new Observable<U>((observer) => {
      def currentValue :: U = initial;
      
      return this.subscribe({
        next: (value) => {
          try {
            currentValue = accumulator(currentValue, value);
            observer.next(currentValue);
          } catch (error :: Error) {
            observer.error(error);
          }
        },
        error: observer.error,
        complete: observer.complete
      });
    });
  };
  
  def combineLatest :: <U, R>(other :: Observable<U>, combiner :: (T, U) -> R) -> Observable<R> = (other, combiner) => {
    return new Observable<R>((observer) => {
      def hasValue1 :: boolean = false;
      def hasValue2 :: boolean = false;
      def lastValue1 :: T;
      def lastValue2 :: U;
      def completed1 :: boolean = false;
      def completed2 :: boolean = false;
      
      def tryEmit :: () -> void = () => {
        match hasValue1 && hasValue2 {
          case true => {
            try {
              def combined :: R = combiner(lastValue1, lastValue2);
              observer.next(combined);
            } catch (error :: Error) {
              observer.error(error);
            }
          }
          case false => {}
        }
      };
      
      def checkComplete :: () -> void = () => {
        match completed1 && completed2 {
          case true => observer.complete()
          case false => {}
        }
      };
      
      def sub1 :: Subscription = this.subscribe({
        next: (value) => {
          hasValue1 = true;
          lastValue1 = value;
          tryEmit();
        },
        error: observer.error,
        complete: () => {
          completed1 = true;
          checkComplete();
        }
      });
      
      def sub2 :: Subscription = other.subscribe({
        next: (value) => {
          hasValue2 = true;
          lastValue2 = value;
          tryEmit();
        },
        error: observer.error,
        complete: () => {
          completed2 = true;
          checkComplete();
        }
      });
      
      return {
        unsubscribe: () => {
          sub1.unsubscribe();
          sub2.unsubscribe();
        }
      };
    });
  };
  
  // Static factory methods
  static def of :: <T>(...values :: T[]) -> Observable<T> = (...values) => {
    return new Observable<T>((observer) => {
      def index :: number = 0;
      
      def emitNext :: () -> void = () => {
        match index < values.length {
          case true => {
            observer.next(values[index]);
            index++;
            setTimeout(emitNext, 0); // Async emission
          }
          case false => observer.complete()
        }
      };
      
      emitNext();
      
      return { unsubscribe: () => {} };
    });
  };
  
  static def interval :: (intervalMs :: number) -> Observable<number> = (intervalMs) => {
    return new Observable<number>((observer) => {
      def count :: number = 0;
      def intervalId :: any = setInterval(() => {
        observer.next(count++);
      }, intervalMs);
      
      return {
        unsubscribe: () => clearInterval(intervalId)
      };
    });
  };
  
  static def fromEvent :: <T>(target :: any, eventName :: string) -> Observable<T> = (target, eventName) => {
    return new Observable<T>((observer) => {
      def handler :: (event :: T) -> void = (event) => observer.next(event);
      
      target.addEventListener(eventName, handler);
      
      return {
        unsubscribe: () => target.removeEventListener(eventName, handler)
      };
    });
  };
  
  static def merge :: <T>(...observables :: Observable<T>[]) -> Observable<T> = (...observables) => {
    return new Observable<T>((observer) => {
      def subscriptions :: Subscription[] = [];
      def completedCount :: number = 0;
      
      observables.forEach((obs) => {
        def subscription :: Subscription = obs.subscribe({
          next: observer.next,
          error: observer.error,
          complete: () => {
            completedCount++;
            match completedCount === observables.length {
              case true => observer.complete()
              case false => {}
            }
          }
        });
        subscriptions.push(subscription);
      });
      
      return {
        unsubscribe: () => subscriptions.forEach((sub) => sub.unsubscribe())
      };
    });
  };
}

// Subject implementation for multicast observables
object Subject<T> {
  def observers :: Observer<T>[];
  def isStopped :: boolean;
  def hasError :: boolean;
  def error :: Error;
  
  constructor() {
    this.observers = [];
    this.isStopped = false;
    this.hasError = false;
  }
  
  def next :: (value :: T) -> void = (value) => {
    match this.isStopped || this.hasError {
      case true => {}
      case false => {
        this.observers.forEach((observer) => {
          try {
            observer.next(value);
          } catch (error :: Error) {
            Console.error('Observer error:', error);
          }
        });
      }
    }
  };
  
  def error :: (error :: Error) -> void = (error) => {
    match this.isStopped || this.hasError {
      case true => {}
      case false => {
        this.hasError = true;
        this.error = error;
        this.observers.forEach((observer) => {
          try {
            observer.error(error);
          } catch (err :: Error) {
            Console.error('Observer error handler error:', err);
          }
        });
        this.observers = [];
      }
    }
  };
  
  def complete :: () -> void = () => {
    match this.isStopped || this.hasError {
      case true => {}
      case false => {
        this.isStopped = true;
        this.observers.forEach((observer) => {
          try {
            observer.complete();
          } catch (error :: Error) {
            Console.error('Observer complete handler error:', error);
          }
        });
        this.observers = [];
      }
    }
  };
  
  def subscribe :: (observer :: Observer<T>) -> Subscription = (observer) => {
    match this.hasError {
      case true => {
        observer.error(this.error);
        return { unsubscribe: () => {} };
      }
      case false => {
        match this.isStopped {
          case true => {
            observer.complete();
            return { unsubscribe: () => {} };
          }
          case false => {
            this.observers.push(observer);
            return {
              unsubscribe: () => {
                def index :: number = this.observers.indexOf(observer);
                match index !== -1 {
                  case true => this.observers.splice(index, 1)
                  case false => {}
                }
              }
            };
          }
        }
      }
    }
  };
  
  def asObservable :: () -> Observable<T> = () => {
    return new Observable<T>((observer) => this.subscribe(observer));
  };
}

// BehaviorSubject that holds current value
object BehaviorSubject<T> extends Subject<T> {
  def currentValue :: T;
  
  constructor(initialValue :: T) {
    super();
    this.currentValue = initialValue;
  }
  
  def next :: (value :: T) -> void = (value) => {
    this.currentValue = value;
    super.next(value);
  };
  
  def subscribe :: (observer :: Observer<T>) -> Subscription = (observer) => {
    def subscription :: Subscription = super.subscribe(observer);
    
    // Emit current value immediately
    match this.hasError {
      case true => {}
      case false => {
        match this.isStopped {
          case true => {}
          case false => {
            try {
              observer.next(this.currentValue);
            } catch (error :: Error) {
              observer.error(error);
            }
          }
        }
      }
    }
    
    return subscription;
  };
  
  def getValue :: () -> T = () => {
    match this.hasError {
      case true => throw this.error
      case false => {
        match this.isStopped {
          case true => throw new Error('Subject has been completed')
          case false => this.currentValue
        }
      }
    }
  };
}

// State management with reactive patterns
object Store<T> {
  def state :: BehaviorSubject<T>;
  def reducers :: Map<string, (T, any) -> T>;
  def middleware :: Function[];
  
  constructor(initialState :: T) {
    this.state = new BehaviorSubject(initialState);
    this.reducers = new Map();
    this.middleware = [];
  }
  
  def registerReducer :: (actionType :: string, reducer :: (T, any) -> T) -> void = (actionType, reducer) => {
    this.reducers.set(actionType, reducer);
  };
  
  def addMiddleware :: (middleware :: Function) -> void = (middleware) => {
    this.middleware.push(middleware);
  };
  
  def dispatch :: (action :: any) -> void = (action) => {
    def currentState :: T = this.state.getValue();
    
    // Apply middleware
    def processedAction :: any = this.middleware |> reduce(action, (acc, middleware) => middleware(acc, currentState));
    
    // Apply reducer
    def reducer :: (T, any) -> T = this.reducers.get(processedAction.type);
    
    match reducer {
      case undefined => {
        Console.warn(`No reducer found for action type: ${processedAction.type}`);
      }
      case reducer => {
        try {
          def newState :: T = reducer(currentState, processedAction);
          this.state.next(newState);
        } catch (error :: Error) {
          Console.error('Reducer error:', error);
          this.state.error(error);
        }
      }
    }
  };
  
  def select :: <R>(selector :: (T) -> R) -> Observable<R> = (selector) => {
    return this.state.asObservable() |> map(selector) |> distinctUntilChanged();
  };
  
  def getState :: () -> T = () => {
    return this.state.getValue();
  };
}

// Utility operators
def distinctUntilChanged :: <T>() -> (Observable<T>) -> Observable<T> = () => (source) => {
  return new Observable<T>((observer) => {
    def hasValue :: boolean = false;
    def lastValue :: T;
    
    return source.subscribe({
      next: (value) => {
        match hasValue && value === lastValue {
          case true => {} // Skip duplicate
          case false => {
            hasValue = true;
            lastValue = value;
            observer.next(value);
          }
        }
      },
      error: observer.error,
      complete: observer.complete
    });
  });
};

// Demo application state
type AppState = {
  counter :: number,
  user :: any,
  todos :: any[],
  loading :: boolean
};

// Example usage and demonstration
def main :: () -> void = () => {
  Console.log('🔄 Reactive Programming Examples');
  
  // Basic Observable example
  Console.log('\n📡 Basic Observable:');
  def numbers :: Observable<number> = Observable.of(1, 2, 3, 4, 5);
  
  def subscription :: Subscription = numbers
    |> map((x) => x * 2)
    |> filter((x) => x > 4)
    |> subscribe({
      next: (value) => Console.log(`Processed: ${value}`),
      error: (error) => Console.error('Error:', error),
      complete: () => Console.log('Stream completed')
    });
  
  // Subject multicast example
  Console.log('\n📢 Subject Multicast:');
  def messageSubject :: Subject<string> = new Subject<string>();
  
  def sub1 :: Subscription = messageSubject.subscribe({
    next: (msg) => Console.log(`Observer 1: ${msg}`),
    error: (error) => Console.error('Observer 1 error:', error),
    complete: () => Console.log('Observer 1 completed')
  });
  
  def sub2 :: Subscription = messageSubject.subscribe({
    next: (msg) => Console.log(`Observer 2: ${msg}`),
    error: (error) => Console.error('Observer 2 error:', error), 
    complete: () => Console.log('Observer 2 completed')
  });
  
  messageSubject.next("Hello");
  messageSubject.next("World");
  messageSubject.complete();
  
  // BehaviorSubject example
  Console.log('\n💾 BehaviorSubject:');
  def currentUser :: BehaviorSubject<any> = new BehaviorSubject({ name: "Guest", id: 0 });
  
  def userSub :: Subscription = currentUser.subscribe({
    next: (user) => Console.log(`Current user: ${user.name} (ID: ${user.id})`),
    error: (error) => Console.error('User error:', error),
    complete: () => Console.log('User stream completed')
  });
  
  currentUser.next({ name: "Alice", id: 1 });
  currentUser.next({ name: "Bob", id: 2 });
  
  // Store with state management
  Console.log('\n🏪 State Store:');
  def initialState :: AppState = {
    counter: 0,
    user: null,
    todos: [],
    loading: false
  };
  
  def store :: Store<AppState> = new Store(initialState);
  
  // Register reducers
  store.registerReducer('INCREMENT', (state, action) => ({
    ...state,
    counter: state.counter + (action.payload || 1)
  }));
  
  store.registerReducer('SET_USER', (state, action) => ({
    ...state,
    user: action.payload
  }));
  
  store.registerReducer('ADD_TODO', (state, action) => ({
    ...state,
    todos: [...state.todos, action.payload]
  }));
  
  // Add logging middleware
  store.addMiddleware((action, state) => {
    Console.log(`Action: ${action.type}`, action.payload);
    return action;
  });
  
  // Subscribe to state changes
  def stateSub :: Subscription = store.select((state) => state.counter).subscribe({
    next: (counter) => Console.log(`Counter: ${counter}`),
    error: (error) => Console.error('Counter error:', error),
    complete: () => Console.log('Counter stream completed')
  });
  
  def userStateSub :: Subscription = store.select((state) => state.user).subscribe({
    next: (user) => Console.log(`User:`, user),
    error: (error) => Console.error('User state error:', error),
    complete: () => Console.log('User state stream completed')
  });
  
  // Dispatch actions
  store.dispatch({ type: 'INCREMENT' });
  store.dispatch({ type: 'INCREMENT', payload: 5 });
  store.dispatch({ type: 'SET_USER', payload: { name: 'Alice', email: 'alice@example.com' } });
  store.dispatch({ type: 'ADD_TODO', payload: { id: 1, text: 'Learn Omniscript', completed: false } });
  
  // Interval example with cleanup
  Console.log('\n⏱️ Interval Stream:');
  def timer :: Observable<number> = Observable.interval(1000);
  
  def timerSub :: Subscription = timer
    |> map((count) => `Tick ${count}`)
    |> subscribe({
      next: (tick) => Console.log(tick),
      error: (error) => Console.error('Timer error:', error),
      complete: () => Console.log('Timer completed')
    });
  
  // Stop timer after 5 seconds
  setTimeout(() => {
    timerSub.unsubscribe();
    Console.log('Timer stopped');
  }, 5000);
  
  // Combined observables example
  Console.log('\n🔗 Combined Observables:');
  def source1 :: Observable<number> = Observable.of(1, 2, 3);
  def source2 :: Observable<string> = Observable.of("A", "B", "C");
  
  def combined :: Observable<string> = source1.combineLatest(source2, (num, letter) => `${num}${letter}`);
  
  def combinedSub :: Subscription = combined.subscribe({
    next: (value) => Console.log(`Combined: ${value}`),
    error: (error) => Console.error('Combined error:', error),
    complete: () => Console.log('Combined stream completed')
  });
  
  Console.log('\n🎉 Reactive programming examples completed!');
  Console.log('Note: Timer will continue running for 5 seconds...');
};

// Run the demonstration
main();