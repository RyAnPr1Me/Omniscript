import { 
  SecurityManager, 
  SandboxedEnvironment, 
  SecurityError, 
  ResourceMonitor,
  SecurityPolicy,
  ResourceLimits 
} from '../../src/security';
import { describe, expect, test, beforeEach, afterEach, jest } from '@jest/globals';

describe('Security Module', () => {
  let securityManager: SecurityManager;

  beforeEach(() => {
    securityManager = SecurityManager.getInstance();
    securityManager.clearAuditLog();
  });

  describe('SecurityManager', () => {
    test('should create singleton instance', () => {
      const instance1 = SecurityManager.getInstance();
      const instance2 = SecurityManager.getInstance();
      expect(instance1).toBe(instance2);
    });

    test('should create sandbox with default policy', () => {
      const sandbox = securityManager.createSandbox();
      expect(sandbox).toBeInstanceOf(SandboxedEnvironment);
    });

    test('should create sandbox with custom policy', () => {
      const customPolicy: Partial<SecurityPolicy> = {
        allowFileSystem: true,
        maxMemoryMB: 200
      };
      
      const sandbox = securityManager.createSandbox(customPolicy);
      expect(sandbox).toBeInstanceOf(SandboxedEnvironment);
    });

    test('should log audit entries', () => {
      const sandbox = securityManager.createSandbox();
      const auditLog = securityManager.getAuditLog();
      
      expect(auditLog.length).toBeGreaterThan(0);
      expect(auditLog[0].action).toBe('sandbox_create');
      expect(auditLog[0].allowed).toBe(true);
    });

    test('should clear audit log', () => {
      securityManager.createSandbox();
      expect(securityManager.getAuditLog().length).toBeGreaterThan(0);
      
      securityManager.clearAuditLog();
      expect(securityManager.getAuditLog().length).toBe(0);
    });

    test('should filter audit log by timestamp', () => {
      const before = Date.now();
      securityManager.createSandbox();
      const after = Date.now();
      
      const recentEntries = securityManager.getAuditLog(before);
      expect(recentEntries.length).toBeGreaterThan(0);
      
      const futureEntries = securityManager.getAuditLog(after + 1000);
      expect(futureEntries.length).toBe(0);
    });
  });

  describe('SandboxedEnvironment', () => {
    let sandbox: SandboxedEnvironment;
    let restrictivePolicy: SecurityPolicy;

    beforeEach(() => {
      restrictivePolicy = {
        allowFileSystem: false,
        allowNetwork: false,
        allowProcessExecution: false,
        maxMemoryMB: 500, // Increased memory limit for tests
        maxExecutionTimeMs: 5000,
        maxCallStackDepth: 100,
        allowedModules: ['math'],
        deniedFunctions: ['eval', 'Function', 'setTimeout']
      };
      
      sandbox = securityManager.createSandbox(restrictivePolicy);
    });

    afterEach(() => {
      if (sandbox) {
        sandbox.destroy();
      }
    });

    test('should execute simple code', async () => {
      const result = await sandbox.execute('2 + 2');
      expect(result).toEqual({ status: 'executed', sandbox: true });
    });

    test('should reject code with forbidden constructs', async () => {
      await expect(sandbox.execute('eval("malicious code")')).rejects.toThrow(SecurityError);
      await expect(sandbox.execute('new Function("return 1")')).rejects.toThrow(SecurityError);
    });

    test('should track resource usage', () => {
      const usage = sandbox.getResourceUsage();
      
      expect(usage).toHaveProperty('memoryUsage');
      expect(usage).toHaveProperty('executionTime');
      expect(usage).toHaveProperty('openDescriptors');
      expect(usage).toHaveProperty('networkConnections');
      
      expect(typeof usage.memoryUsage).toBe('number');
      expect(typeof usage.executionTime).toBe('number');
      expect(typeof usage.openDescriptors).toBe('number');
      expect(typeof usage.networkConnections).toBe('number');
    });

    test('should enforce execution time limits', async () => {
      const shortTimeoutPolicy: SecurityPolicy = {
        ...restrictivePolicy,
        maxExecutionTimeMs: 1 // Very short timeout for testing
      };
      
      const shortTimeoutSandbox = securityManager.createSandbox(shortTimeoutPolicy);
      
      // Wait longer than the timeout
      await new Promise(resolve => setTimeout(resolve, 10));
      
      await expect(shortTimeoutSandbox.execute('1 + 1')).rejects.toThrow(SecurityError);
      
      shortTimeoutSandbox.destroy();
    });

    test('should properly destroy sandbox', () => {
      const initialUsage = sandbox.getResourceUsage();
      expect(initialUsage.openDescriptors).toBe(0);
      expect(initialUsage.networkConnections).toBe(0);
      
      sandbox.destroy();
      
      // Should not throw after destruction
      expect(() => sandbox.getResourceUsage()).not.toThrow();
    });
  });

  describe('SecurityError', () => {
    test('should create security error with message', () => {
      const error = new SecurityError('Test security violation');
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('SecurityError');
      expect(error.message).toBe('Test security violation');
    });

    test('should be throwable and catchable', () => {
      expect(() => {
        throw new SecurityError('Test error');
      }).toThrow(SecurityError);

      try {
        throw new SecurityError('Test error');
      } catch (error) {
        expect(error).toBeInstanceOf(SecurityError);
        expect((error as SecurityError).message).toBe('Test error');
      }
    });
  });

  describe('ResourceMonitor', () => {
    const mockCallback = jest.fn();
    const testLimits: ResourceLimits = {
      maxMemoryBytes: 100 * 1024 * 1024, // 100MB
      maxCpuTimeMs: 30000,
      maxFileDescriptors: 100,
      maxNetworkConnections: 50
    };

    afterEach(() => {
      ResourceMonitor.stopMonitoring('test');
      mockCallback.mockClear();
    });

    test('should start and stop monitoring', () => {
      expect(() => {
        ResourceMonitor.startMonitoring('test', testLimits, mockCallback);
      }).not.toThrow();

      expect(() => {
        ResourceMonitor.stopMonitoring('test');
      }).not.toThrow();
    });

    test('should call callback with usage data', (done) => {
      ResourceMonitor.startMonitoring('test', testLimits, (data) => {
        expect(data).toHaveProperty('usage');
        expect(data).toHaveProperty('violations');
        expect(data.usage).toHaveProperty('memoryBytes');
        expect(data.usage).toHaveProperty('cpuTime');
        expect(Array.isArray(data.violations)).toBe(true);
        
        ResourceMonitor.stopMonitoring('test');
        done();
      });
    });

    test('should handle multiple monitors', () => {
      expect(() => {
        ResourceMonitor.startMonitoring('test1', testLimits, mockCallback);
        ResourceMonitor.startMonitoring('test2', testLimits, mockCallback);
      }).not.toThrow();

      expect(() => {
        ResourceMonitor.stopMonitoring('test1');
        ResourceMonitor.stopMonitoring('test2');
      }).not.toThrow();
    });

    test('should restart monitoring if already exists', () => {
      expect(() => {
        ResourceMonitor.startMonitoring('test', testLimits, mockCallback);
        ResourceMonitor.startMonitoring('test', testLimits, mockCallback); // Should restart
      }).not.toThrow();

      ResourceMonitor.stopMonitoring('test');
    });
  });

  describe('Integration Tests', () => {
    test('should handle complex security scenario', async () => {
      const policy: SecurityPolicy = {
        allowFileSystem: false,
        allowNetwork: true,
        allowProcessExecution: false,
        maxMemoryMB: 500, // Increased memory limit for tests
        maxExecutionTimeMs: 10000,
        maxCallStackDepth: 500,
        allowedModules: ['stdlib/http', 'math'],
        deniedFunctions: ['eval', 'Function']
      };

      const sandbox = securityManager.createSandbox(policy);
      
      // Should succeed
      const result = await sandbox.execute('console.log("Hello from sandbox")');
      expect(result).toBeDefined();

      // Should fail due to forbidden construct - the exception is expected and caught
      let violationOccurred = false;
      try {
        await sandbox.execute('eval("console.log(1)")');
      } catch (error) {
        if (error instanceof SecurityError) {
          violationOccurred = true;
        }
      }
      expect(violationOccurred).toBe(true);

      // Check audit log - sandbox creation should be logged
      const auditLog = securityManager.getAuditLog();
      expect(auditLog.length).toBeGreaterThan(0);
      
      // Check that at least one sandbox was created
      const sandboxCreations = auditLog.filter(entry => entry.action === 'sandbox_create');
      expect(sandboxCreations.length).toBeGreaterThan(0);

      sandbox.destroy();
    });

    test('should track resource usage over time', async () => {
      const sandbox = securityManager.createSandbox();
      
      const initialUsage = sandbox.getResourceUsage();
      expect(initialUsage.executionTime).toBeGreaterThanOrEqual(0);
      
      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const laterUsage = sandbox.getResourceUsage();
      expect(laterUsage.executionTime).toBeGreaterThan(initialUsage.executionTime);
      
      sandbox.destroy();
    });
  });
});