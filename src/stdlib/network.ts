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

  send(data: any): void {
    this.ws.send(JSON.stringify(data));
  }

  close(): void {
    this.ws.close();
  }
}
