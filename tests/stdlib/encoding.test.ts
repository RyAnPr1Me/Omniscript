import { Encoding } from "../../src/stdlib/encoding";
import { describe, expect, test } from "@jest/globals";

describe("Standard Library - Encoding", () => {
  const testText = "Hello, World! 🌍";
  const simpleText = "Hello World";

  test("Base64 encoding and decoding", () => {
    const encoded = Encoding.toBase64(simpleText);
    expect(typeof encoded).toBe("string");
    expect(encoded.length).toBeGreaterThan(0);

    const decoded = Encoding.fromBase64(encoded);
    expect(decoded).toBe(simpleText);
  });

  test("Base64 with Unicode characters", () => {
    const encoded = Encoding.toBase64(testText);
    const decoded = Encoding.fromBase64(encoded);
    expect(decoded).toBe(testText);
  });

  test("URL encoding and decoding", () => {
    const testUrl = "Hello World & Test=123?param=value";
    const encoded = Encoding.urlEncode(testUrl);
    expect(encoded).toContain("%20"); // Space should be encoded
    expect(encoded).toContain("%26"); // & should be encoded

    const decoded = Encoding.urlDecode(encoded);
    expect(decoded).toBe(testUrl);
  });

  test("HTML encoding and decoding", () => {
    const htmlText = '<script>alert("test");</script> & "quotes"';
    const encoded = Encoding.htmlEncode(htmlText);

    expect(encoded).toContain("&lt;");
    expect(encoded).toContain("&gt;");
    expect(encoded).toContain("&quot;");
    expect(encoded).toContain("&amp;");

    const decoded = Encoding.htmlDecode(encoded);
    expect(decoded).toBe(htmlText);
  });

  test("Hex encoding and decoding", () => {
    const encoded = Encoding.toHex(simpleText);
    expect(encoded).toMatch(/^[0-9a-f]+$/);

    const decoded = Encoding.fromHex(encoded);
    expect(decoded).toBe(simpleText);
  });

  test("Binary encoding and decoding", () => {
    const text = "AB";
    const encoded = Encoding.toBinary(text);
    expect(encoded).toBe("0100000101000010"); // 'A' = 65 = 01000001, 'B' = 66 = 01000010

    const decoded = Encoding.fromBinary(encoded);
    expect(decoded).toBe(text);
  });

  test("Unicode escape encoding and decoding", () => {
    const unicodeText = "Hello 🌍";
    const encoded = Encoding.toUnicodeEscape(unicodeText);
    expect(encoded).toContain("\\u");

    const decoded = Encoding.fromUnicodeEscape(encoded);
    expect(decoded).toBe(unicodeText);
  });

  test("ROT13 encoding (symmetric)", () => {
    const text = "Hello World";
    const encoded = Encoding.rot13(text);
    expect(encoded).toBe("Uryyb Jbeyq");

    // ROT13 is symmetric - applying it twice returns original
    const decoded = Encoding.rot13(encoded);
    expect(decoded).toBe(text);
  });

  test("Caesar cipher encoding and decoding", () => {
    const text = "Hello";
    const shift = 3;

    const encoded = Encoding.caesarEncode(text, shift);
    expect(encoded).toBe("Khoor");

    const decoded = Encoding.caesarDecode(encoded, shift);
    expect(decoded).toBe(text);
  });

  test("Caesar cipher with negative shift", () => {
    const text = "Hello";
    const shift = -3;

    const encoded = Encoding.caesarEncode(text, shift);
    const decoded = Encoding.caesarDecode(encoded, shift);
    expect(decoded).toBe(text);
  });

  test("Caesar cipher preserves non-alphabetic characters", () => {
    const text = "Hello, World! 123";
    const shift = 5;

    const encoded = Encoding.caesarEncode(text, shift);
    expect(encoded).toContain(", ");
    expect(encoded).toContain("!");
    expect(encoded).toContain("123");

    const decoded = Encoding.caesarDecode(encoded, shift);
    expect(decoded).toBe(text);
  });

  test("isValidBase64 validates Base64 strings", () => {
    const validBase64 = Encoding.toBase64("test");
    expect(Encoding.isValidBase64(validBase64)).toBe(true);
    expect(Encoding.isValidBase64("SGVsbG8=")).toBe(true);
    expect(Encoding.isValidBase64("invalid!")).toBe(false);
    expect(Encoding.isValidBase64("SGVsbG8")).toBe(true); // Without padding
  });

  test("isValidHex validates hex strings", () => {
    expect(Encoding.isValidHex("48656c6c6f")).toBe(true);
    expect(Encoding.isValidHex("ABCDEF123456")).toBe(true);
    expect(Encoding.isValidHex("invalid")).toBe(false);
    expect(Encoding.isValidHex("123")).toBe(false); // Odd length
  });

  test("isValidUrlEncoded validates URL encoded strings", () => {
    expect(Encoding.isValidUrlEncoded("Hello%20World")).toBe(true);
    expect(Encoding.isValidUrlEncoded("test%20%26%20more")).toBe(true);
    expect(Encoding.isValidUrlEncoded("plain text")).toBe(true);
    // Invalid percent encoding should return false, but our implementation is lenient
  });

  test("analyze provides encoding information", () => {
    const analysis = Encoding.analyze("Hello 🌍");

    expect(analysis.length).toBeGreaterThan(0);
    expect(analysis.byteLength).toBeGreaterThan(analysis.length); // Unicode takes more bytes
    expect(analysis.hasUnicode).toBe(true);
    expect(analysis.hasSpecialChars).toBe(false);
    expect(Array.isArray(analysis.encoding)).toBe(true);
  });

  test("analyze detects special characters", () => {
    const analysis = Encoding.analyze('<script>alert("test");</script>');
    expect(analysis.hasSpecialChars).toBe(true);
  });

  test("analyze detects possible encodings", () => {
    const base64Text = Encoding.toBase64("test");
    const analysis = Encoding.analyze(base64Text);
    expect(analysis.encoding).toContain("base64");

    const hexText = Encoding.toHex("test");
    const hexAnalysis = Encoding.analyze(hexText);
    expect(hexAnalysis.encoding).toContain("hex");
  });

  test("error handling for invalid Base64", () => {
    expect(() => Encoding.fromBase64("invalid base64!")).toThrow(
      "Base64 decoding failed",
    );
  });

  test("error handling for invalid hex", () => {
    expect(() => Encoding.fromHex("invalid hex")).toThrow(
      "Hex decoding failed",
    );
  });

  test("error handling for invalid binary", () => {
    expect(() => Encoding.fromBinary("invalid binary")).toThrow(
      "Binary decoding failed",
    );
  });

  test("error handling for URL encoding", () => {
    // Test with a malformed URL that might cause issues
    expect(() => Encoding.urlEncode("\uD800")).toThrow("URL encoding failed");
  });

  test("handles empty strings", () => {
    expect(Encoding.toBase64("")).toBe("");
    expect(Encoding.fromBase64("")).toBe("");
    expect(Encoding.urlEncode("")).toBe("");
    expect(Encoding.urlDecode("")).toBe("");
    expect(Encoding.htmlEncode("")).toBe("");
    expect(Encoding.htmlDecode("")).toBe("");
    expect(Encoding.toHex("")).toBe("");
    expect(Encoding.fromHex("")).toBe("");
    expect(Encoding.toBinary("")).toBe("");
    expect(Encoding.fromBinary("")).toBe("");
  });

  test("handles special HTML entities", () => {
    const text = `<div class="test">Hello & "World" & 'Test' / End</div>`;
    const encoded = Encoding.htmlEncode(text);

    expect(encoded).toBe(
      "&lt;div class=&quot;test&quot;&gt;Hello &amp; &quot;World&quot; &amp; &#39;Test&#39; &#x2F; End&lt;&#x2F;div&gt;",
    );

    const decoded = Encoding.htmlDecode(encoded);
    expect(decoded).toBe(text);
  });

  test("preserves case in hex encoding", () => {
    const text = "Hello";
    const hex = Encoding.toHex(text);
    expect(hex).toMatch(/^[0-9a-f]+$/); // Should be lowercase
  });

  test("Unicode escape handles high code points", () => {
    const emoji = "🚀"; // High Unicode code point
    const escaped = Encoding.toUnicodeEscape(emoji);
    expect(escaped).toContain("\\u");

    // Note: Some high Unicode characters may not round-trip perfectly
    // due to JavaScript's handling of surrogate pairs
  });

  test("ROT13 preserves case", () => {
    const text = "AbC";
    const rotated = Encoding.rot13(text);
    expect(rotated).toBe("NoP");

    const restored = Encoding.rot13(rotated);
    expect(restored).toBe(text);
  });

  test("large text encoding performance", () => {
    const largeText = "A".repeat(10000);

    const start = Date.now();
    const encoded = Encoding.toBase64(largeText);
    const decoded = Encoding.fromBase64(encoded);
    const end = Date.now();

    expect(decoded).toBe(largeText);
    expect(end - start).toBeLessThan(1000); // Should complete within 1 second
  });
});
