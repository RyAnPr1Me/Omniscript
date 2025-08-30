# Security & Sandboxing API Reference

## Overview
Omniscript provides comprehensive security features including sandboxed execution, resource monitoring, and audit logging. These features allow you to safely execute untrusted code with configurable security policies and resource limits.

## Core Security Classes

### SecurityManager
The central security management class that handles sandbox creation and audit logging.

```typescript
import { SecurityManager } from 'omniscript';

const security = SecurityManager.getInstance();

// Create a sandbox with default policy
const sandbox = security.createSandbox();

// Create a sandbox with custom policy
const customSandbox = security.createSandbox({
  allowFileSystem: false,
  allowNetwork: true,
  maxMemoryMB: 100,
  maxExecutionTimeMs: 30000
});
```

### SandboxedEnvironment
Provides isolated execution environment for untrusted code.

```typescript
// Execute code in sandbox
const result = await sandbox.execute(`
  const x = 1 + 2;
  console.log("Result:", x);
  return x;
`);

// Get resource usage
const usage = sandbox.getResourceUsage();
console.log('Memory used:', usage.memoryUsage);
console.log('Execution time:', usage.executionTime);

// Clean up sandbox
sandbox.destroy();
```

### SecurityPolicy Interface
Defines security constraints for sandbox execution.

```typescript
interface SecurityPolicy {
  allowFileSystem: boolean;       // Allow file system access
  allowNetwork: boolean;          // Allow network requests
  allowProcessExecution: boolean; // Allow process execution
  maxMemoryMB: number;           // Memory limit in MB
  maxExecutionTimeMs: number;    // Execution time limit in ms
  maxCallStackDepth: number;     // Call stack depth limit
  allowedModules: string[];      // Allowed module imports
  deniedFunctions: string[];     // Forbidden function names
}
```

## Security Examples

### Basic Sandboxing
```typescript
import { Runtime } from 'omniscript';

const runtime = new Runtime();

// Execute untrusted code safely
const result = await runtime.executeSecure(`
  // This code runs in a sandbox
  const data = { value: 42 };
  return data.value * 2;
`, {
  maxMemoryMB: 50,
  maxExecutionTimeMs: 5000,
  allowFileSystem: false,
  allowNetwork: false
});

console.log(result); // { status: 'executed', sandbox: true }
```

### Advanced Security Policy
```typescript
const strictPolicy = {
  allowFileSystem: false,
  allowNetwork: false,
  allowProcessExecution: false,
  maxMemoryMB: 32,
  maxExecutionTimeMs: 10000,
  maxCallStackDepth: 100,
  allowedModules: ['math', 'string'],
  deniedFunctions: ['eval', 'Function', 'setTimeout', 'setInterval']
};

const sandbox = security.createSandbox(strictPolicy);

try {
  // This will throw SecurityError
  await sandbox.execute('eval("malicious code")');
} catch (error) {
  console.error('Security violation:', error.message);
}
```

### Resource Monitoring
```typescript
import { ResourceMonitor } from 'omniscript';

const limits = {
  maxMemoryBytes: 100 * 1024 * 1024, // 100MB
  maxCpuTimeMs: 30000,
  maxFileDescriptors: 50,
  maxNetworkConnections: 10
};

// Start monitoring resources
ResourceMonitor.startMonitoring('app', limits, (data) => {
  if (data.violations.length > 0) {
    console.warn('Resource violations detected:', data.violations);
  }
  
  console.log('Current usage:', data.usage);
});

// Stop monitoring
ResourceMonitor.stopMonitoring('app');
```

## Audit Logging

### Retrieving Audit Logs
```typescript
// Get all audit entries
const allLogs = security.getAuditLog();

// Get logs since timestamp
const recentLogs = security.getAuditLog(Date.now() - 3600000); // Last hour

// Filter security violations
const violations = allLogs.filter(entry => !entry.allowed);

console.log('Security violations:', violations);
```

### Audit Log Entry Format
```typescript
interface AuditEntry {
  timestamp: number;    // Unix timestamp
  action: string;       // Action type (e.g., 'file_read', 'network_request')
  allowed: boolean;     // Whether action was allowed
  context: {
    resource?: string;  // Resource being accessed
    memoryUsage: number;
    executionTime: number;
    // ... other context data
  };
}
```

## Error Handling

### Security Exceptions
```typescript
import { SecurityError, ResourceLimitExceededError } from 'omniscript';

try {
  await sandbox.execute(suspiciousCode);
} catch (error) {
  if (error instanceof SecurityError) {
    console.error('Security policy violation:', error.message);
  } else if (error instanceof ResourceLimitExceededError) {
    console.error('Resource limit exceeded:', error.message);
  }
}
```

## Integration with Runtime

### Runtime Security Methods
```typescript
const runtime = new Runtime();

// Create secure sandbox
const sandbox = runtime.createSecureSandbox({
  maxMemoryMB: 100,
  allowNetwork: true
});

// Execute code securely with automatic cleanup
const result = await runtime.executeSecure(code, policy);

// Access audit logs
const auditLog = runtime.getSecurityAuditLog();
runtime.clearSecurityAuditLog();
```

## Best Practices

### Secure Code Execution
1. **Always use minimal privileges**: Only grant necessary permissions
2. **Set appropriate resource limits**: Prevent resource exhaustion attacks
3. **Monitor audit logs**: Regularly review security events
4. **Validate inputs**: Sanitize code before execution
5. **Handle errors gracefully**: Don't expose internal information

### Policy Configuration
```typescript
// Development environment - more permissive
const devPolicy = {
  allowFileSystem: true,
  allowNetwork: true,
  maxMemoryMB: 500,
  maxExecutionTimeMs: 60000,
  allowedModules: ['*'],
  deniedFunctions: ['eval']
};

// Production environment - strict security
const prodPolicy = {
  allowFileSystem: false,
  allowNetwork: false,
  maxMemoryMB: 100,
  maxExecutionTimeMs: 30000,
  allowedModules: ['stdlib/*'],
  deniedFunctions: ['eval', 'Function', 'setTimeout', 'setInterval']
};
```

### Resource Management
```typescript
class SecureRunner {
  private activeSandboxes = new Set<SandboxedEnvironment>();

  async executeCode(code: string, policy: Partial<SecurityPolicy>) {
    const sandbox = SecurityManager.getInstance().createSandbox(policy);
    this.activeSandboxes.add(sandbox);
    
    try {
      return await sandbox.execute(code);
    } finally {
      sandbox.destroy();
      this.activeSandboxes.delete(sandbox);
    }
  }

  cleanup() {
    // Clean up all active sandboxes
    for (const sandbox of this.activeSandboxes) {
      sandbox.destroy();
    }
    this.activeSandboxes.clear();
  }
}
```

## Configuration Examples

### Web Application Security
```typescript
const webAppPolicy = {
  allowFileSystem: false,      // No file access
  allowNetwork: true,          // Allow API calls
  allowProcessExecution: false, // No process spawning
  maxMemoryMB: 64,            // Reasonable memory limit
  maxExecutionTimeMs: 15000,   // 15 second timeout
  maxCallStackDepth: 500,     // Prevent stack overflow
  allowedModules: [
    'stdlib/http',
    'stdlib/crypto',
    'stdlib/datetime'
  ],
  deniedFunctions: [
    'eval', 'Function',
    'setTimeout', 'setInterval',
    'require', 'import'
  ]
};
```

### Data Processing Security
```typescript
const dataProcessingPolicy = {
  allowFileSystem: true,       // File access needed
  allowNetwork: false,         // No network access
  allowProcessExecution: false,
  maxMemoryMB: 1024,          // Higher memory for data processing
  maxExecutionTimeMs: 120000,  // 2 minute timeout
  maxCallStackDepth: 1000,
  allowedModules: [
    'stdlib/collections',
    'stdlib/math',
    'stdlib/datetime'
  ],
  deniedFunctions: ['eval', 'Function']
};
```

## See Also
- [Runtime API Reference](./runtime/README.md)
- [Error Handling Guide](./error-handling.md)
- [Performance Optimization Guide](./performance.md)
- [Best Practices](../best-practices.md)