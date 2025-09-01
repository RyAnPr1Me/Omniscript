import { Result } from '../runtime';

export class List<T> {
  private items: T[] = [];
  private lock = new Mutex();

  async push(item: T): Promise<void> {
    await this.lock.acquire();
    try {
      this.items.push(item);
    } finally {
      this.lock.release();
    }
  }

  async tryPush(item: T): Promise<Result<void, Error>> {
    try {
      await this.lock.acquire();
      this.items.push(item);
      return Result.Ok(void 0);
    } catch (error) {
      return Result.Err(error as Error);
    } finally {
      this.lock.release();
    }
  }

  pop(): T | undefined {
    // Synchronous pop for compatibility with tests
    return this.items.pop();
  }

  async filter(predicate: (item: T) => boolean): Promise<List<T>> {
    await this.lock.acquire();
    try {
      const filteredItems = this.items.filter(predicate);
      const newList = new List<T>();
      for (const item of filteredItems) {
        await newList.push(item);
      }
      return newList;
    } finally {
      this.lock.release();
    }
  }

  async toArray(): Promise<T[]> {
    await this.lock.acquire();
    try {
      return [...this.items];
    } finally {
      this.lock.release(); 
    }
  }

  // Additional methods for enhanced functionality
  async map<R>(mapper: (item: T, index: number) => R): Promise<List<R>> {
    await this.lock.acquire();
    try {
      const mappedItems = this.items.map(mapper);
      const newList = new List<R>();
      for (const item of mappedItems) {
        await newList.push(item);
      }
      return newList;
    } finally {
      this.lock.release();
    }
  }

  async reduce<R>(reducer: (acc: R, item: T, index: number) => R, initialValue: R): Promise<R> {
    await this.lock.acquire();
    try {
      return this.items.reduce(reducer, initialValue);
    } finally {
      this.lock.release();
    }
  }

  get length(): number {
    return this.items.length;
  }

  async at(index: number): Promise<T | undefined> {
    await this.lock.acquire();
    try {
      return this.items[index];
    } finally {
      this.lock.release();
    }
  }

  async indexOf(item: T): Promise<number> {
    await this.lock.acquire();
    try {
      return this.items.indexOf(item);
    } finally {
      this.lock.release();
    }
  }

  async includes(item: T): Promise<boolean> {
    await this.lock.acquire();
    try {
      return this.items.includes(item);
    } finally {
      this.lock.release();
    }
  }

  async slice(start?: number, end?: number): Promise<List<T>> {
    await this.lock.acquire();
    try {
      const slicedItems = this.items.slice(start, end);
      const newList = new List<T>();
      for (const item of slicedItems) {
        await newList.push(item);
      }
      return newList;
    } finally {
      this.lock.release();
    }
  }

  async reverse(): Promise<List<T>> {
    await this.lock.acquire();
    try {
      const reversedItems = [...this.items].reverse();
      const newList = new List<T>();
      for (const item of reversedItems) {
        await newList.push(item);
      }
      return newList;
    } finally {
      this.lock.release();
    }
  }

  async sort(compareFn?: (a: T, b: T) => number): Promise<List<T>> {
    await this.lock.acquire();
    try {
      const sortedItems = [...this.items].sort(compareFn);
      const newList = new List<T>();
      for (const item of sortedItems) {
        await newList.push(item);
      }
      return newList;
    } finally {
      this.lock.release();
    }
  }
}

export class Map<K, V> {
  private _items = new globalThis.Map<K, V>();
  private lock = new Mutex();

  async set(key: K, value: V): Promise<void> {
    await this.lock.acquire();
    try {
      this._items.set(key, value);
    } finally {
      this.lock.release();
    }
  }

  async get(key: K): Promise<V | undefined> {
    await this.lock.acquire();
    try {
      return this._items.get(key);
    } finally {
      this.lock.release();
    }
  }

  async entries(): Promise<[K, V][]> {
    await this.lock.acquire();
    try {
      return Array.from(this._items.entries());
    } finally {
      this.lock.release();
    }
  }

  async clear(): Promise<void> {
    await this.lock.acquire();
    try {
      this._items.clear();
    } finally {
      this.lock.release();
    }
  }
}

class Mutex {
  private promise: Promise<void> = Promise.resolve();

  async acquire(): Promise<void> {
    let release: () => void;
    const next = new Promise<void>(resolve => (release = resolve));
    const previous = this.promise;
    this.promise = next;
    await previous;
    release!();
  }

  release(): void {
    // No-op, handled by acquire
  }

  // Add timeout support
  async acquireWithTimeout(timeoutMs: number): Promise<boolean> {
    const timeoutPromise = new Promise<false>(resolve => 
      setTimeout(() => resolve(false), timeoutMs)
    );
    const acquirePromise = this.acquire().then(() => true);
    return Promise.race([acquirePromise, timeoutPromise]);
  }
}

// Enhanced Set implementation
export class Set<T> {
  private items = new globalThis.Set<T>();
  private lock = new Mutex();

  async add(item: T): Promise<void> {
    await this.lock.acquire();
    try {
      this.items.add(item);
    } finally {
      this.lock.release();
    }
  }

  async has(item: T): Promise<boolean> {
    await this.lock.acquire();
    try {
      return this.items.has(item);
    } finally {
      this.lock.release();
    }
  }

  async delete(item: T): Promise<boolean> {
    await this.lock.acquire();
    try {
      return this.items.delete(item);
    } finally {
      this.lock.release();
    }
  }

  async clear(): Promise<void> {
    await this.lock.acquire();
    try {
      this.items.clear();
    } finally {
      this.lock.release();
    }
  }

  get size(): number {
    return this.items.size;
  }

  async toArray(): Promise<T[]> {
    await this.lock.acquire();
    try {
      return Array.from(this.items);
    } finally {
      this.lock.release();
    }
  }

  async union(other: Set<T>): Promise<Set<T>> {
    const result = new Set<T>();
    const thisArray = await this.toArray();
    const otherArray = await other.toArray();
    
    for (const item of thisArray) {
      await result.add(item);
    }
    for (const item of otherArray) {
      await result.add(item);
    }
    
    return result;
  }

  async intersection(other: Set<T>): Promise<Set<T>> {
    const result = new Set<T>();
    const thisArray = await this.toArray();
    
    for (const item of thisArray) {
      if (await other.has(item)) {
        await result.add(item);
      }
    }
    
    return result;
  }

  async difference(other: Set<T>): Promise<Set<T>> {
    const result = new Set<T>();
    const thisArray = await this.toArray();
    
    for (const item of thisArray) {
      if (!(await other.has(item))) {
        await result.add(item);
      }
    }
    
    return result;
  }
}

// Priority Queue implementation
export class PriorityQueue<T> {
  private heap: Array<{ item: T; priority: number }> = [];
  private lock = new Mutex();

  async enqueue(item: T, priority: number): Promise<void> {
    await this.lock.acquire();
    try {
      this.heap.push({ item, priority });
      this.heapifyUp(this.heap.length - 1);
    } finally {
      this.lock.release();
    }
  }

  async dequeue(): Promise<T | undefined> {
    await this.lock.acquire();
    try {
      if (this.heap.length === 0) return undefined;
      
      const result = this.heap[0].item;
      const last = this.heap.pop()!;
      
      if (this.heap.length > 0) {
        this.heap[0] = last;
        this.heapifyDown(0);
      }
      
      return result;
    } finally {
      this.lock.release();
    }
  }

  async peek(): Promise<T | undefined> {
    await this.lock.acquire();
    try {
      return this.heap[0]?.item;
    } finally {
      this.lock.release();
    }
  }

  get size(): number {
    return this.heap.length;
  }

  get isEmpty(): boolean {
    return this.heap.length === 0;
  }

  private heapifyUp(index: number): void {
    if (index === 0) return;
    
    const parentIndex = Math.floor((index - 1) / 2);
    if (this.heap[index].priority > this.heap[parentIndex].priority) {
      [this.heap[index], this.heap[parentIndex]] = [this.heap[parentIndex], this.heap[index]];
      this.heapifyUp(parentIndex);
    }
  }

  private heapifyDown(index: number): void {
    const leftChild = 2 * index + 1;
    const rightChild = 2 * index + 2;
    let largest = index;

    if (leftChild < this.heap.length && this.heap[leftChild].priority > this.heap[largest].priority) {
      largest = leftChild;
    }

    if (rightChild < this.heap.length && this.heap[rightChild].priority > this.heap[largest].priority) {
      largest = rightChild;
    }

    if (largest !== index) {
      [this.heap[index], this.heap[largest]] = [this.heap[largest], this.heap[index]];
      this.heapifyDown(largest);
    }
  }
}

// Graph data structure
export interface GraphNode<T> {
  id: string;
  data: T;
}

export interface GraphEdge {
  from: string;
  to: string;
  weight?: number;
}

export class Graph<T> {
  private nodes = new globalThis.Map<string, GraphNode<T>>();
  private adjacencyList = new globalThis.Map<string, string[]>();
  private edges = new globalThis.Map<string, GraphEdge>();
  private lock = new Mutex();

  async addNode(id: string, data: T): Promise<void> {
    await this.lock.acquire();
    try {
      this.nodes.set(id, { id, data });
      if (!this.adjacencyList.has(id)) {
        this.adjacencyList.set(id, []);
      }
    } finally {
      this.lock.release();
    }
  }

  async addEdge(from: string, to: string, weight?: number): Promise<void> {
    await this.lock.acquire();
    try {
      const edgeId = `${from}-${to}`;
      this.edges.set(edgeId, { from, to, weight });
      
      if (!this.adjacencyList.has(from)) {
        this.adjacencyList.set(from, []);
      }
      this.adjacencyList.get(from)!.push(to);
    } finally {
      this.lock.release();
    }
  }

  async getNode(id: string): Promise<GraphNode<T> | undefined> {
    await this.lock.acquire();
    try {
      return this.nodes.get(id);
    } finally {
      this.lock.release();
    }
  }

  async getNeighbors(nodeId: string): Promise<string[]> {
    await this.lock.acquire();
    try {
      return this.adjacencyList.get(nodeId) || [];
    } finally {
      this.lock.release();
    }
  }

  async hasPath(from: string, to: string): Promise<boolean> {
    const visited = new globalThis.Set<string>();
    const queue = [from];

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (current === to) return true;
      
      if (visited.has(current)) continue;
      visited.add(current);

      const neighbors = await this.getNeighbors(current);
      queue.push(...neighbors);
    }

    return false;
  }

  async shortestPath(from: string, to: string): Promise<string[] | null> {
    const visited = new globalThis.Set<string>();
    const queue: { node: string; path: string[] }[] = [{ node: from, path: [from] }];

    while (queue.length > 0) {
      const { node: current, path } = queue.shift()!;
      
      if (current === to) return path;
      if (visited.has(current)) continue;
      
      visited.add(current);
      const neighbors = await this.getNeighbors(current);
      
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          queue.push({ node: neighbor, path: [...path, neighbor] });
        }
      }
    }

    return null;
  }

  async getAllNodes(): Promise<GraphNode<T>[]> {
    await this.lock.acquire();
    try {
      return Array.from(this.nodes.values());
    } finally {
      this.lock.release();
    }
  }

  async getAllEdges(): Promise<GraphEdge[]> {
    await this.lock.acquire();
    try {
      return Array.from(this.edges.values());
    } finally {
      this.lock.release();
    }
  }
}

// Binary Search Tree
class TreeNode<T> {
  constructor(
    public value: T,
    public left: TreeNode<T> | null = null,
    public right: TreeNode<T> | null = null
  ) {}
}

export class BinarySearchTree<T> {
  private root: TreeNode<T> | null = null;
  private lock = new Mutex();
  private compareFn: (a: T, b: T) => number;

  constructor(compareFn?: (a: T, b: T) => number) {
    this.compareFn = compareFn || ((a, b) => {
      if (a < b) return -1;
      if (a > b) return 1;
      return 0;
    });
  }

  async insert(value: T): Promise<void> {
    await this.lock.acquire();
    try {
      this.root = this.insertNode(this.root, value);
    } finally {
      this.lock.release();
    }
  }

  private insertNode(node: TreeNode<T> | null, value: T): TreeNode<T> {
    if (node === null) {
      return new TreeNode(value);
    }

    const comparison = this.compareFn(value, node.value);
    if (comparison < 0) {
      node.left = this.insertNode(node.left, value);
    } else if (comparison > 0) {
      node.right = this.insertNode(node.right, value);
    }

    return node;
  }

  async search(value: T): Promise<boolean> {
    await this.lock.acquire();
    try {
      return this.searchNode(this.root, value);
    } finally {
      this.lock.release();
    }
  }

  private searchNode(node: TreeNode<T> | null, value: T): boolean {
    if (node === null) return false;

    const comparison = this.compareFn(value, node.value);
    if (comparison === 0) return true;
    if (comparison < 0) return this.searchNode(node.left, value);
    return this.searchNode(node.right, value);
  }

  async inorderTraversal(): Promise<T[]> {
    await this.lock.acquire();
    try {
      const result: T[] = [];
      this.inorderHelper(this.root, result);
      return result;
    } finally {
      this.lock.release();
    }
  }

  private inorderHelper(node: TreeNode<T> | null, result: T[]): void {
    if (node !== null) {
      this.inorderHelper(node.left, result);
      result.push(node.value);
      this.inorderHelper(node.right, result);
    }
  }

  async preorderTraversal(): Promise<T[]> {
    await this.lock.acquire();
    try {
      const result: T[] = [];
      this.preorderHelper(this.root, result);
      return result;
    } finally {
      this.lock.release();
    }
  }

  private preorderHelper(node: TreeNode<T> | null, result: T[]): void {
    if (node !== null) {
      result.push(node.value);
      this.preorderHelper(node.left, result);
      this.preorderHelper(node.right, result);
    }
  }

  async postorderTraversal(): Promise<T[]> {
    await this.lock.acquire();
    try {
      const result: T[] = [];
      this.postorderHelper(this.root, result);
      return result;
    } finally {
      this.lock.release();
    }
  }

  private postorderHelper(node: TreeNode<T> | null, result: T[]): void {
    if (node !== null) {
      this.postorderHelper(node.left, result);
      this.postorderHelper(node.right, result);
      result.push(node.value);
    }
  }

  async min(): Promise<T | null> {
    await this.lock.acquire();
    try {
      const minNode = this.findMin(this.root);
      return minNode ? minNode.value : null;
    } finally {
      this.lock.release();
    }
  }

  private findMin(node: TreeNode<T> | null): TreeNode<T> | null {
    if (node === null || node.left === null) return node;
    return this.findMin(node.left);
  }

  async max(): Promise<T | null> {
    await this.lock.acquire();
    try {
      const maxNode = this.findMax(this.root);
      return maxNode ? maxNode.value : null;
    } finally {
      this.lock.release();
    }
  }

  private findMax(node: TreeNode<T> | null): TreeNode<T> | null {
    if (node === null || node.right === null) return node;
    return this.findMax(node.right);
  }
}
