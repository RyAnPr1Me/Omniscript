import { debug } from "../debug";

export interface ParsedUrl {
  protocol: string;
  hostname: string;
  port: string;
  pathname: string;
  search: string;
  hash: string;
  searchParams: Map<string, string>;
}

export interface UrlBuilderOptions {
  encode?: boolean;
  arrayFormat?: "brackets" | "indices" | "comma";
}

export class UrlUtils {
  /**
   * Parse URL string into components
   */
  static parse(url: string): ParsedUrl {
    try {
      const parsed = new URL(url);
      const searchParams = new Map<string, string>();

      // Parse search parameters
      for (const [key, value] of parsed.searchParams.entries()) {
        searchParams.set(key, value);
      }

      return {
        protocol: parsed.protocol,
        hostname: parsed.hostname,
        port: parsed.port,
        pathname: parsed.pathname,
        search: parsed.search,
        hash: parsed.hash,
        searchParams,
      };
    } catch (error) {
      debug.error("UrlUtils", `Failed to parse URL: ${error}`);
      throw new Error(`Invalid URL: ${url}`);
    }
  }

  /**
   * Build URL from components
   */
  static build(
    components: Partial<ParsedUrl>,
    options?: UrlBuilderOptions,
  ): string {
    try {
      const {
        protocol = "https:",
        hostname = "localhost",
        port = "",
        pathname = "/",
        hash = "",
        searchParams = new Map(),
      } = components;

      let url = `${protocol}//${hostname}`;

      if (port) {
        url += `:${port}`;
      }

      url += pathname;

      // Build query string
      if (searchParams.size > 0) {
        const params = new URLSearchParams();
        for (const [key, value] of searchParams) {
          params.append(key, value);
        }
        url += `?${params.toString()}`;
      }

      if (hash) {
        url += hash.startsWith("#") ? hash : `#${hash}`;
      }

      return url;
    } catch (error) {
      debug.error("UrlUtils", `Failed to build URL: ${error}`);
      throw new Error(`Failed to build URL from components`);
    }
  }

  /**
   * Join URL paths correctly
   */
  static join(...paths: string[]): string {
    if (paths.length === 0) return "";

    // Handle absolute URLs
    if (paths[0].includes("://")) {
      const [base, ...rest] = paths;
      const url = new URL(base);
      url.pathname = this.joinPaths(url.pathname, ...rest);
      return url.toString();
    }

    return this.joinPaths(...paths);
  }

  /**
   * Join just the path components
   */
  private static joinPaths(...paths: string[]): string {
    return paths
      .map((path, index) => {
        // Remove leading slash except for first path
        if (index > 0 && path.startsWith("/")) {
          path = path.slice(1);
        }
        // Remove trailing slash except for last path if it originally had one
        if (index < paths.length - 1 && path.endsWith("/")) {
          path = path.slice(0, -1);
        }
        return path;
      })
      .filter((path) => path.length > 0)
      .join("/");
  }

  /**
   * Add or update query parameters
   */
  static addParams(
    url: string,
    params: Record<string, string | number | boolean>,
  ): string {
    const parsed = new URL(url);

    for (const [key, value] of Object.entries(params)) {
      parsed.searchParams.set(key, String(value));
    }

    return parsed.toString();
  }

  /**
   * Remove query parameters
   */
  static removeParams(url: string, ...keys: string[]): string {
    const parsed = new URL(url);

    for (const key of keys) {
      parsed.searchParams.delete(key);
    }

    return parsed.toString();
  }

  /**
   * Get specific query parameter value
   */
  static getParam(url: string, key: string): string | null {
    try {
      const parsed = new URL(url);
      return parsed.searchParams.get(key);
    } catch {
      return null;
    }
  }

  /**
   * Get all query parameters as object
   */
  static getParams(url: string): Record<string, string> {
    try {
      const parsed = new URL(url);
      const params: Record<string, string> = {};

      for (const [key, value] of parsed.searchParams.entries()) {
        params[key] = value;
      }

      return params;
    } catch {
      return {};
    }
  }

  /**
   * Check if URL is absolute
   */
  static isAbsolute(url: string): boolean {
    return /^https?:\/\//.test(url);
  }

  /**
   * Check if URL is relative
   */
  static isRelative(url: string): boolean {
    return !this.isAbsolute(url);
  }

  /**
   * Convert relative URL to absolute
   */
  static toAbsolute(relativeUrl: string, baseUrl: string): string {
    try {
      return new URL(relativeUrl, baseUrl).toString();
    } catch (error) {
      debug.error("UrlUtils", `Failed to convert to absolute URL: ${error}`);
      throw new Error(
        `Failed to convert "${relativeUrl}" to absolute URL with base "${baseUrl}"`,
      );
    }
  }

  /**
   * Normalize URL (remove redundant parts, standardize format)
   */
  static normalize(url: string): string {
    try {
      const parsed = new URL(url);

      // Normalize pathname (remove redundant slashes, resolve .. and .)
      const pathParts = parsed.pathname
        .split("/")
        .filter((part) => part !== "");
      const normalizedParts: string[] = [];

      for (const part of pathParts) {
        if (part === "..") {
          normalizedParts.pop();
        } else if (part !== ".") {
          normalizedParts.push(part);
        }
      }

      parsed.pathname = "/" + normalizedParts.join("/");

      // Sort query parameters for consistency
      const sortedParams = new URLSearchParams();
      const keys = Array.from(parsed.searchParams.keys()).sort();
      for (const key of keys) {
        const values = parsed.searchParams.getAll(key);
        for (const value of values) {
          sortedParams.append(key, value);
        }
      }

      parsed.search = sortedParams.toString();

      return parsed.toString();
    } catch (error) {
      debug.error("UrlUtils", `Failed to normalize URL: ${error}`);
      throw new Error(`Failed to normalize URL: ${url}`);
    }
  }

  /**
   * Extract domain from URL
   */
  static getDomain(url: string): string {
    try {
      return new URL(url).hostname;
    } catch {
      return "";
    }
  }

  /**
   * Extract subdomain from URL
   */
  static getSubdomain(url: string): string {
    try {
      const hostname = new URL(url).hostname;
      const parts = hostname.split(".");

      // Return subdomain only if there are more than 2 parts (e.g., api.example.com)
      if (parts.length > 2) {
        return parts.slice(0, -2).join(".");
      }

      return "";
    } catch {
      return "";
    }
  }

  /**
   * Extract root domain (without subdomain)
   */
  static getRootDomain(url: string): string {
    try {
      const hostname = new URL(url).hostname;
      const parts = hostname.split(".");

      // Return last two parts (e.g., example.com from api.example.com)
      if (parts.length >= 2) {
        return parts.slice(-2).join(".");
      }

      return hostname;
    } catch {
      return "";
    }
  }

  /**
   * Check if two URLs are from the same domain
   */
  static isSameDomain(url1: string, url2: string): boolean {
    try {
      const domain1 = new URL(url1).hostname;
      const domain2 = new URL(url2).hostname;
      return domain1 === domain2;
    } catch {
      return false;
    }
  }

  /**
   * Encode URL component
   */
  static encode(component: string): string {
    return encodeURIComponent(component);
  }

  /**
   * Decode URL component
   */
  static decode(component: string): string {
    try {
      return decodeURIComponent(component);
    } catch {
      return component;
    }
  }

  /**
   * Validate URL format
   */
  static isValid(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Extract file extension from URL path
   */
  static getExtension(url: string): string {
    try {
      const pathname = new URL(url).pathname;
      const lastDot = pathname.lastIndexOf(".");
      const lastSlash = pathname.lastIndexOf("/");

      if (lastDot > lastSlash && lastDot !== -1) {
        return pathname.slice(lastDot + 1);
      }

      return "";
    } catch {
      return "";
    }
  }

  /**
   * Extract filename from URL path
   */
  static getFilename(url: string): string {
    try {
      const pathname = new URL(url).pathname;
      const lastSlash = pathname.lastIndexOf("/");

      if (lastSlash !== -1) {
        return pathname.slice(lastSlash + 1);
      }

      return pathname;
    } catch {
      return "";
    }
  }

  /**
   * Create URL-safe slug from string
   */
  static slug(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  /**
   * Parse query string into object
   */
  static parseQuery(queryString: string): Record<string, string | string[]> {
    const params: Record<string, string | string[]> = {};
    const searchParams = new URLSearchParams(queryString);

    for (const [key, value] of searchParams.entries()) {
      if (key in params) {
        // Convert to array if multiple values
        const existing = params[key];
        if (Array.isArray(existing)) {
          existing.push(value);
        } else {
          params[key] = [existing, value];
        }
      } else {
        params[key] = value;
      }
    }

    return params;
  }

  /**
   * Build query string from object
   */
  static buildQuery(
    params: Record<string, any>,
    options?: UrlBuilderOptions,
  ): string {
    const searchParams = new URLSearchParams();
    const { arrayFormat = "brackets" } = options || {};

    for (const [key, value] of Object.entries(params)) {
      if (Array.isArray(value)) {
        for (let i = 0; i < value.length; i++) {
          let paramKey = key;

          switch (arrayFormat) {
            case "brackets":
              paramKey = `${key}[]`;
              break;
            case "indices":
              paramKey = `${key}[${i}]`;
              break;
            case "comma":
              if (i === 0) {
                searchParams.set(key, value.join(","));
                continue;
              } else {
                continue;
              }
          }

          searchParams.append(paramKey, String(value[i]));
        }
      } else if (value !== null && value !== undefined) {
        searchParams.set(key, String(value));
      }
    }

    return searchParams.toString();
  }
}

// Export URL class for convenience
export { UrlUtils as URL };

// Builder pattern for URLs
export class UrlBuilder {
  private components: Partial<ParsedUrl> = {
    searchParams: new Map(),
  };

  constructor(base?: string) {
    if (base) {
      this.components = UrlUtils.parse(base);
    }
  }

  protocol(protocol: string): this {
    this.components.protocol = protocol.endsWith(":")
      ? protocol
      : `${protocol}:`;
    return this;
  }

  hostname(hostname: string): this {
    this.components.hostname = hostname;
    return this;
  }

  port(port: number | string): this {
    this.components.port = String(port);
    return this;
  }

  path(pathname: string): this {
    this.components.pathname = pathname.startsWith("/")
      ? pathname
      : `/${pathname}`;
    return this;
  }

  param(key: string, value: string | number | boolean): this {
    this.components.searchParams!.set(key, String(value));
    return this;
  }

  params(params: Record<string, string | number | boolean>): this {
    for (const [key, value] of Object.entries(params)) {
      this.components.searchParams!.set(key, String(value));
    }
    return this;
  }

  hash(hash: string): this {
    this.components.hash = hash.startsWith("#") ? hash : `#${hash}`;
    return this;
  }

  build(): string {
    return UrlUtils.build(this.components);
  }

  toString(): string {
    return this.build();
  }
}
