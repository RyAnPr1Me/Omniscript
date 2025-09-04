import { debug } from "../debug";

export interface ParsedPath {
  root: string;
  dir: string;
  base: string;
  ext: string;
  name: string;
}

export class Path {
  /**
   * Path separator for the current platform
   */
  static get sep(): string {
    if (typeof process !== "undefined" && process.platform === "win32") {
      return "\\";
    }
    return "/";
  }

  /**
   * Path delimiter for the current platform
   */
  static get delimiter(): string {
    if (typeof process !== "undefined" && process.platform === "win32") {
      return ";";
    }
    return ":";
  }

  /**
   * Join path segments into a normalized path
   */
  static join(...paths: string[]): string {
    if (paths.length === 0) return ".";

    const joined = paths.filter((p) => p && p.length > 0).join(this.sep);
    return this.normalize(joined);
  }

  /**
   * Resolve path segments into an absolute path
   */
  static resolve(...paths: string[]): string {
    let resolved = "";
    let resolvedAbsolute = false;

    for (let i = paths.length - 1; i >= 0 && !resolvedAbsolute; i--) {
      const path = paths[i];
      if (!path || path.length === 0) continue;

      resolved = path + this.sep + resolved;
      resolvedAbsolute = this.isAbsolute(path);
    }

    if (!resolvedAbsolute) {
      resolved = this.getCurrentDirectory() + this.sep + resolved;
    }

    // Remove trailing separator unless it's the root
    const normalized = this.normalize(resolved);
    if (normalized.length > 1 && normalized.endsWith(this.sep)) {
      return normalized.slice(0, -1);
    }

    return normalized;
  }

  /**
   * Get relative path from 'from' to 'to'
   */
  static relative(from: string, to: string): string {
    const fromParts = this.normalize(from)
      .split(this.sep)
      .filter((p) => p.length > 0);
    const toParts = this.normalize(to)
      .split(this.sep)
      .filter((p) => p.length > 0);

    let commonLength = 0;
    const minLength = Math.min(fromParts.length, toParts.length);

    for (let i = 0; i < minLength; i++) {
      if (fromParts[i] === toParts[i]) {
        commonLength++;
      } else {
        break;
      }
    }

    const upSteps = fromParts.length - commonLength;
    const downSteps = toParts.slice(commonLength);

    const relativeParts = Array(upSteps).fill("..").concat(downSteps);
    return relativeParts.join(this.sep) || ".";
  }

  /**
   * Normalize a path, resolving '..' and '.' segments
   */
  static normalize(path: string): string {
    if (!path || path.length === 0) return ".";

    const isAbsolute = this.isAbsolute(path);
    const trailingSep = path.endsWith(this.sep);

    const parts = path.split(/[/\\]+/).filter((p) => p.length > 0);
    const normalized: string[] = [];

    for (const part of parts) {
      if (part === ".") {
        continue;
      } else if (part === "..") {
        if (
          normalized.length > 0 &&
          normalized[normalized.length - 1] !== ".."
        ) {
          normalized.pop();
        } else if (!isAbsolute) {
          normalized.push("..");
        }
      } else {
        normalized.push(part);
      }
    }

    let result = normalized.join(this.sep);

    if (isAbsolute) {
      result = this.sep + result;
    }

    if (trailingSep && result.length > 1) {
      result += this.sep;
    }

    return result || (isAbsolute ? this.sep : ".");
  }

  /**
   * Check if path is absolute
   */
  static isAbsolute(path: string): boolean {
    if (!path || path.length === 0) return false;

    // Unix-style absolute path
    if (path.startsWith("/")) return true;

    // Windows-style absolute path
    if (typeof process !== "undefined" && process.platform === "win32") {
      return /^[a-zA-Z]:[/\\]/.test(path) || path.startsWith("\\\\");
    }

    return false;
  }

  /**
   * Get the directory name of a path
   */
  static dirname(path: string): string {
    if (!path || path.length === 0) return ".";

    const normalizedPath = this.normalize(path);
    const lastSepIndex = normalizedPath.lastIndexOf(this.sep);

    if (lastSepIndex === -1) {
      return ".";
    }

    if (lastSepIndex === 0) {
      return this.sep;
    }

    return normalizedPath.substring(0, lastSepIndex);
  }

  /**
   * Get the base name of a path
   */
  static basename(path: string, ext?: string): string {
    if (!path || path.length === 0) return "";

    const normalizedPath = this.normalize(path);

    // Handle root case
    if (normalizedPath === this.sep) return "";

    // Check if path ends with separator (indicating directory)
    if (normalizedPath.endsWith(this.sep)) {
      // For trailing separator, get the directory name itself
      const withoutTrailing = normalizedPath.slice(0, -1);
      const lastSepIndex = withoutTrailing.lastIndexOf(this.sep);
      const dirName =
        lastSepIndex === -1
          ? withoutTrailing
          : withoutTrailing.substring(lastSepIndex + 1);

      // Return empty if this was just a trailing separator case like '/a/b/'
      if (path.endsWith(this.sep)) return "";
      return dirName;
    }

    const lastSepIndex = normalizedPath.lastIndexOf(this.sep);
    let base =
      lastSepIndex === -1
        ? normalizedPath
        : normalizedPath.substring(lastSepIndex + 1);

    if (ext && base.endsWith(ext)) {
      base = base.substring(0, base.length - ext.length);
    }

    return base;
  }

  /**
   * Get the extension of a path
   */
  static extname(path: string): string {
    if (!path || path.length === 0) return "";

    const base = this.basename(path);
    const lastDotIndex = base.lastIndexOf(".");

    if (lastDotIndex === -1 || lastDotIndex === 0) {
      return "";
    }

    return base.substring(lastDotIndex);
  }

  /**
   * Parse a path into its components
   */
  static parse(path: string): ParsedPath {
    if (!path || path.length === 0) {
      return { root: "", dir: "", base: "", ext: "", name: "" };
    }

    const normalizedPath = this.normalize(path);
    const isAbsolute = this.isAbsolute(normalizedPath);

    const root = isAbsolute ? this.sep : "";
    const dir = this.dirname(normalizedPath);
    const base = this.basename(normalizedPath);
    const ext = this.extname(normalizedPath);
    const name = this.basename(normalizedPath, ext);

    return { root, dir, base, ext, name };
  }

  /**
   * Format a path object into a path string
   */
  static format(pathObject: Partial<ParsedPath>): string {
    if (!pathObject) return "";

    const { root = "", dir = "", base = "", name = "", ext = "" } = pathObject;

    let path = "";

    if (root) {
      path = root;
    }

    if (dir) {
      if (path && !path.endsWith(this.sep)) {
        path += this.sep;
      }
      path += dir;
    }

    if (base) {
      if (path && !path.endsWith(this.sep)) {
        path += this.sep;
      }
      path += base;
    } else if (name || ext) {
      if (path && !path.endsWith(this.sep)) {
        path += this.sep;
      }
      path += name + ext;
    }

    return this.normalize(path);
  }

  /**
   * Convert path to use forward slashes (POSIX-style)
   */
  static toPosix(path: string): string {
    return path.replace(/\\/g, "/");
  }

  /**
   * Convert path to use backslashes (Windows-style)
   */
  static toWindows(path: string): string {
    return path.replace(/\//g, "\\");
  }

  /**
   * Get current working directory
   */
  private static getCurrentDirectory(): string {
    if (typeof process !== "undefined" && process.cwd) {
      return process.cwd();
    }
    return "/"; // Default to root for non-Node environments
  }

  /**
   * Check if two paths are the same
   */
  static equals(path1: string, path2: string): boolean {
    return this.normalize(path1) === this.normalize(path2);
  }

  /**
   * Get the common prefix of multiple paths
   */
  static commonPrefix(...paths: string[]): string {
    if (paths.length === 0) return "";
    if (paths.length === 1) return this.dirname(paths[0]);

    const normalizedPaths = paths.map((p) => this.normalize(p));
    const parts = normalizedPaths.map((p) => p.split(this.sep));

    const minLength = Math.min(...parts.map((p) => p.length));
    let commonLength = 0;

    for (let i = 0; i < minLength; i++) {
      const part = parts[0][i];
      if (parts.every((p) => p[i] === part)) {
        commonLength++;
      } else {
        break;
      }
    }

    if (commonLength === 0) return "";

    const commonParts = parts[0].slice(0, commonLength);
    const result = commonParts.join(this.sep);

    // Handle root case - if all paths are absolute and no common parts beyond root
    if (result === "" && normalizedPaths.every((p) => this.isAbsolute(p))) {
      return this.sep;
    }

    return result || this.sep;
  }

  /**
   * Check if a path is within another path
   */
  static isWithin(parent: string, child: string): boolean {
    const normalizedParent = this.normalize(parent);
    const normalizedChild = this.normalize(child);

    if (normalizedParent === normalizedChild) return false;

    const relativePath = this.relative(normalizedParent, normalizedChild);
    return !relativePath.startsWith("..") && relativePath !== "";
  }

  /**
   * Get file name without extension
   */
  static stem(path: string): string {
    const base = this.basename(path);
    const ext = this.extname(path);
    return ext ? base.slice(0, -ext.length) : base;
  }

  /**
   * Change file extension
   */
  static changeExtension(path: string, newExt: string): string {
    const parsed = this.parse(path);
    parsed.ext = newExt.startsWith(".") ? newExt : "." + newExt;
    parsed.base = parsed.name + parsed.ext;
    return this.format(parsed);
  }

  /**
   * Add suffix to file name (before extension)
   */
  static addSuffix(path: string, suffix: string): string {
    const parsed = this.parse(path);
    parsed.name += suffix;
    parsed.base = parsed.name + parsed.ext;
    return this.format(parsed);
  }

  /**
   * Add prefix to file name
   */
  static addPrefix(path: string, prefix: string): string {
    const parsed = this.parse(path);
    parsed.name = prefix + parsed.name;
    parsed.base = parsed.name + parsed.ext;
    return this.format(parsed);
  }
}
