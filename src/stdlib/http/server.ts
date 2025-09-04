import { IncomingMessage, ServerResponse, createServer } from "http";
import { debug } from "../../debug";

export interface Request extends IncomingMessage {
  body?: any;
  params?: Record<string, string>;
  query?: Record<string, string>;
}

export interface Response extends ServerResponse {
  send(data: any): void;
  json(data: any): void;
  status(code: number): Response;
}

export type RouteHandler = (
  req: Request,
  res: Response,
) => void | Promise<void>;
export type Middleware = (
  req: Request,
  res: Response,
  next: () => void,
) => void | Promise<void>;

interface Route {
  method: string;
  path: string;
  handler: RouteHandler;
  pathRegex: RegExp;
  paramNames: string[];
}

export class HTTPServer {
  private routes: Route[] = [];
  private middlewares: Middleware[] = [];
  private server?: ReturnType<typeof createServer>;

  constructor() {
    debug.info("HTTP", "HTTP Server initialized");
  }

  // Middleware support
  use(middleware: Middleware): void {
    this.middlewares.push(middleware);
    debug.debug("HTTP", "Middleware added");
  }

  // Route registration methods
  get(path: string, handler: RouteHandler): void {
    this.addRoute("GET", path, handler);
  }

  post(path: string, handler: RouteHandler): void {
    this.addRoute("POST", path, handler);
  }

  put(path: string, handler: RouteHandler): void {
    this.addRoute("PUT", path, handler);
  }

  delete(path: string, handler: RouteHandler): void {
    this.addRoute("DELETE", path, handler);
  }

  patch(path: string, handler: RouteHandler): void {
    this.addRoute("PATCH", path, handler);
  }

  private addRoute(method: string, path: string, handler: RouteHandler): void {
    const { pathRegex, paramNames } = this.pathToRegex(path);

    const route: Route = {
      method,
      path,
      handler,
      pathRegex,
      paramNames,
    };

    this.routes.push(route);
    debug.debug("HTTP", `Route registered: ${method} ${path}`);
  }

  private pathToRegex(path: string): {
    pathRegex: RegExp;
    paramNames: string[];
  } {
    const paramNames: string[] = [];
    const regexPath = path
      .replace(/\/:([^/]+)/g, (_, paramName) => {
        paramNames.push(paramName);
        return "/([^/]+)";
      })
      .replace(/\*/g, ".*");

    return {
      pathRegex: new RegExp(`^${regexPath}$`),
      paramNames,
    };
  }

  private async parseBody(req: IncomingMessage): Promise<any> {
    return new Promise((resolve) => {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk.toString();
      });
      req.on("end", () => {
        try {
          const contentType = req.headers["content-type"];
          if (contentType && contentType.includes("application/json")) {
            resolve(JSON.parse(body));
          } else {
            resolve(body);
          }
        } catch {
          resolve(body);
        }
      });
    });
  }

  private parseQuery(url: string): Record<string, string> {
    const queryString = url.split("?")[1];
    if (!queryString) return {};

    const params: Record<string, string> = {};
    queryString.split("&").forEach((param) => {
      const [key, value] = param.split("=");
      if (key) {
        params[decodeURIComponent(key)] = value
          ? decodeURIComponent(value)
          : "";
      }
    });

    return params;
  }

  private enhanceResponse(res: ServerResponse): Response {
    const enhancedRes = res as Response;

    enhancedRes.send = function (data: any) {
      if (typeof data === "string") {
        this.setHeader("Content-Type", "text/plain");
        this.end(data);
      } else {
        this.setHeader("Content-Type", "application/json");
        this.end(JSON.stringify(data));
      }
    };

    enhancedRes.json = function (data: any) {
      this.setHeader("Content-Type", "application/json");
      this.end(JSON.stringify(data));
    };

    enhancedRes.status = function (code: number): Response {
      this.statusCode = code;
      return this;
    };

    return enhancedRes;
  }

  private async runMiddlewares(req: Request, res: Response): Promise<boolean> {
    for (const middleware of this.middlewares) {
      let nextCalled = false;
      const next = () => {
        nextCalled = true;
      };

      try {
        await middleware(req, res, next);
        if (!nextCalled) {
          return false; // Middleware didn't call next()
        }
      } catch (error) {
        debug.error("HTTP", "Middleware error:", error);
        if (!res.headersSent) {
          res.status(500).send("Internal Server Error");
        }
        return false;
      }
    }
    return true;
  }

  private matchRoute(
    method: string,
    pathname: string,
  ): { route: Route; params: Record<string, string> } | null {
    for (const route of this.routes) {
      if (route.method !== method) continue;

      const match = pathname.match(route.pathRegex);
      if (match) {
        const params: Record<string, string> = {};
        route.paramNames.forEach((name, index) => {
          params[name] = match[index + 1];
        });

        return { route, params };
      }
    }

    return null;
  }

  listen(port: number, hostname?: string, callback?: () => void): void {
    this.server = createServer(async (req, res) => {
      try {
        const url = new URL(req.url || "/", `http://${req.headers.host}`);
        const pathname = url.pathname;

        // Parse request body
        const body = await this.parseBody(req);

        // Enhance request and response objects
        const enhancedReq = req as Request;
        enhancedReq.body = body;
        enhancedReq.query = this.parseQuery(req.url || "");

        const enhancedRes = this.enhanceResponse(res);

        // Run middlewares
        const shouldContinue = await this.runMiddlewares(
          enhancedReq,
          enhancedRes,
        );
        if (!shouldContinue) return;

        // Find matching route
        const routeMatch = this.matchRoute(req.method || "GET", pathname);

        if (routeMatch) {
          enhancedReq.params = routeMatch.params;

          try {
            await routeMatch.route.handler(enhancedReq, enhancedRes);
          } catch (error) {
            debug.error("HTTP", "Route handler error:", error);
            if (!enhancedRes.headersSent) {
              enhancedRes.status(500).send("Internal Server Error");
            }
          }
        } else {
          // No route found
          if (!enhancedRes.headersSent) {
            enhancedRes.status(404).send("Not Found");
          }
        }
      } catch (error) {
        debug.error("HTTP", "Request processing error:", error);
        if (!res.headersSent) {
          res.statusCode = 500;
          res.end("Internal Server Error");
        }
      }
    });

    this.server.listen(port, hostname, () => {
      debug.info("HTTP", `Server listening on port ${port}`);
      if (callback) callback();
    });
  }

  close(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.server) {
        this.server.close((err) => {
          if (err) reject(err);
          else resolve();
        });
      } else {
        resolve();
      }
    });
  }
}

// Legacy alias for backward compatibility
export class Server extends HTTPServer {}

// Export a convenience method for creating servers
export function createHTTPServer(): HTTPServer {
  return new HTTPServer();
}
