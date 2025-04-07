export class HTTPClient {
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor(baseUrl: string = '', headers: Record<string, string> = {}) {
    this.baseUrl = baseUrl;
    this.headers = headers;
  }

  async get<T>(path: string): Promise<T> {
    const response = await fetch(this.baseUrl + path, { headers: this.headers });
    return response.json();
  }

  async post<T>(path: string, body: any): Promise<T> {
    const response = await fetch(this.baseUrl + path, {
      method: 'POST',
      headers: { ...this.headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    return response.json();
  }
}
