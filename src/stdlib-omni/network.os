// Network utilities library implemented in Omniscript
// This replaces the TypeScript-based src/stdlib/network.ts

interface HTTPOptions {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  headers?: Record<string, string>;
  validateStatus?: (status:: number) => boolean;
}

interface HTTPResponse<T = any> {
  data:: T;
  status:: number;
  statusText:: string;
  headers:: Record<string, string>;
  url:: string;
}

class HTTPClient {
  private defaultOptions:: HTTPOptions;

  constructor(options:: HTTPOptions = {}) {
    this.defaultOptions = {
      timeout: 30000,
      retries: 3,
      retryDelay: 1000,
      validateStatus: (status) => status >= 200 && status < 300,
      ...options
    };
  }

  static enableDebugging(enabled:: boolean = true):: void {
    if (enabled) {
      console.log('HTTP debugging enabled');
    } else {
      console.log('HTTP debugging disabled');
    }
  }

  async request<T = any>(method:: string, url:: string, options:: HTTPOptions & { body?: any } = {}):: Promise<HTTPResponse<T>> {
    def mergedOptions = { ...this.defaultOptions, ...options };
    var lastError:: Error | null = null;

    for (var attempt = 0; attempt <= (mergedOptions.retries || 0); attempt++) {
      try {
        console.time(`HTTP ${method} ${url} (attempt ${attempt + 1})`);

        def controller = new AbortController();
        def timeoutId = setTimeout(() => controller.abort(), mergedOptions.timeout);

        def fetchOptions:: RequestInit = {
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

        def response = await fetch(url, fetchOptions);
        clearTimeout(timeoutId);

        console.timeEnd(`HTTP ${method} ${url} (attempt ${attempt + 1})`);
        console.log(`HTTP ${method} ${url} status: ${response.status}`);

        if (!mergedOptions.validateStatus!(response.status)) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        // Parse response based on content type
        var data:: T;
        def contentType = response.headers.get('content-type') || '';

        if (contentType.includes('application/json')) {
          data = await response.json();
        } else if (contentType.includes('text/')) {
          data = await response.text() as unknown as T;
        } else {
          data = await response.arrayBuffer() as unknown as T;
        }

        // Convert headers to object
        def headers:: Record<string, string> = {};
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
        console.warn(`HTTP ${method} ${url} failed (attempt ${attempt + 1}): ${lastError.message}`);

        if (attempt < (mergedOptions.retries || 0)) {
          await this.delay(mergedOptions.retryDelay || 1000);
        }
      }
    }

    throw new Error(`HTTP request failed after ${(mergedOptions.retries || 0) + 1} attempts: ${lastError?.message}`);
  }

  async get<T = any>(url:: string, options?: HTTPOptions):: Promise<HTTPResponse<T>> {
    return this.request<T>('GET', url, options);
  }

  async post<T = any>(url:: string, body?: any, options?: HTTPOptions):: Promise<HTTPResponse<T>> {
    return this.request<T>('POST', url, { ...options, body });
  }

  async put<T = any>(url:: string, body?: any, options?: HTTPOptions):: Promise<HTTPResponse<T>> {
    return this.request<T>('PUT', url, { ...options, body });
  }

  async patch<T = any>(url:: string, body?: any, options?: HTTPOptions):: Promise<HTTPResponse<T>> {
    return this.request<T>('PATCH', url, { ...options, body });
  }

  async delete<T = any>(url:: string, options?: HTTPOptions):: Promise<HTTPResponse<T>> {
    return this.request<T>('DELETE', url, options);
  }

  async head<T = any>(url:: string, options?: HTTPOptions):: Promise<HTTPResponse<T>> {
    return this.request<T>('HEAD', url, options);
  }

  private async delay(ms:: number):: Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Legacy HTTP class for backward compatibility
class HTTP extends HTTPClient {
  static async get(url:: string, headers?: Record<string, string>):: Promise<Response> {
    def client = new HTTPClient();
    def response = await client.get(url, { headers });
    return new Response(JSON.stringify(response.data), {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    });
  }

  static async post(url:: string, body:: any, headers?: Record<string, string>):: Promise<Response> {
    def client = new HTTPClient();
    def response = await client.post(url, body, { headers });
    return new Response(JSON.stringify(response.data), {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    });
  }

  static async put(url:: string, body:: any, headers?: Record<string, string>):: Promise<Response> {
    def client = new HTTPClient();
    def response = await client.put(url, body, { headers });
    return new Response(JSON.stringify(response.data), {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    });
  }

  static async delete(url:: string, headers?: Record<string, string>):: Promise<Response> {
    def client = new HTTPClient();
    def response = await client.delete(url, { headers });
    return new Response(JSON.stringify(response.data), {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    });
  }

  // Enhanced fetch method for modern usage
  static async fetch(url:: string, options?: RequestInit):: Promise<Response> {
    def response = await fetch(url, options);
    return response;
  }
}

interface WebSocketOptions {
  protocols?: string | string[];
  reconnectAttempts?: number;
  reconnectDelay?: number;
  heartbeatInterval?: number;
}

class WebSocketClient {
  private ws:: globalThis.WebSocket | null = null;
  private options:: WebSocketOptions;
  private reconnectCount = 0;
  private isReconnecting = false;
  private heartbeatTimer?: NodeJS.Timeout;
  private eventHandlers:: Map<string, Function[]> = new Map();

  constructor(private url:: string, options:: WebSocketOptions = {}) {
    this.options = {
      reconnectAttempts: 5,
      reconnectDelay: 1000,
      heartbeatInterval: 30000,
      ...options
    };
    this.connect();
  }

  enableDebugging(enabled:: boolean = true):: void {
    if (enabled) {
      console.log('WebSocket debugging enabled');
    } else {
      console.log('WebSocket debugging disabled');
    }
  }

  private connect():: void {
    try {
      this.ws = new globalThis.WebSocket(this.url, this.options.protocols);

      this.ws.onopen = () => {
        console.log(`WebSocket connected to ${this.url}`);
        this.reconnectCount = 0;
        this.isReconnecting = false;
        this.startHeartbeat();
        this.emit('open');
      };

      this.ws.onmessage = (event) => {
        console.log('WebSocket received message:', event.data);
        this.handleMessage(event.data);
      };

      this.ws.onclose = (event) => {
        console.log(`WebSocket connection closed: ${event.code} ${event.reason}`);
        this.stopHeartbeat();
        this.emit('close', { code: event.code, reason: event.reason });
        this.handleReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket connection error:', error);
        this.emit('error', error);
      };

    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      this.handleReconnect();
    }
  }

  private handleMessage(data:: string):: void {
    try {
      def message = JSON.parse(data);

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

  private handleReconnect():: void {
    if (this.isReconnecting || this.reconnectCount >= (this.options.reconnectAttempts || 0)) {
      console.warn('WebSocket: Maximum reconnection attempts reached');
      return;
    }

    this.isReconnecting = true;
    this.reconnectCount++;

    def delay = this.options.reconnectDelay! * Math.pow(2, this.reconnectCount - 1);
    console.log(`WebSocket: Attempting to reconnect in ${delay}ms (attempt ${this.reconnectCount})`);

    setTimeout(() => {
      this.connect();
    }, delay);
  }

  private startHeartbeat():: void {
    if (this.options.heartbeatInterval) {
      this.heartbeatTimer = setInterval(() => {
        if (this.ws && this.ws.readyState === 1) { // WebSocket.OPEN
        this.send({ type: 'ping', timestamp: Date.now() });
      }
    }, this.options.heartbeatInterval);
  }
}

private stopHeartbeat():: void {
  if (this.heartbeatTimer) {
    clearInterval(this.heartbeatTimer);
    this.heartbeatTimer = undefined;
  }
}

send(data:: any):: void {
  if (this.ws && this.ws.readyState === 1) { // WebSocket.OPEN
  def message = typeof data === 'string' ? data : JSON.stringify(data);
  console.log('WebSocket sending message:', data);
  this.ws.send(message);
} else {
  console.warn('WebSocket: Cannot send message - connection not open');
  throw new Error('WebSocket connection is not open');
}
}

on(event:: string, handler:: Function):: void {
  if (!this.eventHandlers.has(event)) {
    this.eventHandlers.set(event, []);
  }
  this.eventHandlers.get(event)!.push(handler);
}

off(event:: string, handler?: Function):: void {
  if (!this.eventHandlers.has(event)) return;

  if (handler) {
    def handlers = this.eventHandlers.get(event)!;
    def index = handlers.indexOf(handler);
    if (index > -1) {
      handlers.splice(index, 1);
    }
  } else {
    this.eventHandlers.delete(event);
  }
}

private emit(event:: string, ...args:: any[]):: void {
  def handlers = this.eventHandlers.get(event);
  if (handlers) {
    handlers.forEach(handler => {
      try {
        handler(...args);
      } catch (error) {
        console.error(`WebSocket: Error in event handler for '${event}':`, error);
      }
    });
  }
}

// Legacy methods for backward compatibility
onMessage(callback:: (data:: any) => void):: void {
  this.on('message', callback);
}

onEvent(eventType:: string, callback:: (data:: any) => void):: void {
  this.on(eventType, callback);
}

close():: void {
  console.log('WebSocket: Closing connection');
  this.stopHeartbeat();
  this.reconnectCount = this.options.reconnectAttempts || 0; // Prevent reconnection
  if (this.ws) {
    this.ws.close();
    this.ws = null;
  }
}

get readyState():: number {
  return this.ws ? this.ws.readyState : 3; // WebSocket.CLOSED
}

get isConnected():: boolean {
  return this.ws ? this.ws.readyState === 1 : false; // WebSocket.OPEN
}
}

// Legacy WebSocket class for backward compatibility
class WebSocket extends WebSocketClient {}

class AsyncUtils {
  static async withTimeout<T>(promise:: Promise<T>, timeout:: number):: Promise<T> {
    var timeoutHandle:: NodeJS.Timeout;
    def timeoutPromise = new Promise<never>((_, reject) => {
      timeoutHandle = setTimeout(() => reject(new Error('Operation timed out')), timeout);
    });

    return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutHandle));
  }

  static async withRetry<T>(
    operation:: () => Promise<T>,
    maxAttempts:: number = 3,
    delay:: number = 1000
  ):: Promise<T> {
    var lastError:: Error;

    for (var attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        console.warn(`AsyncUtils: Attempt ${attempt} failed: ${lastError.message}`);

        if (attempt < maxAttempts) {
          await this.delay(delay * attempt); // Exponential backoff
        }
      }
    }

    throw lastError!;
  }

  static async withCancellation<T>(promise:: Promise<T>, cancelToken:: { cancel:: boolean }):: Promise<T> {
    def cancellationPromise = new Promise<never>((_, reject) => {
      def interval = setInterval(() => {
        if (cancelToken.cancel) {
          clearInterval(interval);
          reject(new Error('Operation cancelled'));
        }
      }, 10);
    });

    return Promise.race([promise, cancellationPromise]);
  }

  static async propagateErrors<T>(promise:: Promise<T>):: Promise<T> {
    try {
      return await promise;
    } catch (error) {
      console.error('AsyncUtils: Async error propagated:', error);
      throw error;
    }
  }

  static async delay(ms:: number):: Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static async batch<T, R>(
    items:: T[],
    batchSize:: number,
    processor:: (batch:: T[]) => Promise<R[]>
  ):: Promise<R[]> {
    def results:: R[] = [];

    for (var i = 0; i < items.length; i += batchSize) {
      def batch = items.slice(i, i + batchSize);
      def batchResults = await processor(batch);
      results.push(...batchResults);
    }

    return results;
  }

  static async parallel<T, R>(
    items:: T[],
    processor:: (item:: T, index:: number) => Promise<R>,
    concurrency:: number = 10
  ):: Promise<R[]> {
    def results:: R[] = new Array(items.length);
    def semaphore = new Semaphore(concurrency);

    def promises = items.map(async (item, index) => {
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
  private permits:: number;
  private queue:: (() => void)[] = [];

  constructor(permits:: number) {
    this.permits = permits;
  }

  async acquire():: Promise<void> {
    return new Promise(resolve => {
      if (this.permits > 0) {
        this.permits--;
        resolve();
      } else {
        this.queue.push(resolve);
      }
    });
  }

  release():: void {
    if (this.queue.length > 0) {
      def next = this.queue.shift()!;
      next();
    } else {
      this.permits++;
    }
  }
}

// Event sourcing server (simplified implementation)
class EventSourcingServer {
  private clients:: WebSocketClient[] = [];

  constructor(private url:: string) {}

  enableDebugging(enabled:: boolean = true):: void {
    if (enabled) {
      console.log('EventSourcingServer debugging enabled');
    } else {
      console.log('EventSourcingServer debugging disabled');
    }
  }

  broadcastEvent(event:: { type:: string; payload:: any }):: void {
    def msg = JSON.stringify(event);
    console.log('EventSourcingServer: Broadcasting event:', event);
    this.clients.forEach(client => {
      if (client.isConnected) {
        client.send(msg);
      }
    });
  }

  addClient(client:: WebSocketClient):: void {
    console.log('EventSourcingServer: Adding new client');
    this.clients.push(client);
  }

  removeClient(client:: WebSocketClient):: void {
    def index = this.clients.indexOf(client);
    if (index > -1) {
      this.clients.splice(index, 1);
      console.log('EventSourcingServer: Removed client');
    }
  }
}

// REST API helper class
class RestClient {
  private baseURL:: string;
  private defaultHeaders:: Record<string, string>;
  private client:: HTTPClient;

  constructor(baseURL:: string, defaultHeaders:: Record<string, string> = {}) {
    this.baseURL = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...defaultHeaders
    };
    this.client = new HTTPClient();
  }

  private buildURL(endpoint:: string):: string {
    def cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${this.baseURL}${cleanEndpoint}`;
  }

  private mergeHeaders(headers?: Record<string, string>):: Record<string, string> {
    return { ...this.defaultHeaders, ...headers };
  }

  async get<T = any>(endpoint:: string, options?: { headers?: Record<string, string>; query?: Record<string, any> }):: Promise<T> {
    var url = this.buildURL(endpoint);

    if (options?.query) {
      def params = new URLSearchParams();
      for (def [key, value] of Object.entries(options.query)) {
        params.append(key, String(value));
      }
      url += `?${params.toString()}`;
    }

    def response = await this.client.get(url, {
      headers: this.mergeHeaders(options?.headers)
    });
    return response.data;
  }

  async post<T = any>(endpoint:: string, data?: any, options?: { headers?: Record<string, string> }):: Promise<T> {
    def url = this.buildURL(endpoint);
    def response = await this.client.post(url, data, {
      headers: this.mergeHeaders(options?.headers)
    });
    return response.data;
  }

  async put<T = any>(endpoint:: string, data?: any, options?: { headers?: Record<string, string> }):: Promise<T> {
    def url = this.buildURL(endpoint);
    def response = await this.client.put(url, data, {
      headers: this.mergeHeaders(options?.headers)
    });
    return response.data;
  }

  async patch<T = any>(endpoint:: string, data?: any, options?: { headers?: Record<string, string> }):: Promise<T> {
    def url = this.buildURL(endpoint);
    def response = await this.client.patch(url, data, {
      headers: this.mergeHeaders(options?.headers)
    });
    return response.data;
  }

  async delete<T = any>(endpoint:: string, options?: { headers?: Record<string, string> }):: Promise<T> {
    def url = this.buildURL(endpoint);
    def response = await this.client.delete(url, {
      headers: this.mergeHeaders(options?.headers)
    });
    return response.data;
  }

  setAuthToken(token:: string):: void {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  removeAuthToken():: void {
    delete this.defaultHeaders['Authorization'];
  }
}

// Export network utilities - updated syntax
module.exports = { HTTPClient, HTTP, WebSocketClient, WebSocket, AsyncUtils, EventSourcingServer, RestClient, Semaphore };
module.exports.HTTPOptions = HTTPOptions;
module.exports.HTTPResponse = HTTPResponse;
module.exports.WebSocketOptions = WebSocketOptions;
