/* eslint-disable @typescript-eslint/no-require-imports */
import { debug } from '../debug';

export interface FileStats {
  size: number;
  isFile: boolean;
  isDirectory: boolean;
  isSymbolicLink: boolean;
  created: Date;
  modified: Date;
  accessed: Date;
}

export interface DirectoryEntry {
  name: string;
  type: 'file' | 'directory' | 'symlink';
  size?: number;
}

export class FileSystem {
  /**
   * Read file contents as string
   */
  static async readFile(path: string, encoding: string = 'utf8'): Promise<string> {
    try {
      if (typeof require !== 'undefined') {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const fs = require('fs').promises;
        return await fs.readFile(path, encoding);
      }
      throw new Error('File system operations not available in this environment');
    } catch (error) {
      debug.error('FileSystem', `Failed to read file ${path}: ${error}`);
      throw new Error(`Failed to read file: ${error}`);
    }
  }

  /**
   * Write string content to file
   */
  static async writeFile(path: string, data: string, encoding: string = 'utf8'): Promise<void> {
    try {
      if (typeof require !== 'undefined') {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const fs = require('fs').promises;
        await fs.writeFile(path, data, encoding);
      } else {
        throw new Error('File system operations not available in this environment');
      }
    } catch (error) {
      debug.error('FileSystem', `Failed to write file ${path}: ${error}`);
      throw new Error(`Failed to write file: ${error}`);
    }
  }

  /**
   * Append string content to file
   */
  static async appendFile(path: string, data: string, encoding: string = 'utf8'): Promise<void> {
    try {
      if (typeof require !== 'undefined') {
        const fs = require('fs').promises;
        await fs.appendFile(path, data, encoding);
      } else {
        throw new Error('File system operations not available in this environment');
      }
    } catch (error) {
      debug.error('FileSystem', `Failed to append to file ${path}: ${error}`);
      throw new Error(`Failed to append to file: ${error}`);
    }
  }

  /**
   * Check if file or directory exists
   */
  static async exists(path: string): Promise<boolean> {
    try {
      if (typeof require !== 'undefined') {
        const fs = require('fs').promises;
        await fs.access(path);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  /**
   * Get file/directory statistics
   */
  static async stat(path: string): Promise<FileStats> {
    try {
      if (typeof require !== 'undefined') {
        const fs = require('fs').promises;
        const stats = await fs.stat(path);
        return {
          size: stats.size,
          isFile: stats.isFile(),
          isDirectory: stats.isDirectory(),
          isSymbolicLink: stats.isSymbolicLink(),
          created: stats.birthtime,
          modified: stats.mtime,
          accessed: stats.atime
        };
      }
      throw new Error('File system operations not available in this environment');
    } catch (error) {
      debug.error('FileSystem', `Failed to get stats for ${path}: ${error}`);
      throw new Error(`Failed to get file stats: ${error}`);
    }
  }

  /**
   * Create directory (and parent directories if needed)
   */
  static async mkdir(path: string, recursive: boolean = false): Promise<void> {
    try {
      if (typeof require !== 'undefined') {
        const fs = require('fs').promises;
        await fs.mkdir(path, { recursive });
      } else {
        throw new Error('File system operations not available in this environment');
      }
    } catch (error) {
      debug.error('FileSystem', `Failed to create directory ${path}: ${error}`);
      throw new Error(`Failed to create directory: ${error}`);
    }
  }

  /**
   * Remove file or directory
   */
  static async remove(path: string, recursive: boolean = false): Promise<void> {
    try {
      if (typeof require !== 'undefined') {
        const fs = require('fs').promises;
        const stats = await this.stat(path);
        if (stats.isDirectory) {
          await fs.rmdir(path, { recursive });
        } else {
          await fs.unlink(path);
        }
      } else {
        throw new Error('File system operations not available in this environment');
      }
    } catch (error) {
      debug.error('FileSystem', `Failed to remove ${path}: ${error}`);
      throw new Error(`Failed to remove: ${error}`);
    }
  }

  /**
   * List directory contents
   */
  static async readDir(path: string): Promise<DirectoryEntry[]> {
    try {
      if (typeof require !== 'undefined') {
        const fs = require('fs').promises;
        const entries = await fs.readdir(path, { withFileTypes: true });
        return entries.map((entry: any) => ({
          name: entry.name,
          type: entry.isFile() ? 'file' : entry.isDirectory() ? 'directory' : 'symlink'
        }));
      }
      throw new Error('File system operations not available in this environment');
    } catch (error) {
      debug.error('FileSystem', `Failed to read directory ${path}: ${error}`);
      throw new Error(`Failed to read directory: ${error}`);
    }
  }

  /**
   * Copy file from source to destination
   */
  static async copy(source: string, destination: string): Promise<void> {
    try {
      if (typeof require !== 'undefined') {
        const fs = require('fs').promises;
        await fs.copyFile(source, destination);
      } else {
        throw new Error('File system operations not available in this environment');
      }
    } catch (error) {
      debug.error('FileSystem', `Failed to copy ${source} to ${destination}: ${error}`);
      throw new Error(`Failed to copy file: ${error}`);
    }
  }

  /**
   * Move/rename file or directory
   */
  static async move(source: string, destination: string): Promise<void> {
    try {
      if (typeof require !== 'undefined') {
        const fs = require('fs').promises;
        await fs.rename(source, destination);
      } else {
        throw new Error('File system operations not available in this environment');
      }
    } catch (error) {
      debug.error('FileSystem', `Failed to move ${source} to ${destination}: ${error}`);
      throw new Error(`Failed to move: ${error}`);
    }
  }

  /**
   * Create a readable stream for large files
   */
  static createReadStream(path: string, options?: { encoding?: string; start?: number; end?: number }): any {
    if (typeof require !== 'undefined') {
      const fs = require('fs');
      return fs.createReadStream(path, options);
    }
    throw new Error('Streams not available in this environment');
  }

  /**
   * Create a writable stream for large files
   */
  static createWriteStream(path: string, options?: { encoding?: string; flags?: string }): any {
    if (typeof require !== 'undefined') {
      const fs = require('fs');
      return fs.createWriteStream(path, options);
    }
    throw new Error('Streams not available in this environment');
  }
}

// Export for compatibility
export { FileSystem as FS };