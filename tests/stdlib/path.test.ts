import { Path } from "../../src/stdlib/path";
import { describe, expect, test } from "@jest/globals";

describe("Standard Library - Path", () => {
  test("sep returns correct path separator", () => {
    expect(typeof Path.sep).toBe("string");
    expect(["/", "\\"].includes(Path.sep)).toBe(true);
  });

  test("delimiter returns correct path delimiter", () => {
    expect(typeof Path.delimiter).toBe("string");
    expect([":", ";"].includes(Path.delimiter)).toBe(true);
  });

  test("join combines path segments", () => {
    expect(Path.join("a", "b", "c")).toBe(
      "a" + Path.sep + "b" + Path.sep + "c",
    );
    expect(Path.join("/a", "b", "c")).toBe(
      Path.sep + "a" + Path.sep + "b" + Path.sep + "c",
    );
    expect(Path.join("a", "../b", "c")).toBe("b" + Path.sep + "c");
    expect(Path.join()).toBe(".");
  });

  test("join handles empty and invalid segments", () => {
    expect(Path.join("a", "", "b")).toBe("a" + Path.sep + "b");
    expect(Path.join("a", null as any, "b")).toBe("a" + Path.sep + "b");
  });

  test("normalize resolves . and .. segments", () => {
    expect(Path.normalize("a/b/../c")).toBe("a" + Path.sep + "c");
    expect(Path.normalize("a/./b")).toBe("a" + Path.sep + "b");
    expect(Path.normalize("./a/b")).toBe("a" + Path.sep + "b");
    expect(Path.normalize("../a/b")).toBe(
      ".." + Path.sep + "a" + Path.sep + "b",
    );
    expect(Path.normalize("")).toBe(".");
  });

  test("normalize handles absolute paths", () => {
    expect(Path.normalize("/a/b/../c")).toBe(Path.sep + "a" + Path.sep + "c");
    expect(Path.normalize("/a/./b")).toBe(Path.sep + "a" + Path.sep + "b");
    expect(Path.normalize("/../a")).toBe(Path.sep + "a");
  });

  test("isAbsolute detects absolute paths", () => {
    expect(Path.isAbsolute("/path")).toBe(true);
    expect(Path.isAbsolute("relative/path")).toBe(false);
    expect(Path.isAbsolute("./relative")).toBe(false);
    expect(Path.isAbsolute("")).toBe(false);
  });

  test("dirname returns directory path", () => {
    expect(Path.dirname("/a/b/c")).toBe(Path.sep + "a" + Path.sep + "b");
    expect(Path.dirname("a/b/c")).toBe("a" + Path.sep + "b");
    expect(Path.dirname("file.txt")).toBe(".");
    expect(Path.dirname("/")).toBe(Path.sep);
    expect(Path.dirname("")).toBe(".");
  });

  test("basename returns file name", () => {
    expect(Path.basename("/a/b/file.txt")).toBe("file.txt");
    expect(Path.basename("file.txt")).toBe("file.txt");
    expect(Path.basename("/a/b/file.txt", ".txt")).toBe("file");
    expect(Path.basename("/a/b/c")).toBe("c"); // No trailing separator
    expect(Path.basename("/a/b/")).toBe(""); // Trailing separator = empty basename
    expect(Path.basename("")).toBe("");
  });

  test("extname returns file extension", () => {
    expect(Path.extname("file.txt")).toBe(".txt");
    expect(Path.extname("file.tar.gz")).toBe(".gz");
    expect(Path.extname("file")).toBe("");
    expect(Path.extname(".hidden")).toBe("");
    expect(Path.extname("path/file.txt")).toBe(".txt");
    expect(Path.extname("")).toBe("");
  });

  test("parse breaks down path components", () => {
    const parsed = Path.parse("/home/user/file.txt");
    expect(parsed.root).toBe(Path.sep);
    expect(parsed.dir).toBe(Path.sep + "home" + Path.sep + "user");
    expect(parsed.base).toBe("file.txt");
    expect(parsed.name).toBe("file");
    expect(parsed.ext).toBe(".txt");
  });

  test("parse handles relative paths", () => {
    const parsed = Path.parse("folder/file.txt");
    expect(parsed.root).toBe("");
    expect(parsed.dir).toBe("folder");
    expect(parsed.base).toBe("file.txt");
    expect(parsed.name).toBe("file");
    expect(parsed.ext).toBe(".txt");
  });

  test("parse handles edge cases", () => {
    const emptyParsed = Path.parse("");
    expect(emptyParsed.root).toBe("");
    expect(emptyParsed.dir).toBe("");
    expect(emptyParsed.base).toBe("");
    expect(emptyParsed.name).toBe("");
    expect(emptyParsed.ext).toBe("");
  });

  test("format reconstructs path from components", () => {
    const pathObj = {
      root: Path.sep,
      dir: Path.sep + "home" + Path.sep + "user",
      base: "file.txt",
    };
    const formatted = Path.format(pathObj);
    expect(formatted).toBe(
      Path.sep + "home" + Path.sep + "user" + Path.sep + "file.txt",
    );
  });

  test("format with name and ext instead of base", () => {
    const pathObj = {
      dir: "folder",
      name: "file",
      ext: ".txt",
    };
    const formatted = Path.format(pathObj);
    expect(formatted).toBe("folder" + Path.sep + "file.txt");
  });

  test("format handles empty object", () => {
    const formatted = Path.format({});
    expect(formatted).toBe(".");
  });

  test("relative calculates relative path", () => {
    const from = "/a/b/c";
    const to = "/a/d/e";
    const relative = Path.relative(from, to);
    expect(relative).toBe(
      ".." + Path.sep + ".." + Path.sep + "d" + Path.sep + "e",
    );
  });

  test("relative with same paths", () => {
    const path = "/a/b/c";
    expect(Path.relative(path, path)).toBe(".");
  });

  test("relative with nested paths", () => {
    const from = "/a/b";
    const to = "/a/b/c/d";
    expect(Path.relative(from, to)).toBe("c" + Path.sep + "d");
  });

  test("toPosix converts to forward slashes", () => {
    expect(Path.toPosix("a\\b\\c")).toBe("a/b/c");
    expect(Path.toPosix("a/b/c")).toBe("a/b/c");
  });

  test("toWindows converts to backslashes", () => {
    expect(Path.toWindows("a/b/c")).toBe("a\\b\\c");
    expect(Path.toWindows("a\\b\\c")).toBe("a\\b\\c");
  });

  test("equals compares normalized paths", () => {
    expect(Path.equals("a/b/c", "a/b/c")).toBe(true);
    expect(Path.equals("a/b/../c", "a/c")).toBe(true);
    expect(Path.equals("a/b/c", "a/b/d")).toBe(false);
  });

  test("commonPrefix finds common path prefix", () => {
    const common = Path.commonPrefix("/a/b/c", "/a/b/d", "/a/e/f");
    expect(common).toBe(Path.sep + "a");
  });

  test("commonPrefix with no common prefix", () => {
    const common = Path.commonPrefix("/a/b", "/c/d");
    expect(common).toBe(Path.sep); // Root is the common prefix for absolute paths
  });

  test("commonPrefix with single path", () => {
    const common = Path.commonPrefix("/a/b/c");
    expect(common).toBe(Path.sep + "a" + Path.sep + "b");
  });

  test("commonPrefix with empty array", () => {
    const common = Path.commonPrefix();
    expect(common).toBe("");
  });

  test("isWithin checks if path is within another", () => {
    expect(Path.isWithin("/a", "/a/b")).toBe(true);
    expect(Path.isWithin("/a/b", "/a/b/c")).toBe(true);
    expect(Path.isWithin("/a", "/b")).toBe(false);
    expect(Path.isWithin("/a/b", "/a/c")).toBe(false);
    expect(Path.isWithin("/a", "/a")).toBe(false); // Same path
  });

  test("stem returns filename without extension", () => {
    expect(Path.stem("/path/file.txt")).toBe("file");
    expect(Path.stem("file.tar.gz")).toBe("file.tar");
    expect(Path.stem("file")).toBe("file");
    expect(Path.stem(".hidden")).toBe(".hidden");
  });

  test("changeExtension modifies file extension", () => {
    expect(Path.changeExtension("/path/file.txt", ".md")).toBe(
      Path.sep + "path" + Path.sep + "file.md",
    );
    expect(Path.changeExtension("file.txt", "md")).toBe("file.md"); // Without dot
    expect(Path.changeExtension("file", ".txt")).toBe("file.txt");
  });

  test("addSuffix adds suffix before extension", () => {
    expect(Path.addSuffix("/path/file.txt", "-backup")).toBe(
      Path.sep + "path" + Path.sep + "file-backup.txt",
    );
    expect(Path.addSuffix("file", "-backup")).toBe("file-backup");
  });

  test("addPrefix adds prefix to filename", () => {
    expect(Path.addPrefix("/path/file.txt", "old-")).toBe(
      Path.sep + "path" + Path.sep + "old-file.txt",
    );
    expect(Path.addPrefix("file.txt", "backup-")).toBe("backup-file.txt");
  });

  test("resolve creates absolute paths", () => {
    // Note: resolve behavior depends on current working directory
    // We'll test relative behavior
    const resolved = Path.resolve("a", "b");
    expect(Path.isAbsolute(resolved)).toBe(true);
    expect(resolved.endsWith("a" + Path.sep + "b")).toBe(true);
  });

  test("resolve with absolute path", () => {
    const resolved = Path.resolve("/a", "b", "c");
    expect(resolved).toBe(Path.sep + "a" + Path.sep + "b" + Path.sep + "c");
  });

  test("resolve with .. navigation", () => {
    const resolved = Path.resolve("/a/b", "../c");
    expect(resolved).toBe(Path.sep + "a" + Path.sep + "c");
  });

  test("handles trailing separators correctly", () => {
    expect(Path.normalize("a/b/")).toBe("a" + Path.sep + "b" + Path.sep);
    expect(Path.normalize("a/b///")).toBe("a" + Path.sep + "b" + Path.sep);
  });

  test("handles multiple consecutive separators", () => {
    expect(Path.normalize("a//b///c")).toBe(
      "a" + Path.sep + "b" + Path.sep + "c",
    );
    expect(Path.join("a", "", "", "b")).toBe("a" + Path.sep + "b");
  });

  test("works with mixed separator types", () => {
    expect(Path.normalize("a\\b/c")).toBe(
      "a" + Path.sep + "b" + Path.sep + "c",
    );
  });
});
