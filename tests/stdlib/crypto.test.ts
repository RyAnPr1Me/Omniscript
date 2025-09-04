import { Crypto } from "../../src/stdlib/crypto";
import { describe, expect, test } from "@jest/globals";

describe("Crypto Module", () => {
  test("hash function works", async () => {
    const data = "Hello, World!";
    const hash = await Crypto.hash(data, "SHA-256");
    expect(hash).toHaveLength(64); // SHA-256 produces 64 hex characters
    expect(typeof hash).toBe("string");
  });

  test("HMAC generation works", async () => {
    const data = "Hello, World!";
    const key = "secret-key";
    const hmac = await Crypto.hmac(data, key, "SHA-256");
    expect(hmac).toHaveLength(64); // SHA-256 HMAC produces 64 hex characters
    expect(typeof hmac).toBe("string");
  });

  test("symmetric encryption/decryption works", async () => {
    const data = "This is a secret message";
    const key = "my-secret-key";

    const encrypted = await Crypto.encrypt(data, key);
    expect(encrypted.encrypted).toBeDefined();
    expect(encrypted.iv).toBeDefined();
    expect(encrypted.algorithm).toBe("AES-GCM");

    const decrypted = await Crypto.decrypt(encrypted, key);
    expect(decrypted).toBe(data);
  });

  test("key generation works", async () => {
    const key = await Crypto.generateKey(32);
    expect(key).toHaveLength(64); // 32 bytes = 64 hex characters
    expect(typeof key).toBe("string");
  });

  test("random string generation works", () => {
    const randomStr = Crypto.generateRandomString(10);
    expect(randomStr).toHaveLength(10);
    expect(typeof randomStr).toBe("string");
  });

  test("UUID generation works", () => {
    const uuid = Crypto.generateUUID();
    expect(uuid).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });

  test("password key derivation works", async () => {
    const password = "mypassword";
    const salt = Crypto.generateSalt();
    const derivedKey = await Crypto.deriveKey(password, salt, 1000); // Low iterations for test speed
    expect(derivedKey).toHaveLength(64); // 32 bytes = 64 hex characters
    expect(typeof derivedKey).toBe("string");
  });

  test("MD5 hash works", async () => {
    const data = "Hello, World!";
    const hash = await Crypto.md5(data);
    expect(typeof hash).toBe("string");
    expect(hash.length).toBeGreaterThan(0);
  });
});
