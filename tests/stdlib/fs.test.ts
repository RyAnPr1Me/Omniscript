import { FileSystem, FS } from "../../src/stdlib/fs";
import { describe, expect, test, beforeEach, afterEach } from "@jest/globals";
import * as path from "path";
import * as fs from "fs";

describe("Standard Library - FileSystem", () => {
  const testDir = path.join(__dirname, "test-fs");
  const testFile = path.join(testDir, "test.txt");
  const testContent = "Hello, FileSystem module!";

  beforeEach(async () => {
    // Create test directory
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
  });

  afterEach(async () => {
    // Clean up test directory
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  test("writeFile and readFile operations", async () => {
    await FileSystem.writeFile(testFile, testContent);
    const content = await FileSystem.readFile(testFile);
    expect(content).toBe(testContent);
  });

  test("appendFile operation", async () => {
    await FileSystem.writeFile(testFile, testContent);
    await FileSystem.appendFile(testFile, "\nAppended text");
    const content = await FileSystem.readFile(testFile);
    expect(content).toBe(testContent + "\nAppended text");
  });

  test("exists operation", async () => {
    expect(await FileSystem.exists(testFile)).toBe(false);
    await FileSystem.writeFile(testFile, testContent);
    expect(await FileSystem.exists(testFile)).toBe(true);
  });

  test("stat operation", async () => {
    await FileSystem.writeFile(testFile, testContent);
    const stats = await FileSystem.stat(testFile);

    expect(stats.isFile).toBe(true);
    expect(stats.isDirectory).toBe(false);
    expect(stats.size).toBeGreaterThan(0);
    expect(typeof stats.created).toBe("object");
    expect(typeof stats.modified).toBe("object");
    expect(typeof stats.accessed).toBe("object");
  });

  test("mkdir operation", async () => {
    const newDir = path.join(testDir, "new-directory");
    await FileSystem.mkdir(newDir);
    expect(await FileSystem.exists(newDir)).toBe(true);

    const stats = await FileSystem.stat(newDir);
    expect(stats.isDirectory).toBe(true);
  });

  test("readDir operation", async () => {
    await FileSystem.writeFile(testFile, testContent);
    await FileSystem.mkdir(path.join(testDir, "subdir"));

    const entries = await FileSystem.readDir(testDir);
    expect(entries.length).toBe(2);

    const fileEntry = entries.find((e) => e.name === "test.txt");
    const dirEntry = entries.find((e) => e.name === "subdir");

    expect(fileEntry?.type).toBe("file");
    expect(dirEntry?.type).toBe("directory");
  });

  test("copy operation", async () => {
    const copyFile = path.join(testDir, "copy.txt");
    await FileSystem.writeFile(testFile, testContent);
    await FileSystem.copy(testFile, copyFile);

    const content = await FileSystem.readFile(copyFile);
    expect(content).toBe(testContent);
  });

  test("move operation", async () => {
    const moveFile = path.join(testDir, "moved.txt");
    await FileSystem.writeFile(testFile, testContent);
    await FileSystem.move(testFile, moveFile);

    expect(await FileSystem.exists(testFile)).toBe(false);
    expect(await FileSystem.exists(moveFile)).toBe(true);

    const content = await FileSystem.readFile(moveFile);
    expect(content).toBe(testContent);
  });

  test("remove operation", async () => {
    await FileSystem.writeFile(testFile, testContent);
    expect(await FileSystem.exists(testFile)).toBe(true);

    await FileSystem.remove(testFile);
    expect(await FileSystem.exists(testFile)).toBe(false);
  });

  test("FS alias works", () => {
    expect(FS).toBe(FileSystem);
  });

  test("error handling for non-existent file", async () => {
    await expect(FileSystem.readFile("non-existent-file.txt")).rejects.toThrow(
      "Failed to read file",
    );
  });

  test("error handling for invalid stat", async () => {
    await expect(FileSystem.stat("non-existent-file.txt")).rejects.toThrow(
      "Failed to get file stats",
    );
  });
});
