export class Stream<T> {
  private subscribers: ((value: T) => void)[] = [];

  subscribe(fn: (value: T) => void): () => void {
    this.subscribers.push(fn);
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== fn);
    };
  }

  next(value: T): void {
    this.subscribers.forEach(sub => sub(value));
  }

  complete(): void {
    this.subscribers = [];
  }
}

export class Signal<T> {
  private _value: T;
  private subscribers: ((newValue: T) => void)[] = [];

  constructor(initial: T) {
    this._value = initial;
  }

  get value(): T {
    return this._value;
  }

  set value(newVal: T) {
    if (this._value !== newVal) {
      this._value = newVal;
      this.subscribers.forEach(fn => fn(newVal));
    }
  }

  subscribe(fn: (newVal: T) => void): () => void {
    this.subscribers.push(fn);
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== fn);
    };
  }
}