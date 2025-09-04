# API Documentation

Auto-generated API documentation for Omniscript.

## Table of Contents

- [collections](#collections)

## collections

**File**: `src/stdlib/collections.ts`

### Classes

#### List

**Properties**:

- `items: T[]` - 
- `lock: any` - 

**Methods**:

##### push

**Signature**: `async push(item: T): Promise<void>`

##### tryPush

**Signature**: `async tryPush(item: T): Promise<Result<void, Error>>`

##### pop

**Signature**: `pop(): T | undefined`

##### filter

**Signature**: `async filter(predicate: (item: T) => boolean): Promise<List<T>>`

##### toArray

**Signature**: `async toArray(): Promise<T[]>`

##### map

**Signature**: `async map<R>(mapper: (item: T, index: number) => R): Promise<List<R>>`

##### reduce

**Signature**: `async reduce<R>(reducer: (acc: R, item: T, index: number) => R, initialValue: R): Promise<R>`

##### at

**Signature**: `async at(index: number): Promise<T | undefined>`

##### indexOf

**Signature**: `async indexOf(item: T): Promise<number>`

##### includes

**Signature**: `async includes(item: T): Promise<boolean>`

##### slice

**Signature**: `async slice(start?: number, end?: number): Promise<List<T>>`

##### reverse

**Signature**: `async reverse(): Promise<List<T>>`

##### sort

**Signature**: `async sort(compareFn?: (a: T, b: T) => number): Promise<List<T>>`

##### find

**Signature**: `async find(predicate: (item: T, index: number) => boolean): Promise<T | undefined>`

##### findIndex

**Signature**: `async findIndex(predicate: (item: T, index: number) => boolean): Promise<number>`

##### some

**Signature**: `async some(predicate: (item: T, index: number) => boolean): Promise<boolean>`

##### every

**Signature**: `async every(predicate: (item: T, index: number) => boolean): Promise<boolean>`

##### flatMap

**Signature**: `async flatMap<R>(mapper: (item: T, index: number) => R[]): Promise<List<R>>`

##### groupBy

**Signature**: `async groupBy<K>(keySelector: (item: T) => K): Promise<Map<K, List<T>>>`

##### partition

**Signature**: `async partition(predicate: (item: T) => boolean): Promise<[List<T>, List<T>]>`

##### take

**Signature**: `async take(count: number): Promise<List<T>>`

##### drop

**Signature**: `async drop(count: number): Promise<List<T>>`

##### takeWhile

**Signature**: `async takeWhile(predicate: (item: T) => boolean): Promise<List<T>>`

##### dropWhile

**Signature**: `async dropWhile(predicate: (item: T) => boolean): Promise<List<T>>`

##### unique

**Signature**: `async unique(keySelector?: (item: T) => any): Promise<List<T>>`

##### zip

**Signature**: `async zip<U>(other: List<U>): Promise<List<[T, U]>>`

##### isEmpty

**Signature**: `async isEmpty(): Promise<boolean>`

##### count

**Signature**: `async count(predicate?: (item: T) => boolean): Promise<number>`

##### min

**Signature**: `async min(compareFn?: (a: T, b: T) => number): Promise<T | undefined>`

##### max

**Signature**: `async max(compareFn?: (a: T, b: T) => number): Promise<T | undefined>`

#### Map

**Properties**:

- `_items: any` - 
- `lock: any` - 

**Methods**:

##### set

**Signature**: `async set(key: K, value: V): Promise<void>`

##### get

**Signature**: `async get(key: K): Promise<V | undefined>`

##### entries

**Signature**: `async entries(): Promise<[K, V][]>`

##### clear

**Signature**: `async clear(): Promise<void>`

#### Mutex

**Properties**:

- `promise: Promise<void>` - 

**Methods**:

##### acquire

**Signature**: `async acquire(): Promise<void>`

##### release

**Signature**: `release(): void`

##### acquireWithTimeout

**Signature**: `async acquireWithTimeout(timeoutMs: number): Promise<boolean>`

#### Set

**Properties**:

- `items: any` - 
- `lock: any` - 

**Methods**:

##### add

**Signature**: `async add(item: T): Promise<void>`

##### has

**Signature**: `async has(item: T): Promise<boolean>`

##### delete

**Signature**: `async delete(item: T): Promise<boolean>`

##### clear

**Signature**: `async clear(): Promise<void>`

##### toArray

**Signature**: `async toArray(): Promise<T[]>`

##### union

**Signature**: `async union(other: Set<T>): Promise<Set<T>>`

##### intersection

**Signature**: `async intersection(other: Set<T>): Promise<Set<T>>`

##### difference

**Signature**: `async difference(other: Set<T>): Promise<Set<T>>`

#### PriorityQueue

**Properties**:

- `heap: Array<{ item: T; priority: number }>` - 
- `lock: any` - 

**Methods**:

##### enqueue

**Signature**: `async enqueue(item: T, priority: number): Promise<void>`

##### dequeue

**Signature**: `async dequeue(): Promise<T | undefined>`

##### peek

**Signature**: `async peek(): Promise<T | undefined>`

##### heapifyUp

**Signature**: `private heapifyUp(index: number): void`

##### heapifyDown

**Signature**: `private heapifyDown(index: number): void`

#### Graph

**Properties**:

- `nodes: any` - 
- `adjacencyList: any` - 
- `edges: any` - 
- `lock: any` - 

**Methods**:

##### addNode

**Signature**: `async addNode(id: string, data: T): Promise<void>`

##### addEdge

**Signature**: `async addEdge(from: string, to: string, weight?: number): Promise<void>`

##### getNode

**Signature**: `async getNode(id: string): Promise<GraphNode<T> | undefined>`

##### getNeighbors

**Signature**: `async getNeighbors(nodeId: string): Promise<string[]>`

##### hasPath

**Signature**: `async hasPath(from: string, to: string): Promise<boolean>`

##### shortestPath

**Signature**: `async shortestPath(from: string, to: string): Promise<string[] | null>`

##### getAllNodes

**Signature**: `async getAllNodes(): Promise<GraphNode<T>[]>`

##### getAllEdges

**Signature**: `async getAllEdges(): Promise<GraphEdge[]>`

#### TreeNode

#### BinarySearchTree

**Properties**:

- `root: TreeNode<T> | null` - 
- `lock: any` - 
- `compareFn: (a: T, b: T) => number` - 

**Methods**:

##### insert

**Signature**: `async insert(value: T): Promise<void>`

##### insertNode

**Signature**: `private insertNode(node: TreeNode<T> | null, value: T): TreeNode<T>`

##### search

**Signature**: `async search(value: T): Promise<boolean>`

##### searchNode

**Signature**: `private searchNode(node: TreeNode<T> | null, value: T): boolean`

##### inorderTraversal

**Signature**: `async inorderTraversal(): Promise<T[]>`

##### inorderHelper

**Signature**: `private inorderHelper(node: TreeNode<T> | null, result: T[]): void`

##### preorderTraversal

**Signature**: `async preorderTraversal(): Promise<T[]>`

##### preorderHelper

**Signature**: `private preorderHelper(node: TreeNode<T> | null, result: T[]): void`

##### postorderTraversal

**Signature**: `async postorderTraversal(): Promise<T[]>`

##### postorderHelper

**Signature**: `private postorderHelper(node: TreeNode<T> | null, result: T[]): void`

##### min

**Signature**: `async min(): Promise<T | null>`

##### findMin

**Signature**: `private findMin(node: TreeNode<T> | null): TreeNode<T> | null`

##### max

**Signature**: `async max(): Promise<T | null>`

##### findMax

**Signature**: `private findMax(node: TreeNode<T> | null): TreeNode<T> | null`

### Interfaces

#### GraphNode

**Properties**:

- `id: string` - 
- `data: T` - 

#### GraphEdge

**Properties**:

- `from: string` - 
- `to: string` - 
- `weight: number` - 


