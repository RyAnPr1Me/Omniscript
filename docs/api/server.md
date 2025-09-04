# API Documentation

Auto-generated API documentation for Omniscript.

## Table of Contents

- [server](#server)

## server

**File**: `/home/runner/work/Omniscript/Omniscript/src/stdlib/http/server.ts`

### Classes

#### HTTPServer

**Properties**:

- `routes: Route[]` - 
- `middlewares: Middleware[]` - 
- `server: ReturnType<typeof createServer>` - 

**Methods**:

##### use

**Signature**: `use(middleware: Middleware): void`

##### get

**Signature**: `get(path: string, handler: RouteHandler): void`

##### post

**Signature**: `post(path: string, handler: RouteHandler): void`

##### put

**Signature**: `put(path: string, handler: RouteHandler): void`

##### delete

**Signature**: `delete(path: string, handler: RouteHandler): void`

##### patch

**Signature**: `patch(path: string, handler: RouteHandler): void`

##### addRoute

**Signature**: `private addRoute(method: string, path: string, handler: RouteHandler): void`

##### pathToRegex

**Signature**: `private pathToRegex(path: string):`

##### parseBody

**Signature**: `private async parseBody(req: IncomingMessage): Promise<any>`

##### parseQuery

**Signature**: `private parseQuery(url: string): Record<string, string>`

##### enhanceResponse

**Signature**: `private enhanceResponse(res: ServerResponse): Response`

##### runMiddlewares

**Signature**: `private async runMiddlewares(req: Request, res: Response): Promise<boolean>`

##### matchRoute

**Signature**: `private matchRoute(method: string, pathname: string):`

##### listen

**Signature**: `listen(port: number, hostname?: string, callback?: () => void): void`

##### close

**Signature**: `close(): Promise<void>`

#### Server

**Extends**: `HTTPServer`

### Interfaces

#### Request

**Extends**: `IncomingMessage`

**Properties**:

- `body: any` - 
- `params: Record<string, string>` - 
- `query: Record<string, string>` - 

#### Response

**Extends**: `ServerResponse`

**Methods**:

##### send

**Signature**: `send(data: any): void;`

##### json

**Signature**: `json(data: any): void;`

##### status

**Signature**: `status(code: number): Response;`

#### Route

**Properties**:

- `method: string` - 
- `path: string` - 
- `handler: RouteHandler` - 
- `pathRegex: RegExp` - 
- `paramNames: string[]` - 

### Functions

#### createHTTPServer

**Signature**: `export function createHTTPServer(): HTTPServer`


