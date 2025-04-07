export class Worker {
  private worker: globalThis.Worker;

  constructor(scriptURL: string) {
    this.worker = new globalThis.Worker(scriptURL);
  }

  postMessage(data: any): void {
    this.worker.postMessage(data);
  }

  onMessage(callback: (data: any) => void): void {
    this.worker.onmessage = (event) => callback(event.data);
  }

  terminate(): void {
    this.worker.terminate();
  }
}

export class ThreadPool {
  private workers: Worker[] = [];

  constructor(size: number, scriptURL: string) {
    for (let i = 0; i < size; i++) {
      this.workers.push(new Worker(scriptURL));
    }
  }

  async execute(data: any[]): Promise<any[]> {
    return Promise.all(
      data.map((item, index) => {
        const worker = this.workers[index % this.workers.length];
        return new Promise(resolve => {
          worker.onMessage(resolve);
          worker.postMessage(item);
        });
      })
    );
  }
}
