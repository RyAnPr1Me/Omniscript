import { OmniscriptError } from '../errors';

export class HTTP {
  // New: Debug flag and method to enable debugging
  private static debugEnabled: boolean = false;
  static enableDebugging(enabled: boolean = true): void {
    HTTP.debugEnabled = enabled;
  }

  static async get(url: string, headers?: Record<string, string>): Promise<Response> {
    const start = HTTP.debugEnabled ? performance.now() : 0;
    const response = await fetch(url, { headers });
    if (HTTP.debugEnabled) {
      console.debug(`[HTTP] GET ${url} took ${performance.now() - start}ms`);
    }
    return response;
  }

  static async post(url: string, body: any, headers?: Record<string, string>): Promise<Response> {
    const start = HTTP.debugEnabled ? performance.now() : 0;
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json', ...headers }
    });
    if (HTTP.debugEnabled) {
      console.debug(`[HTTP] POST ${url} took ${performance.now() - start}ms`);
    }
    return response;
  }

  static async put(url: string, body: any, headers?: Record<string, string>): Promise<Response> {
    const start = HTTP.debugEnabled ? performance.now() : 0;
    const response = await fetch(url, {
      method: 'PUT',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json', ...headers }
    });
    if (HTTP.debugEnabled) {
      console.debug(`[HTTP] PUT ${url} took ${performance.now() - start}ms`);
    }
    return response;
  }

  static async delete(url: string, headers?: Record<string, string>): Promise<Response> {
    const start = HTTP.debugEnabled ? performance.now() : 0;
    const response = await fetch(url, {
      method: 'DELETE',
      headers
    });
    if (HTTP.debugEnabled) {
      console.debug(`[HTTP] DELETE ${url} took ${performance.now() - start}ms`);
    }
    return response;
  }
}

export class WebSocket {
  private ws: globalThis.WebSocket;
  // New: Instance debug flag with helper method
  private debugEnabled: boolean = false;
  enableDebugging(enabled: boolean = true): void {
    this.debugEnabled = enabled;
  }

  constructor(url: string) {
    this.ws = new globalThis.WebSocket(url);
    // New: Log connection open if debugging is enabled
    this.ws.onopen = () => {
      if (this.debugEnabled) {
        console.debug(`[WebSocket] Connected to ${url}`);
      }
    };
  }

  onMessage(callback: (data: any) => void): void {
    this.ws.onmessage = (event) => {
      if (this.debugEnabled) {
        console.debug("[WebSocket] Received raw event:", event.data);
      }
      callback(event.data);
    };
  }

  // Existing onEvent now enhanced with debug logging
  onEvent(eventType: string, callback: (data: any) => void): void {
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (this.debugEnabled) {
        console.debug(`[WebSocket] onEvent [${eventType}] received:`, data);
      }
      if (data.type === eventType) {
        callback(data);
      }
    };
  }

  send(data: any): void {
    if (this.debugEnabled) {
      console.debug("[WebSocket] Sending:", data);
    }
    this.ws.send(JSON.stringify(data));
  }

  close(): void {
    if (this.debugEnabled) {
      console.debug("[WebSocket] Closing connection");
    }
    this.ws.close();
  }
}

// New: EventSourcingServer now supports debug logging.
export class EventSourcingServer {
  private clients: globalThis.WebSocket[] = [];
  private debugEnabled: boolean = false;

  constructor(private url: string) {
    // Integration with a WebSocket server
  }

  enableDebugging(enabled: boolean = true): void {
    this.debugEnabled = enabled;
  }

  broadcastEvent(event: { type: string; payload: any }): void {
    const msg = JSON.stringify(event);
    if (this.debugEnabled) {
      console.debug(`[EventSourcingServer] Broadcasting event:`, event);
    }
    this.clients.forEach(client => client.send(msg));
  }

  addClient(client: globalThis.WebSocket): void {
    if (this.debugEnabled) {
      console.debug("[EventSourcingServer] Adding new client");
    }
    this.clients.push(client);
  }
}

export class AsyncUtils {
  static async withTimeout<T>(promise: Promise<T>, timeout: number): Promise<T> {
    let timeoutHandle: NodeJS.Timeout;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutHandle = setTimeout(() => reject(new OmniscriptError('Operation timed out')), timeout);
    });

    return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutHandle));
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
      console.error('Async error propagated:', error);
      throw error;
    }
  }
}
