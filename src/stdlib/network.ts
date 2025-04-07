export class HTTP {
  static async get(url: string, headers?: Record<string, string>): Promise<Response> {
    return fetch(url, { headers });
  }

  static async post(url: string, body: any, headers?: Record<string, string>): Promise<Response> {
    return fetch(url, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json', ...headers }
    });
  }

  static async put(url: string, body: any, headers?: Record<string, string>): Promise<Response> {
    return fetch(url, {
      method: 'PUT',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json', ...headers }
    });
  }

  static async delete(url: string, headers?: Record<string, string>): Promise<Response> {
    return fetch(url, {
      method: 'DELETE',
      headers
    });
  }
}

export class WebSocket {
  private ws: globalThis.WebSocket;

  constructor(url: string) {
    this.ws = new globalThis.WebSocket(url);
  }

  onMessage(callback: (data: any) => void): void {
    this.ws.onmessage = (event) => callback(event.data);
  }

  // New: subscribe for specific event types (assumes event payload includes a type field)
  onEvent(eventType: string, callback: (data: any) => void): void {
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === eventType) {
        callback(data);
      }
    };
  }

  send(data: any): void {
    this.ws.send(JSON.stringify(data));
  }

  close(): void {
    this.ws.close();
  }
}

// New: EventSourcingServer built atop WebSocket to emit and source event streams.
export class EventSourcingServer {
  private clients: globalThis.WebSocket[] = [];

  constructor(private url: string) {
    // Integration with a WebSocket server
  }

  broadcastEvent(event: { type: string; payload: any }): void {
    const msg = JSON.stringify(event);
    this.clients.forEach(client => client.send(msg));
  }

  addClient(client: globalThis.WebSocket): void {
    this.clients.push(client);
  }
}
