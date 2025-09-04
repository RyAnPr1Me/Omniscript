import { Stream, Signal } from "../../src/stdlib/reactive";

describe("Reactive Programming Primitives", () => {
  test("Stream emits values to subscribers", () => {
    const stream = new Stream<number>();
    const mockSubscriber = jest.fn();

    const unsubscribe = stream.subscribe(mockSubscriber);
    stream.next(42);

    expect(mockSubscriber).toHaveBeenCalledWith(42);

    unsubscribe();
    stream.next(100);
    expect(mockSubscriber).toHaveBeenCalledTimes(1);
  });

  test("Signal notifies subscribers on value change", () => {
    const signal = new Signal<number>(0);
    const mockSubscriber = jest.fn();

    signal.subscribe(mockSubscriber);
    signal.value = 42;

    expect(mockSubscriber).toHaveBeenCalledWith(42);
    expect(signal.value).toBe(42);
  });
});
