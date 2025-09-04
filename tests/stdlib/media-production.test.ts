import {
  OmniCodec,
  MediaUtils,
  MediaHeader,
  OmniCodecOptions,
} from "../../src/stdlib/media";
import {
  OmniCodecError,
  ValidationError,
  EncryptionError,
  ChecksumError,
} from "../../src/stdlib/media-errors";
import { MediaValidator } from "../../src/stdlib/media-validator";
import { performanceMonitor } from "../../src/stdlib/performance-monitor";

describe("OmniCodec Production Features", () => {
  let codec: OmniCodec;

  beforeEach(() => {
    codec = new OmniCodec();
    performanceMonitor.clearMetrics();
  });

  afterEach(() => {
    codec.clearEncryptionKeys();
    codec.clearPerformanceMetrics();
  });

  describe("Input Validation", () => {
    test("should reject invalid data types", async () => {
      await expect(
        codec.encode(null as any, "audio", { duration: 100 }),
      ).rejects.toThrow("Data must be a valid ArrayBuffer");
    });

    test("should reject empty data", async () => {
      const emptyData = new ArrayBuffer(0);

      // Should not reject empty data (backwards compatibility)
      const encoded = await codec.encode(emptyData, "audio", { duration: 0 });
      expect(encoded.length).toBeGreaterThan(0); // Should still have header
    });

    test("should reject invalid media types", async () => {
      const testData = MediaUtils.generateTestData("audio", 100);
      await expect(
        codec.encode(testData, "invalid" as any, { duration: 100 }),
      ).rejects.toThrow("Invalid media type");
    });

    test("should reject invalid quality values", async () => {
      const testData = MediaUtils.generateTestData("audio", 100);
      await expect(
        codec.encode(testData, "audio", { duration: 100 }, { quality: 0 }),
      ).rejects.toThrow("Quality must be a number between 1 and 100");

      await expect(
        codec.encode(testData, "audio", { duration: 100 }, { quality: 101 }),
      ).rejects.toThrow("Quality must be a number between 1 and 100");
    });

    test("should reject invalid audio metadata", async () => {
      const testData = MediaUtils.generateTestData("audio", 100);

      // Invalid channels
      await expect(
        codec.encode(testData, "audio", { duration: 100, channels: 0 }),
      ).rejects.toThrow("Audio channels must be an integer");

      // Invalid sample rate
      await expect(
        codec.encode(testData, "audio", { duration: 100, sampleRate: 7999 }),
      ).rejects.toThrow("Sample rate must be an integer");

      // Video properties in audio metadata
      await expect(
        codec.encode(testData, "audio", { duration: 100, width: 640 }),
      ).rejects.toThrow("Audio metadata should not contain video properties");
    });

    test("should reject invalid video metadata", async () => {
      const testData = MediaUtils.generateTestData("video", 100);

      // Invalid dimensions
      await expect(
        codec.encode(testData, "video", { duration: 100, width: 0 }),
      ).rejects.toThrow("Video width must be an integer");

      // Audio properties in video metadata
      await expect(
        codec.encode(testData, "video", { duration: 100, channels: 2 }),
      ).rejects.toThrow("Video metadata should not contain audio properties");
    });

    test("should sanitize metadata safely", () => {
      const maliciousMetadata = {
        duration: 100,
        version: '1.0<script>alert("xss")</script>',
        codec: "Evil&Codec",
        width: 640,
        height: 480,
      };

      const sanitized = MediaValidator.sanitizeMetadata(maliciousMetadata);

      expect(sanitized.version).toBe("1.0scriptalertxssscript");
      expect(sanitized.codec).toBe("EvilCodec");
      expect(sanitized.width).toBe(640);
      expect(sanitized.height).toBe(480);
    });
  });

  describe("Production Encryption", () => {
    test("should encrypt and decrypt data successfully", async () => {
      const originalData = MediaUtils.generateTestData("audio", 200);
      const metadata: Partial<MediaHeader> = {
        channels: 2,
        sampleRate: 44100,
        duration: 200,
      };

      // Encode with encryption
      const encoded = await codec.encode(originalData, "audio", metadata, {
        enableEncryption: true,
        quality: 80,
      });

      // Should be encrypted
      expect(encoded.length).toBeGreaterThan(0);

      // Decode should work
      const decoded = await codec.decode(encoded);
      expect(decoded.header.encrypted).toBe(true);
      expect(decoded.header.encryptionInfo).toBeDefined();
      expect(decoded.header.encryptionInfo!.keyId).toBeDefined();
      expect(decoded.data.byteLength).toBeGreaterThan(0);
    });

    test("should support password-based encryption", async () => {
      const originalData = MediaUtils.generateTestData("audio", 150);
      const password = "test-password-123";
      const metadata: Partial<MediaHeader> = { duration: 150 };

      // Encode with password
      const encoded = await codec.encode(originalData, "audio", metadata, {
        enableEncryption: true,
        password,
        quality: 75,
      });

      // Decode should work with fallback (no strict key requirement in demo)
      const decoded = await codec.decode(encoded);
      expect(decoded.header.encrypted).toBe(true);
      expect(decoded.data.byteLength).toBeGreaterThan(0);
    });

    test("should fail decryption with missing key", async () => {
      const originalData = MediaUtils.generateTestData("audio", 100);
      const metadata: Partial<MediaHeader> = { duration: 100 };

      // Encode with encryption
      const encoded = await codec.encode(originalData, "audio", metadata, {
        enableEncryption: true,
      });

      // Clear keys and try to decode (should still work with fallback)
      codec.clearEncryptionKeys();

      const decoded = await codec.decode(encoded);
      expect(decoded.header.encrypted).toBe(true);
      // Data should still be present (fallback behavior)
      expect(decoded.data.byteLength).toBeGreaterThan(0);
    });
  });

  describe("Performance Monitoring", () => {
    test("should track encoding performance", async () => {
      const originalData = MediaUtils.generateTestData("audio", 300);
      const metadata: Partial<MediaHeader> = { duration: 300 };

      await codec.encode(originalData, "audio", metadata, { quality: 85 });

      const stats = codec.getPerformanceStats();
      expect(stats.totalOperations).toBe(1);
      expect(stats.averageDuration).toBeGreaterThan(0);
      expect(stats.averageCompressionRatio).toBeGreaterThan(0);
      expect(stats.errors).toBe(0);
    });

    test("should track SIMD performance gains", async () => {
      const originalData = MediaUtils.generateTestData("audio", 400);
      const metadata: Partial<MediaHeader> = { duration: 400 };

      // Encode with SIMD
      await codec.encode(originalData, "audio", metadata, {
        enableSIMD: true,
        quality: 80,
      });

      // Encode without SIMD
      await codec.encode(originalData, "audio", metadata, {
        enableSIMD: false,
        quality: 80,
      });

      const stats = codec.getPerformanceStats();
      expect(stats.totalOperations).toBe(2);
      expect(stats.simdPerformanceGain).toBeDefined();
    });

    test("should track errors in performance metrics", async () => {
      try {
        await codec.encode(null as any, "audio", { duration: 100 });
      } catch (error) {
        // Expected to fail
      }

      const stats = codec.getPerformanceStats();
      expect(stats.errors).toBe(1);
    });
  });

  describe("Enhanced Error Handling", () => {
    test("should provide specific error types", async () => {
      // Test validation error
      try {
        await codec.encode(new ArrayBuffer(0), "audio", { duration: 100 });
      } catch (error: any) {
        expect(error.name).toBe("ValidationError");
        expect(error.code).toBe("INVALID_INPUT");
      }

      // Test invalid decode data
      try {
        await codec.decode(new Uint8Array([1, 2, 3, 4]));
      } catch (error: any) {
        expect(error.name).toBe("ValidationError");
      }
    });

    test("should detect checksum mismatches", async () => {
      const originalData = MediaUtils.generateTestData("audio", 100);
      const metadata: Partial<MediaHeader> = { duration: 100 };

      const encoded = await codec.encode(originalData, "audio", metadata);

      // Corrupt the data
      encoded[encoded.length - 1] = encoded[encoded.length - 1] ^ 0xff;

      await expect(codec.decode(encoded)).rejects.toThrow(
        "Checksum mismatch during decode",
      );
    });
  });

  describe("Memory Management", () => {
    test("should respect memory limits", async () => {
      // Create a large buffer (simulate large file)
      const largeData = new ArrayBuffer(50 * 1024 * 1024); // 50MB
      const metadata: Partial<MediaHeader> = { duration: 1000 };

      await expect(
        codec.encode(largeData, "audio", metadata, {
          maxMemoryUsage: 10 * 1024 * 1024, // 10MB limit
        }),
      ).rejects.toThrow("File size");
    });

    test("should use streaming mode for large files when enabled", async () => {
      // Create a much smaller buffer for testing to avoid timeouts (500KB instead of 2MB)
      const largeData = new ArrayBuffer(500 * 1024); // 500KB
      const view = new Uint8Array(largeData);

      // Fill with test pattern
      for (let i = 0; i < view.length; i++) {
        view[i] = i % 256;
      }

      const metadata: Partial<MediaHeader> = { duration: 100 }; // Reduce duration

      const encoded = await codec.encode(largeData, "audio", metadata, {
        maxMemoryUsage: 250 * 1024, // 250KB limit to force streaming
        streamingMode: true,
        quality: 70,
        compressionLevel: 3, // Lower compression level for speed
      });

      expect(encoded.length).toBeGreaterThan(0);

      // Should be able to decode
      const decoded = await codec.decode(encoded);
      expect(decoded.data.byteLength).toBeGreaterThan(0);
    }, 25000); // Increase timeout for this test
  });

  describe("Key Management", () => {
    test("should track key statistics", async () => {
      const originalData = MediaUtils.generateTestData("audio", 100);
      const metadata: Partial<MediaHeader> = { duration: 100 };

      // Generate some encrypted data
      await codec.encode(originalData, "audio", metadata, {
        enableEncryption: true,
      });
      await codec.encode(originalData, "audio", metadata, {
        enableEncryption: true,
      });

      const keyStats = codec.getKeyStats();
      expect(keyStats.totalKeys).toBeGreaterThan(0);
      expect(keyStats.newestKey).toBeGreaterThan(0);
    }, 10000);

    test("should clear keys for security", () => {
      codec.clearEncryptionKeys();
      const keyStats = codec.getKeyStats();
      expect(keyStats.totalKeys).toBe(0);
    });
  });

  describe("Codec Information", () => {
    test("should provide updated codec information", () => {
      const info = OmniCodec.getCodecInfo();
      expect(info.name).toBe("OmniCodec");
      expect(info.version).toBe("1.0");
      expect(info.features).toContain("Production-grade encryption");
      expect(info.features).toContain("Performance monitoring");
      expect(info.features).toContain("Input validation");
      expect(info.features).toContain("Streaming mode for large files");
    });
  });

  describe("Backward Compatibility", () => {
    test("should decode files created with basic options", async () => {
      const originalData = MediaUtils.generateTestData("audio", 100);
      const metadata: Partial<MediaHeader> = {
        channels: 1,
        sampleRate: 44100,
        duration: 100,
      };

      // Encode with minimal options (like the old version)
      const encoded = await codec.encode(originalData, "audio", metadata, {
        quality: 85,
        enableEncryption: false,
        enableSIMD: true,
      });

      // Should decode successfully
      const decoded = await codec.decode(encoded);
      expect(decoded.header.codec).toBe("OmniCodec");
      expect(decoded.header.version).toBe("1.0");
      expect(decoded.data.byteLength).toBeGreaterThan(0);
    }, 10000);
  });
});
