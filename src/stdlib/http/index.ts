import { HTTPClient } from './client';
import { HTTPServer, Server, createHTTPServer } from './server';

export { HTTPClient } from './client';
export { HTTPServer, Server, createHTTPServer } from './server';
export type { Request, Response, RouteHandler, Middleware } from './server';

// Namespace for backward compatibility with README examples
export namespace HTTP {
  export const Client = HTTPClient;
  export const Server = HTTPServer;
}