import { OmniscriptError } from '../errors';
import { debug } from '../debug';

export interface HTTPOptions {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  headers?: Record<string, string>;
  validateStatus?: (status: number) => boolean;
}

export interface HTTPResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  url: string;
}

export class HTTPClient {
  private defaultOptions: HTTPOptions;

  constructor(options: HTTPOptions = {}) {
    this.defaultOptions = {
      timeout: 30000,
      retries: 3,
      retryDelay: 1000,
      validateStatus: (status) => status >= 200 && status < 300,
      ...options
    };
  }

  static enableDebugging(enabled: boolean = true): void {
    if (enabled) {
      debug.enableComponent('HTTP');
    } else {
      debug.disableComponent('HTTP');
    }
  }

  async request<T = any>(method: string, url: string, options: HTTPOptions & { body?: any } = {}): Promise<HTTPResponse<T>> {
    const mergedOptions = { ...this.defaultOptions, ...options };
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= (mergedOptions.retries || 0); attempt++) {
      try {
        debug.time('HTTP', `${method} ${url} (attempt ${attempt + 1})`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), mergedOptions.timeout);

        const fetchOptions: RequestInit = {
          method,
          headers: mergedOptions.headers,
          signal: controller.signal
        };

        if (options.body) {
          if (typeof options.body === 'object') {
            fetchOptions.body = JSON.stringify(options.body);
            fetchOptions.headers = {
              'Content-Type': 'application/json',
              ...fetchOptions.headers
            };
          } else {
            fetchOptions.body = options.body;
          }
        }

        const response = await fetch(url, fetchOptions);
        clearTimeout(timeoutId);

        debug.timeEnd('HTTP', `${method} ${url} (attempt ${attempt + 1})`);
        debug.debug('HTTP', `${method} ${url} status: ${response.status}`);

        if (!mergedOptions.validateStatus!(response.status)) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        // Parse response based on content type
        let data: T;
        const contentType = response.headers.get('content-type') || '';
        
        if (contentType.includes('application/json')) {
          data = await response.json();
        } else if (contentType.includes('text/')) {
          data = await response.text() as unknown as T;
        } else {
          data = await response.arrayBuffer() as unknown as T;
        }

        // Convert headers to object
        const headers: Record<string, string> = {};
        response.headers.forEach((value, key) => {
          headers[key] = value;
        });

        return {
          data,
          status: response.status,
          statusText: response.statusText,
          headers,
          url: response.url
        };

      } catch (error) {
        lastError = error as Error;
        debug.warn('HTTP', `${method} ${url} failed (attempt ${attempt + 1}): ${lastError.message}`);
        
        if (attempt < (mergedOptions.retries || 0)) {
          await this.delay(mergedOptions.retryDelay || 1000);
        }
      }
    }

    throw new OmniscriptError(`HTTP request failed after ${(mergedOptions.retries || 0) + 1} attempts: ${lastError?.message}`);
  }

  async get<T = any>(url: string, options?: HTTPOptions): Promise<HTTPResponse<T>> {
    return this.request<T>('GET', url, options);
  }

  async post<T = any>(url: string, body?: any, options?: HTTPOptions): Promise<HTTPResponse<T>> {
    return this.request<T>('POST', url, { ...options, body });
  }

  async put<T = any>(url: string, body?: any, options?: HTTPOptions): Promise<HTTPResponse<T>> {
    return this.request<T>('PUT', url, { ...options, body });
  }

  async patch<T = any>(url: string, body?: any, options?: HTTPOptions): Promise<HTTPResponse<T>> {
    return this.request<T>('PATCH', url, { ...options, body });
  }

  async delete<T = any>(url: string, options?: HTTPOptions): Promise<HTTPResponse<T>> {
    return this.request<T>('DELETE', url, options);
  }

  async head<T = any>(url: string, options?: HTTPOptions): Promise<HTTPResponse<T>> {
    return this.request<T>('HEAD', url, options);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Legacy HTTP class for backward compatibility
export class HTTP extends HTTPClient {
  static async get(url: string, headers?: Record<string, string>): Promise<Response> {
    const client = new HTTPClient();
    const response = await client.get(url, { headers });
    return new Response(JSON.stringify(response.data), {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    });
  }

  static async post(url: string, body: any, headers?: Record<string, string>): Promise<Response> {
    const client = new HTTPClient();
    const response = await client.post(url, body, { headers });
    return new Response(JSON.stringify(response.data), {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    });
  }

  static async put(url: string, body: any, headers?: Record<string, string>): Promise<Response> {
    const client = new HTTPClient();
    const response = await client.put(url, body, { headers });
    return new Response(JSON.stringify(response.data), {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    });
  }

  static async delete(url: string, headers?: Record<string, string>): Promise<Response> {
    const client = new HTTPClient();
    const response = await client.delete(url, { headers });
    return new Response(JSON.stringify(response.data), {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    });
  }
}

export interface WebSocketOptions {
  protocols?: string | string[];
  reconnectAttempts?: number;
  reconnectDelay?: number;
  heartbeatInterval?: number;
}

export class WebSocketClient {
  private ws: globalThis.WebSocket | null = null;
  private options: WebSocketOptions;
  private reconnectCount = 0;
  private isReconnecting = false;
  private heartbeatTimer?: NodeJS.Timeout;
  private messageHandlers: Map<string, ((...args: any[]) => any)[]> = new Map();
  private eventHandlers: Map<string, ((...args: any[]) => any)[]> = new Map();

  constructor(private url: string, options: WebSocketOptions = {}) {
    this.options = {
      reconnectAttempts: 5,
      reconnectDelay: 1000,
      heartbeatInterval: 30000,
      ...options
    };
    this.connect();
  }

  enableDebugging(enabled: boolean = true): void {
    if (enabled) {
      debug.enableComponent('WebSocket');
    } else {
      debug.disableComponent('WebSocket');
    }
  }

  private connect(): void {
    try {
      this.ws = new globalThis.WebSocket(this.url, this.options.protocols);
      
      this.ws.onopen = () => {
        debug.info('WebSocket', `Connected to ${this.url}`);
        this.reconnectCount = 0;
        this.isReconnecting = false;
        this.startHeartbeat();
        this.emit('open');
      };

      this.ws.onmessage = (event) => {
        debug.debug('WebSocket', 'Received message:', event.data);
        this.handleMessage(event.data);
      };

      this.ws.onclose = (event) => {
        debug.info('WebSocket', `Connection closed: ${event.code} ${event.reason}`);
        this.stopHeartbeat();
        this.emit('close', { code: event.code, reason: event.reason });
        this.handleReconnect();
      };

      this.ws.onerror = (error) => {
        debug.error('WebSocket', 'Connection error:', error);
        this.emit('error', error);
      };

    } catch (error) {
      debug.error('WebSocket', 'Failed to create WebSocket:', error);
      this.handleReconnect();
    }
  }

  private handleMessage(data: string): void {
    try {
      const message = JSON.parse(data);
      
      // Handle structured messages with type
      if (message.type) {
        this.emit(message.type, message.payload || message);
      }
      
      // Handle all messages
      this.emit('message', message);
      
    } catch (error) {
      // Handle plain text messages
      this.emit('message', data);
    }
  }

  private handleReconnect(): void {
    if (this.isReconnecting || this.reconnectCount >= (this.options.reconnectAttempts || 0)) {
      debug.warn('WebSocket', 'Maximum reconnection attempts reached');
      return;
    }

    this.isReconnecting = true;
    this.reconnectCount++;
    
    const delay = this.options.reconnectDelay! * Math.pow(2, this.reconnectCount - 1);
    debug.info('WebSocket', `Attempting to reconnect in ${delay}ms (attempt ${this.reconnectCount})`);
    
    setTimeout(() => {
      this.connect();
    }, delay);
  }

  private startHeartbeat(): void {
    if (this.options.heartbeatInterval) {
      this.heartbeatTimer = setInterval(() => {
        if (this.ws && this.ws.readyState === 1) { // WebSocket.OPEN
          this.send({ type: 'ping', timestamp: Date.now() });
        }
      }, this.options.heartbeatInterval);
    }
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = undefined;
    }
  }

  send(data: any): void {
    if (this.ws && this.ws.readyState === 1) { // WebSocket.OPEN
      const message = typeof data === 'string' ? data : JSON.stringify(data);
      debug.debug('WebSocket', 'Sending message:', data);
      this.ws.send(message);
    } else {
      debug.warn('WebSocket', 'Cannot send message: connection not open');
      throw new Error('WebSocket connection is not open');
    }
  }

  on(event: string, handler: (...args: any[]) => any): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);
  }

  off(event: string, handler?: (...args: any[]) => any): void {
    if (!this.eventHandlers.has(event)) return;
    
    if (handler) {
      const handlers = this.eventHandlers.get(event)!;
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    } else {
      this.eventHandlers.delete(event);
    }
  }

  private emit(event: string, ...args: any[]): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(...args);
        } catch (error) {
          debug.error('WebSocket', `Error in event handler for '${event}':`, error);
        }
      });
    }
  }

  // Legacy methods for backward compatibility
  onMessage(callback: (data: any) => void): void {
    this.on('message', callback);
  }

  onEvent(eventType: string, callback: (data: any) => void): void {
    this.on(eventType, callback);
  }

  close(): void {
    debug.info('WebSocket', 'Closing connection');
    this.stopHeartbeat();
    this.reconnectCount = this.options.reconnectAttempts || 0; // Prevent reconnection
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  get readyState(): number {
    return this.ws ? this.ws.readyState : 3; // WebSocket.CLOSED
  }

  get isConnected(): boolean {
    return this.ws ? this.ws.readyState === 1 : false; // WebSocket.OPEN
  }
}

// Legacy WebSocket class for backward compatibility
export class WebSocket extends WebSocketClient {}

export class AsyncUtils {
  static async withTimeout<T>(promise: Promise<T>, timeout: number): Promise<T> {
    let timeoutHandle: NodeJS.Timeout;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutHandle = setTimeout(() => reject(new OmniscriptError('Operation timed out')), timeout);
    });

    return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutHandle));
  }

  static async withRetry<T>(
    operation: () => Promise<T>, 
    maxAttempts: number = 3, 
    delay: number = 1000
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        debug.warn('AsyncUtils', `Attempt ${attempt} failed: ${lastError.message}`);
        
        if (attempt < maxAttempts) {
          await this.delay(delay * attempt); // Exponential backoff
        }
      }
    }
    
    throw lastError!;
  }

  static async withCancellation<T>(promise: Promise<T>, cancelToken: { cancel: boolean }): Promise<T> {
    const cancellationPromise = new Promise<never>((_, reject) => {
      const interval = setInterval(() => {
        if (cancelToken.cancel) {
          clearInterval(interval);
          reject(new OmniscriptError('Operation cancelled'));
        }
      }, 10);
    });

    return Promise.race([promise, cancellationPromise]);
  }

  static async propagateErrors<T>(promise: Promise<T>): Promise<T> {
    try {
      return await promise;
    } catch (error) {
      debug.error('AsyncUtils', 'Async error propagated:', error);
      throw error;
    }
  }

  static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static async batch<T, R>(
    items: T[], 
    batchSize: number, 
    processor: (batch: T[]) => Promise<R[]>
  ): Promise<R[]> {
    const results: R[] = [];
    
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchResults = await processor(batch);
      results.push(...batchResults);
    }
    
    return results;
  }

  static async parallel<T, R>(
    items: T[], 
    processor: (item: T, index: number) => Promise<R>,
    concurrency: number = 10
  ): Promise<R[]> {
    const results: R[] = new Array(items.length);
    const semaphore = new Semaphore(concurrency);
    
    const promises = items.map(async (item, index) => {
      await semaphore.acquire();
      try {
        results[index] = await processor(item, index);
      } finally {
        semaphore.release();
      }
    });
    
    await Promise.all(promises);
    return results;
  }
}

class Semaphore {
  private permits: number;
  private queue: (() => void)[] = [];

  constructor(permits: number) {
    this.permits = permits;
  }

  async acquire(): Promise<void> {
    return new Promise(resolve => {
      if (this.permits > 0) {
        this.permits--;
        resolve();
      } else {
        this.queue.push(resolve);
      }
    });
  }

  release(): void {
    if (this.queue.length > 0) {
      const next = this.queue.shift()!;
      next();
    } else {
      this.permits++;
    }
  }
}

// Event sourcing server (simplified implementation)
export class EventSourcingServer {
  private clients: WebSocketClient[] = [];

  constructor(private url: string) {}

  enableDebugging(enabled: boolean = true): void {
    if (enabled) {
      debug.enableComponent('EventSourcingServer');
    } else {
      debug.disableComponent('EventSourcingServer');
    }
  }

  broadcastEvent(event: { type: string; payload: any }): void {
    const msg = JSON.stringify(event);
    debug.debug('EventSourcingServer', 'Broadcasting event:', event);
    this.clients.forEach(client => {
      if (client.isConnected) {
        client.send(msg);
      }
    });
  }

  addClient(client: WebSocketClient): void {
    debug.info('EventSourcingServer', 'Adding new client');
    this.clients.push(client);
  }

  removeClient(client: WebSocketClient): void {
    const index = this.clients.indexOf(client);
    if (index > -1) {
      this.clients.splice(index, 1);
      debug.info('EventSourcingServer', 'Removed client');
    }
  }
}
