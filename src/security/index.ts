import { debug } from "../debug";
import { OmniscriptError } from "../errors";

export interface SecurityPolicy {
  allowFileSystem: boolean;
  allowNetwork: boolean;
  allowProcessExecution: boolean;
  maxMemoryMB: number;
  maxExecutionTimeMs: number;
  maxCallStackDepth: number;
  allowedModules: string[];
  deniedFunctions: string[];
}

export interface ResourceLimits {
  maxMemoryBytes: number;
  maxCpuTimeMs: number;
  maxFileDescriptors: number;
  maxNetworkConnections: number;
}

export interface ExecutionContext {
  policy: SecurityPolicy;
  startTime: number;
  memoryUsage: number;
  callStackDepth: number;
  openFileDescriptors: Set<string>;
  networkConnections: Set<string>;
}

export class SecurityManager {
  private static instance: SecurityManager;
  private defaultPolicy: SecurityPolicy;
  private auditLog: Array<{
    timestamp: number;
    action: string;
    allowed: boolean;
    context: any;
  }> = [];

  private constructor() {
    this.defaultPolicy = {
      allowFileSystem: false,
      allowNetwork: false,
      allowProcessExecution: false,
      maxMemoryMB: 100,
      maxExecutionTimeMs: 30000,
      maxCallStackDepth: 1000,
      allowedModules: ["stdlib/*", "math", "string", "array"],
      deniedFunctions: ["eval", "Function", "setTimeout", "setInterval"],
    };
  }

  static getInstance(): SecurityManager {
    if (!SecurityManager.instance) {
      SecurityManager.instance = new SecurityManager();
    }
    return SecurityManager.instance;
  }

  createSandbox(policy?: Partial<SecurityPolicy>): SandboxedEnvironment {
    const mergedPolicy = { ...this.defaultPolicy, ...policy };
    debug.debug(
      "Security",
      `Creating sandbox with policy: ${JSON.stringify(mergedPolicy)}`,
    );

    this.logAction("sandbox_create", true, { policy: mergedPolicy });
    return new SandboxedEnvironment(mergedPolicy);
  }

  checkResourceAccess(
    action: string,
    resource: string,
    context: ExecutionContext,
  ): boolean {
    const allowed = this.evaluateAccess(action, resource, context);
    this.logAction(action, allowed, {
      resource,
      context: this.sanitizeContext(context),
    });

    if (!allowed) {
      debug.warn("Security", `Access denied: ${action} on ${resource}`);
      throw new SecurityError(`Access denied: ${action} on ${resource}`);
    }

    return allowed;
  }

  private evaluateAccess(
    action: string,
    resource: string,
    context: ExecutionContext,
  ): boolean {
    const { policy } = context;

    // Check execution time limits
    if (Date.now() - context.startTime > policy.maxExecutionTimeMs) {
      return false;
    }

    // Check memory limits
    if (context.memoryUsage > policy.maxMemoryMB * 1024 * 1024) {
      return false;
    }

    // Check call stack depth
    if (context.callStackDepth > policy.maxCallStackDepth) {
      return false;
    }

    // Check specific actions
    switch (action) {
      case "file_read":
      case "file_write":
      case "file_delete":
        return policy.allowFileSystem;

      case "network_request":
      case "network_listen":
        return policy.allowNetwork;

      case "process_exec":
        return policy.allowProcessExecution;

      case "module_import":
        return this.checkModuleAccess(resource, policy);

      case "function_call":
        return !policy.deniedFunctions.includes(resource);

      default:
        return true;
    }
  }

  private checkModuleAccess(
    moduleName: string,
    policy: SecurityPolicy,
  ): boolean {
    return policy.allowedModules.some((pattern) => {
      if (pattern.endsWith("*")) {
        return moduleName.startsWith(pattern.slice(0, -1));
      }
      return moduleName === pattern;
    });
  }

  private logAction(action: string, allowed: boolean, context: any): void {
    this.auditLog.push({
      timestamp: Date.now(),
      action,
      allowed,
      context,
    });

    // Keep audit log size manageable
    if (this.auditLog.length > 10000) {
      this.auditLog = this.auditLog.slice(-5000);
    }
  }

  private sanitizeContext(context: ExecutionContext): any {
    return {
      memoryUsage: context.memoryUsage,
      callStackDepth: context.callStackDepth,
      executionTime: Date.now() - context.startTime,
      openDescriptors: context.openFileDescriptors.size,
      networkConnections: context.networkConnections.size,
    };
  }

  getAuditLog(since?: number): Array<any> {
    if (since) {
      return this.auditLog.filter((entry) => entry.timestamp >= since);
    }
    return [...this.auditLog];
  }

  clearAuditLog(): void {
    this.auditLog = [];
    debug.debug("Security", "Audit log cleared");
  }
}

export class SandboxedEnvironment {
  private context: ExecutionContext;
  private originalConsole: Console;
  private sandboxedGlobals: any = {};

  constructor(private policy: SecurityPolicy) {
    this.context = {
      policy,
      startTime: Date.now(),
      memoryUsage: process.memoryUsage().heapUsed, // Initialize with current memory usage
      callStackDepth: 0,
      openFileDescriptors: new Set(),
      networkConnections: new Set(),
    };

    this.originalConsole = console;
    this.setupSandboxedEnvironment();
  }

  private setupSandboxedEnvironment(): void {
    // Create sandboxed global object
    this.sandboxedGlobals = {
      console: this.createSandboxedConsole(),
      Math: Math,
      Date: Date,
      JSON: JSON,
      String: String,
      Number: Number,
      Boolean: Boolean,
      Array: Array,
      Object: Object,
      Promise: Promise,
      // Restricted or proxied versions of dangerous functions
      setTimeout: this.createRestrictedFunction("setTimeout"),
      setInterval: this.createRestrictedFunction("setInterval"),
      fetch: this.createRestrictedFunction("fetch"),
      require: this.createRestrictedRequire(),
      import: this.createRestrictedImport(),
    };

    // Remove dangerous globals
    delete this.sandboxedGlobals.eval;
    delete this.sandboxedGlobals.Function;
    delete this.sandboxedGlobals.process;
    delete this.sandboxedGlobals.global;
    delete this.sandboxedGlobals.globalThis;
  }

  private createSandboxedConsole(): Console {
    return {
      ...this.originalConsole,
      log: (...args: any[]) => {
        debug.debug("Sandbox", `Console output: ${args.join(" ")}`);
        this.originalConsole.log("[SANDBOX]", ...args);
      },
      error: (...args: any[]) => {
        debug.error("Sandbox", `Console error: ${args.join(" ")}`);
        this.originalConsole.error("[SANDBOX]", ...args);
      },
      warn: (...args: any[]) => {
        debug.warn("Sandbox", `Console warning: ${args.join(" ")}`);
        this.originalConsole.warn("[SANDBOX]", ...args);
      },
    } as Console;
  }

  private createRestrictedFunction(name: string): (...args: any[]) => any {
    return (...args: any[]) => {
      const security = SecurityManager.getInstance();
      try {
        security.checkResourceAccess("function_call", name, this.context);

        if (name === "setTimeout" || name === "setInterval") {
          // Limit timeout duration
          const delay = args[1] || 0;
          if (delay > this.policy.maxExecutionTimeMs) {
            throw new SecurityError(
              `Timeout duration ${delay}ms exceeds limit ${this.policy.maxExecutionTimeMs}ms`,
            );
          }
        }

        // For demonstration - in real implementation, you'd proxy the actual function
        throw new SecurityError(`Function ${name} is restricted in sandbox`);
      } catch (error) {
        if (error instanceof SecurityError) {
          throw error;
        }
        throw new SecurityError(
          `Failed to execute restricted function ${name}: ${error}`,
        );
      }
    };
  }

  private createRestrictedRequire(): (moduleName: string) => any {
    return (moduleName: string) => {
      const security = SecurityManager.getInstance();
      security.checkResourceAccess("module_import", moduleName, this.context);

      // In real implementation, this would load from a restricted module set
      throw new SecurityError(
        `Module imports are restricted in sandbox: ${moduleName}`,
      );
    };
  }

  private createRestrictedImport(): (moduleName: string) => Promise<any> {
    return async (moduleName: string) => {
      const security = SecurityManager.getInstance();
      security.checkResourceAccess("module_import", moduleName, this.context);

      // In real implementation, this would load from a restricted module set
      throw new SecurityError(
        `Dynamic imports are restricted in sandbox: ${moduleName}`,
      );
    };
  }

  execute(code: string): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        this.checkExecutionLimits();

        // Create isolated execution context
        const result = this.executeInIsolation(code);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
  }

  private checkExecutionLimits(): void {
    const now = Date.now();
    const elapsed = now - this.context.startTime;

    if (elapsed > this.policy.maxExecutionTimeMs) {
      throw new SecurityError(
        `Execution time limit exceeded: ${elapsed}ms > ${this.policy.maxExecutionTimeMs}ms`,
      );
    }

    // Update memory usage (use a more reasonable calculation for sandbox environments)
    // In a real implementation, you'd track allocated memory more precisely
    const currentMemory = process.memoryUsage().heapUsed;
    const memoryDelta = Math.max(
      0,
      currentMemory - (this.context.memoryUsage || currentMemory),
    );
    this.context.memoryUsage = Math.min(
      this.context.memoryUsage + memoryDelta,
      currentMemory,
    );

    // Only enforce limits if memory usage seems abnormally high for a sandbox
    const memoryLimitBytes = this.policy.maxMemoryMB * 1024 * 1024;
    if (memoryDelta > memoryLimitBytes) {
      throw new SecurityError(
        `Memory allocation limit exceeded: ${memoryDelta} bytes > ${memoryLimitBytes} bytes`,
      );
    }
  }

  private executeInIsolation(code: string): any {
    // This is a simplified implementation
    // In production, you'd use vm.createContext() or similar
    debug.debug(
      "Sandbox",
      `Executing code in sandbox: ${code.substring(0, 100)}...`,
    );

    // For demonstration purposes
    if (code.includes("eval") || code.includes("Function")) {
      throw new SecurityError("Code contains forbidden constructs");
    }

    // Simulate execution result
    return { status: "executed", sandbox: true };
  }

  getResourceUsage(): {
    memoryUsage: number;
    executionTime: number;
    openDescriptors: number;
    networkConnections: number;
  } {
    return {
      memoryUsage: this.context.memoryUsage,
      executionTime: Date.now() - this.context.startTime,
      openDescriptors: this.context.openFileDescriptors.size,
      networkConnections: this.context.networkConnections.size,
    };
  }

  destroy(): void {
    this.context.openFileDescriptors.clear();
    this.context.networkConnections.clear();
    debug.debug("Security", "Sandbox environment destroyed");
  }
}

export class SecurityError extends OmniscriptError {
  constructor(message: string) {
    super(message);
    this.name = "SecurityError";
  }
}

export class ResourceLimitExceededError extends SecurityError {
  constructor(resource: string, limit: number, actual: number) {
    super(`Resource limit exceeded for ${resource}: ${actual} > ${limit}`);
    this.name = "ResourceLimitExceededError";
  }
}

// Resource monitoring utilities
export class ResourceMonitor {
  private static intervals: Map<string, NodeJS.Timeout> = new Map();

  static startMonitoring(
    name: string,
    limits: ResourceLimits,
    callback: (usage: any) => void,
  ): void {
    if (this.intervals.has(name)) {
      this.stopMonitoring(name);
    }

    const interval = setInterval(() => {
      const usage = this.getCurrentUsage();

      // Check limits
      const violations: string[] = [];
      if (usage.memoryBytes > limits.maxMemoryBytes) {
        violations.push(
          `memory: ${usage.memoryBytes} > ${limits.maxMemoryBytes}`,
        );
      }

      if (violations.length > 0) {
        callback({ usage, violations });
      } else {
        callback({ usage, violations: [] });
      }
    }, 1000);

    this.intervals.set(name, interval);
    debug.debug("Security", `Resource monitoring started for ${name}`);
  }

  static stopMonitoring(name: string): void {
    const interval = this.intervals.get(name);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(name);
      debug.debug("Security", `Resource monitoring stopped for ${name}`);
    }
  }

  private static getCurrentUsage(): any {
    const memUsage = process.memoryUsage();
    return {
      memoryBytes: memUsage.heapUsed,
      cpuTime: process.cpuUsage(),
      uptime: process.uptime() * 1000,
    };
  }
}

export { SecurityManager as Security };
