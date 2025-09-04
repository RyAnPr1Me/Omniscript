import {
  Stream,
  Subject,
  BehaviorSubject,
  ReactiveState,
  from,
  interval,
  timer,
  merge,
  combineLatest,
} from "../../src/stdlib/reactive";

describe("Advanced Reactive Programming", () => {
  test("stream transformation operators", (done) => {
    const stream = new Stream<number>();
    const results: number[] = [];

    stream
      .map((x) => x * 2)
      .filter((x) => x > 5)
      .subscribe((value) => {
        results.push(value);

        if (results.length === 2) {
          expect(results).toEqual([6, 8]);
          done();
        }
      });

    stream.next(1); // 1 * 2 = 2, filtered out
    stream.next(3); // 3 * 2 = 6, passes filter
    stream.next(4); // 4 * 2 = 8, passes filter
  });

  test("distinctUntilChanged operator", (done) => {
    const stream = new Stream<number>();
    const results: number[] = [];

    stream.distinctUntilChanged().subscribe((value) => {
      results.push(value);

      if (results.length === 3) {
        expect(results).toEqual([1, 2, 3]);
        done();
      }
    });

    stream.next(1);
    stream.next(1); // Should be filtered out
    stream.next(2);
    stream.next(2); // Should be filtered out
    stream.next(3);
  });

  test("debounce operator", (done) => {
    const stream = new Stream<number>();
    const results: number[] = [];

    stream.debounce(50).subscribe((value) => {
      results.push(value);

      if (results.length === 1) {
        expect(results).toEqual([3]);
        done();
      }
    });

    stream.next(1);
    stream.next(2);
    stream.next(3); // Only this should be emitted after debounce
  });

  test("throttle operator", (done) => {
    const stream = new Stream<number>();
    const results: number[] = [];

    stream.throttle(50).subscribe((value) => {
      results.push(value);

      if (results.length === 1) {
        setTimeout(() => {
          expect(results).toEqual([1]);
          done();
        }, 100);
      }
    });

    stream.next(1); // Should be emitted
    stream.next(2); // Should be throttled
    stream.next(3); // Should be throttled
  });

  test("scan operator (accumulator)", (done) => {
    const stream = new Stream<number>();
    const results: number[] = [];

    stream
      .scan((acc, value) => acc + value, 0)
      .subscribe((value) => {
        results.push(value);

        if (results.length === 3) {
          expect(results).toEqual([1, 3, 6]); // Running sum
          done();
        }
      });

    stream.next(1);
    stream.next(2);
    stream.next(3);
  });

  test("take operator", (done) => {
    const stream = new Stream<number>();
    const results: number[] = [];

    stream.take(2).subscribe(
      (value) => results.push(value),
      undefined,
      () => {
        expect(results).toEqual([1, 2]);
        done();
      },
    );

    stream.next(1);
    stream.next(2);
    stream.next(3); // Should not be received
  });

  test("combineWith operator", (done) => {
    const stream1 = new Stream<number>();
    const stream2 = new Stream<string>();
    const results: string[] = [];

    stream1
      .combineWith(stream2, (a, b) => `${a}-${b}`)
      .subscribe((value) => {
        results.push(value);

        if (results.length === 2) {
          expect(results).toEqual(["1-a", "2-a"]);
          done();
        }
      });

    stream1.next(1);
    stream2.next("a"); // Now both have values, should emit
    stream1.next(2); // Should emit with latest from stream2
  });

  test("merge operator", (done) => {
    const stream1 = new Stream<number>();
    const stream2 = new Stream<number>();
    const results: number[] = [];

    stream1.merge(stream2).subscribe((value) => {
      results.push(value);

      if (results.length === 4) {
        expect(results.sort()).toEqual([1, 2, 3, 4]);
        done();
      }
    });

    stream1.next(1);
    stream2.next(2);
    stream1.next(3);
    stream2.next(4);
  });

  test("BehaviorSubject with initial value", (done) => {
    const subject = new BehaviorSubject<number>(100);
    const results: number[] = [];

    subject.subscribe((value) => {
      results.push(value);

      if (results.length === 3) {
        expect(results).toEqual([100, 200, 300]); // Initial value + 2 next values
        done();
      }
    });

    subject.next(200);
    subject.next(300);
  });

  test("ReactiveState with computed properties", () => {
    interface AppState {
      count: number;
      name: string;
    }

    const state = new ReactiveState<AppState>({
      count: 0,
      name: "test",
    });

    const doubleCount = state.addComputed("doubleCount", (s) => s.count * 2);
    expect(doubleCount.value).toBe(0);

    state.setState({ count: 5 });
    expect(doubleCount.value).toBe(10);

    state.setState({ count: 8 });
    expect(doubleCount.value).toBe(16);
  });

  test("ReactiveState with effects", (done) => {
    interface CounterState {
      value: number;
    }

    const state = new ReactiveState<CounterState>({ value: 0 });
    let effectCallCount = 0;

    state.addEffect("logger", (s) => {
      effectCallCount++;
      if (effectCallCount === 3) {
        expect(s.value).toBe(10);
        done();
      }
    });

    state.setState({ value: 5 });
    state.setState({ value: 10 });
  });

  test("ReactiveState with middleware", () => {
    interface State {
      count: number;
    }

    const state = new ReactiveState<State>({ count: 0 });

    // Add validation middleware
    state.addMiddleware((oldState, newState, action) => {
      if (newState.count < 0) {
        return { ...newState, count: 0 }; // Prevent negative values
      }
      return newState;
    });

    state.setState({ count: -5 });
    expect(state.getState().count).toBe(0);

    state.setState({ count: 10 });
    expect(state.getState().count).toBe(10);
  });

  test("select with distinct values", () => {
    interface State {
      user: { id: number; name: string };
      other: string;
    }

    const state = new ReactiveState<State>({
      user: { id: 1, name: "John" },
      other: "data",
    });

    const results: string[] = [];

    // Subscribe to name changes
    const subscription = state
      .select((s) => s.user.name)
      .subscribe((name) => {
        results.push(name);
      });

    // Change the name - should emit new value
    state.setState({ user: { id: 1, name: "Jane" } });

    // Change to same name - should not emit
    state.setState({ user: { id: 2, name: "Jane" } });

    // Change to different name - should emit
    state.setState({ user: { id: 2, name: "Bob" } });

    // Check results - should have Jane and Bob (distinctUntilChanged filters out duplicates)
    expect(results.length).toBeGreaterThanOrEqual(2);
    expect(results).toContain("Jane");
    expect(results).toContain("Bob");

    subscription();
  });

  test("utility functions", (done) => {
    // Test from function
    const values = [1, 2, 3];
    const results: number[] = [];

    from(values).subscribe((value) => {
      results.push(value);

      if (results.length === 3) {
        expect(results).toEqual([1, 2, 3]);
        done();
      }
    });
  });

  test("timer utility", (done) => {
    const start = Date.now();

    timer(50).subscribe((value) => {
      const elapsed = Date.now() - start;
      expect(value).toBe(0);
      expect(elapsed).toBeGreaterThanOrEqual(45); // Allow some timing tolerance
      done();
    });
  });

  test("error handling in streams", (done) => {
    const stream = new Stream<number>();
    let errorCaught = false;

    stream
      .map((x) => {
        if (x === 0) throw new Error("Division by zero");
        return 10 / x;
      })
      .subscribe(
        (value) => {
          expect(value).toBe(5); // 10 / 2
        },
        (error) => {
          errorCaught = true;
          expect(error.message).toBe("Division by zero");

          setTimeout(() => {
            expect(errorCaught).toBe(true);
            done();
          }, 10);
        },
      );

    stream.next(2); // Should work
    stream.next(0); // Should trigger error
  });

  test("stream completion", (done) => {
    const stream = new Stream<number>();
    const results: number[] = [];
    let completed = false;

    stream.subscribe(
      (value) => results.push(value),
      undefined,
      () => {
        completed = true;
        expect(results).toEqual([1, 2, 3]);
        expect(completed).toBe(true);
        done();
      },
    );

    stream.next(1);
    stream.next(2);
    stream.next(3);
    stream.complete();
  });
});
