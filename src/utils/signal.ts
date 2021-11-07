type Callback = (...params: any[]) => void | Promise<void>;
type Subscriptions<T extends string> = {
  [key in T]?: Callback[] | undefined;
};

export default class Signal<T extends string> {
  private subscriptions: Subscriptions<T> = {};
  private yields: Subscriptions<T> = {};

  subscribe(signal: T, callback: Callback) {
    if (!this.subscriptions[signal]) {
      this.subscriptions[signal] = [];
    }
    this.subscriptions[signal]?.push(callback);
  }

  yield(signal: T): Promise<any[]> {
    if (!this.yields[signal]) {
      this.yields[signal] = [];
    }
    const promise = new Promise<any[]>((resolve) => {
      this.yields[signal]?.push(resolve);
    });
    return promise;
  }

  emit(signal: T, ...values: any[]) {
    const callbacks = (this.subscriptions[signal] as Callback[]) || [];
    for (const callback of callbacks) {
      callback(...values);
    }
    const resolvers = (this.yields[signal] as Callback[]) || [];
    for (const resolver of resolvers) {
      resolver(...values);
    }
    this.yields[signal] = [];
  }

  unsubscribe(signal: T, callback: Callback) {
    this.subscriptions[signal] = (
      (this.subscriptions[signal] as Callback[]) || []
    ).filter((cb) => cb !== callback);
  }

  clear() {
    this.subscriptions = {};
    this.yields = {};
  }
}
