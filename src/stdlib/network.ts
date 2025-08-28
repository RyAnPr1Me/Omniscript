import { OmniscriptError } from '../errors';
import { debug } from '../debug';

export class HTTP {
  static enableDebugging(enabled: boolean = true): void {
    if (enabled) {
      debug.enableComponent('HTTP');
    } else {
      debug.disableComponent('HTTP');
    }
  }

  static async get(url: string, headers?: Record<string, string>): Promise<Response> {
    debug.time('HTTP', `GET ${url}`);
    const response = await fetch(url, { headers });
    debug.timeEnd('HTTP', `GET ${url}`);
    debug.debug('HTTP', `GET ${url} status: ${response.status}`);
    return response;
  }

  static async post(url: string, body: any, headers?: Record<string, string>): Promise<Response> {
    debug.time('HTTP', `POST ${url}`);
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json', ...headers }
    });
    debug.timeEnd('HTTP', `POST ${url}`);
    debug.debug('HTTP', `POST ${url} status: ${response.status}`);
    return response;
  }

  static async put(url: string, body: any, headers?: Record<string, string>): Promise<Response> {
    debug.time('HTTP', `PUT ${url}`);
    const response = await fetch(url, {
      method: 'PUT',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json', ...headers }
    });
    debug.timeEnd('HTTP', `PUT ${url}`);
    debug.debug('HTTP', `PUT ${url} status: ${response.status}`);
    return response;
  }

  static async delete(url: string, headers?: Record<string, string>): Promise<Response> {
    debug.time('HTTP', `DELETE ${url}`);
    const response = await fetch(url, {
      method: 'DELETE',
      headers
    });
    debug.timeEnd('HTTP', `DELETE ${url}`);
    debug.debug('HTTP', `DELETE ${url} status: ${response.status}`);
    return response;
  }
}

export class WebSocket {
  private ws: globalThis.WebSocket;

  enableDebugging(enabled: boolean = true): void {
    if (enabled) {
      debug.enableComponent('WebSocket');
    } else {
      debug.disableComponent('WebSocket');
    }
  }

  constructor(url: string) {
    this.ws = new globalThis.WebSocket(url);
    this.ws.onopen = () => {
      debug.info('WebSocket', `Connected to ${url}`);
    };
  }

  onMessage(callback: (data: any) => void): void {
    this.ws.onmessage = (event) => {
      debug.debug('WebSocket', 'Received raw event:', event.data);
      callback(event.data);
    };
  }

  // Existing onEvent now enhanced with debug logging
  onEvent(eventType: string, callback: (data: any) => void): void {
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      debug.debug('WebSocket', `onEvent [${eventType}] received:`, data);
      if (data.type === eventType) {
        callback(data);
      }
    };
  }

  send(data: any): void {
    debug.debug('WebSocket', 'Sending:', data);
    this.ws.send(JSON.stringify(data));
  }

  close(): void {
    debug.info('WebSocket', 'Closing connection');
    this.ws.close();
  }
}

// New: EventSourcingServer now supports debug logging.
export class EventSourcingServer {
  private clients: globalThis.WebSocket[] = [];

  constructor(private url: string) {
    // Integration with a WebSocket server
  }

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
    this.clients.forEach(client => client.send(msg));
  }

  addClient(client: globalThis.WebSocket): void {
    debug.info('EventSourcingServer', 'Adding new client');
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
