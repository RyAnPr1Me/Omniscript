import { Regex } from "../../src/stdlib/regex";
import { describe, expect, test } from "@jest/globals";

describe("Standard Library - Regex", () => {
  test("create regex from string", () => {
    const regex = new Regex("test", "i");
    expect(regex.source).toBe("test");
    expect(regex.flags).toContain("i");
  });

  test("create regex from RegExp object", () => {
    const originalRegex = /test/gi;
    const regex = new Regex(originalRegex);
    expect(regex.source).toBe("test");
    expect(regex.flags).toBe("gi");
  });

  test("test method checks if pattern matches", () => {
    const regex = new Regex("hello", "i");
    expect(regex.test("Hello World")).toBe(true);
    expect(regex.test("Goodbye")).toBe(false);
  });

  test("match method finds first match", () => {
    const regex = new Regex("(\\d+)-(\\d+)");
    const result = regex.match("Phone: 123-456-7890");

    expect(result).toBeTruthy();
    expect(result!.match).toBe("123-456");
    expect(result!.index).toBe(7);
    expect(result!.groups).toEqual(["123", "456"]);
  });

  test("match method returns null for no match", () => {
    const regex = new Regex("\\d+");
    const result = regex.match("No numbers here");
    expect(result).toBeNull();
  });

  test("matchAll method finds all matches", () => {
    const regex = new Regex("\\d+", "g");
    const results = regex.matchAll("Numbers: 123, 456, 789");

    expect(results).toHaveLength(3);
    expect(results[0].match).toBe("123");
    expect(results[1].match).toBe("456");
    expect(results[2].match).toBe("789");
  });

  test("replace method with string replacement", () => {
    const regex = new Regex("\\d+", "g");
    const result = regex.replace("Phone: 123-456", "XXX");
    expect(result).toBe("Phone: XXX-XXX");
  });

  test("replace method with function replacement", () => {
    const regex = new Regex("(\\d+)", "g");
    const result = regex.replace("Values: 5, 10", (match) => {
      return (parseInt(match.match) * 2).toString();
    });
    expect(result).toBe("Values: 10, 20");
  });

  test("split method divides string by pattern", () => {
    const regex = new Regex("[,;]");
    const result = regex.split("apple,banana;cherry");
    expect(result).toEqual(["apple", "banana", "cherry"]);
  });

  test("split method with limit", () => {
    const regex = new Regex(",");
    const result = regex.split("a,b,c,d", 2);
    expect(result).toEqual(["a", "b"]);
  });

  // Static method tests

  test("escape method escapes special characters", () => {
    const escaped = Regex.escape("Hello. (World) [Test]? $5 + *star*");
    const regex = new Regex(escaped);
    expect(regex.test("Hello. (World) [Test]? $5 + *star*")).toBe(true);
  });

  test("create method with options", () => {
    const regex = Regex.create("test", {
      global: true,
      ignoreCase: true,
      multiline: true,
    });
    expect(regex.flags).toContain("g");
    expect(regex.flags).toContain("i");
    expect(regex.flags).toContain("m");
  });

  test("static test method", () => {
    expect(Regex.test("\\d+", "123")).toBe(true);
    expect(Regex.test("\\d+", "abc")).toBe(false);
  });

  test("static match method", () => {
    const result = Regex.match("(\\w+)", "Hello World");
    expect(result!.match).toBe("Hello");
    expect(result!.groups).toEqual(["Hello"]);
  });

  test("static matchAll method", () => {
    const results = Regex.matchAll("\\w+", "Hello World Test", "g");
    expect(results).toHaveLength(3);
    expect(results.map((r) => r.match)).toEqual(["Hello", "World", "Test"]);
  });

  test("static replace method", () => {
    const result = Regex.replace("\\d+", "123 and 456", "NUM", "g");
    expect(result).toBe("NUM and NUM");
  });

  test("static split method", () => {
    const result = Regex.split("\\s+", "Hello   World  Test");
    expect(result).toEqual(["Hello", "World", "Test"]);
  });

  // Pattern validation tests

  test("isEmail validates email addresses", () => {
    expect(Regex.isEmail("test@example.com")).toBe(true);
    expect(Regex.isEmail("user.name+tag@domain.co.uk")).toBe(true);
    expect(Regex.isEmail("invalid-email")).toBe(false);
    expect(Regex.isEmail("@domain.com")).toBe(false);
  });

  test("isUrl validates URLs", () => {
    expect(Regex.isUrl("https://example.com")).toBe(true);
    expect(Regex.isUrl("http://www.site.org/path?query=1")).toBe(true);
    expect(Regex.isUrl("not-a-url")).toBe(false);
    expect(Regex.isUrl("ftp://example.com")).toBe(false);
  });

  test("isPhone validates phone numbers", () => {
    expect(Regex.isPhone("+1234567890")).toBe(true);
    expect(Regex.isPhone("1234567890")).toBe(true);
    expect(Regex.isPhone("123")).toBe(false);
    expect(Regex.isPhone("abc123")).toBe(false);
  });

  test("isIPv4 validates IPv4 addresses", () => {
    expect(Regex.isIPv4("192.168.1.1")).toBe(true);
    expect(Regex.isIPv4("10.0.0.255")).toBe(true);
    expect(Regex.isIPv4("256.1.1.1")).toBe(false);
    expect(Regex.isIPv4("192.168.1")).toBe(false);
  });

  test("isIPv6 validates IPv6 addresses", () => {
    expect(Regex.isIPv6("2001:0db8:85a3:0000:0000:8a2e:0370:7334")).toBe(true);
    expect(Regex.isIPv6("invalid-ipv6")).toBe(false);
  });

  test("isUUID validates UUID format", () => {
    expect(Regex.isUUID("550e8400-e29b-41d4-a716-446655440000")).toBe(true);
    expect(Regex.isUUID("not-a-uuid")).toBe(false);
  });

  test("isHexColor validates hex colors", () => {
    expect(Regex.isHexColor("#ff0000")).toBe(true);
    expect(Regex.isHexColor("#F0F")).toBe(true);
    expect(Regex.isHexColor("red")).toBe(false);
    expect(Regex.isHexColor("#gg0000")).toBe(false);
  });

  test("extractEmails finds email addresses in text", () => {
    const text = "Contact us at support@example.com or sales@company.org";
    const emails = Regex.extractEmails(text);
    expect(emails).toEqual(["support@example.com", "sales@company.org"]);
  });

  test("extractUrls finds URLs in text", () => {
    const text = "Visit https://example.com or http://test.org for more info";
    const urls = Regex.extractUrls(text);
    expect(urls).toEqual(["https://example.com", "http://test.org"]);
  });

  test("common patterns are accessible", () => {
    expect(Regex.patterns.email).toBeInstanceOf(RegExp);
    expect(Regex.patterns.url).toBeInstanceOf(RegExp);
    expect(Regex.patterns.phone).toBeInstanceOf(RegExp);
    expect(Regex.patterns.ipv4).toBeInstanceOf(RegExp);
  });

  test("error handling for invalid pattern", () => {
    expect(() => new Regex("[")).toThrow("Invalid regex");
  });

  test("static methods handle errors gracefully", () => {
    expect(Regex.test("[", "test")).toBe(false);
    expect(Regex.match("[", "test")).toBeNull();
    expect(Regex.matchAll("[", "test")).toEqual([]);
    expect(Regex.replace("[", "test", "replacement")).toBe("test");
    expect(Regex.split("[", "test")).toEqual(["test"]);
  });

  test("named groups support", () => {
    const regex = new Regex("(?<year>\\d{4})-(?<month>\\d{2})-(?<day>\\d{2})");
    const result = regex.match("Date: 2023-12-25");

    expect(result!.namedGroups).toBeTruthy();
    expect(result!.namedGroups!.year).toBe("2023");
    expect(result!.namedGroups!.month).toBe("12");
    expect(result!.namedGroups!.day).toBe("25");
  });

  test("toString returns string representation", () => {
    const regex = new Regex("test", "gi");
    expect(regex.toString()).toBe("/test/gi");
  });
});
