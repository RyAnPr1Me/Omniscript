import { debug } from "../debug";

export interface StringPadOptions {
  character?: string;
  side?: "left" | "right" | "both";
}

export interface StringCaseOptions {
  locale?: string;
}

export class StringUtils {
  /**
   * Check if string is empty or only whitespace
   */
  static isEmpty(str: string): boolean {
    return !str || str.trim().length === 0;
  }

  /**
   * Check if string is not empty
   */
  static isNotEmpty(str: string): boolean {
    return !this.isEmpty(str);
  }

  /**
   * Capitalize first letter of string
   */
  static capitalize(str: string, options?: StringCaseOptions): string {
    if (!str) return str;
    return str.charAt(0).toLocaleUpperCase(options?.locale) + str.slice(1);
  }

  /**
   * Convert string to camelCase
   */
  static camelCase(str: string): string {
    return str
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
      })
      .replace(/\s+/g, "");
  }

  /**
   * Convert string to PascalCase
   */
  static pascalCase(str: string): string {
    return str
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => {
        return word.toUpperCase();
      })
      .replace(/\s+/g, "");
  }

  /**
   * Convert string to kebab-case
   */
  static kebabCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, "$1-$2")
      .replace(/[\s_]+/g, "-")
      .toLowerCase();
  }

  /**
   * Convert string to snake_case
   */
  static snakeCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, "$1_$2")
      .replace(/[\s-]+/g, "_")
      .toLowerCase();
  }

  /**
   * Pad string to specified length
   */
  static pad(str: string, length: number, options?: StringPadOptions): string {
    const char = options?.character || " ";
    const side = options?.side || "right";

    if (str.length >= length) return str;

    const padLength = length - str.length;
    const padding = char
      .repeat(Math.ceil(padLength / char.length))
      .slice(0, padLength);

    switch (side) {
      case "left":
        return padding + str;
      case "both": {
        const leftPad = Math.floor(padLength / 2);
        const rightPad = padLength - leftPad;
        return char.repeat(leftPad) + str + char.repeat(rightPad);
      }
      default:
        return str + padding;
    }
  }

  /**
   * Truncate string to max length with optional suffix
   */
  static truncate(
    str: string,
    maxLength: number,
    suffix: string = "...",
  ): string {
    if (str.length <= maxLength) return str;
    return str.slice(0, maxLength - suffix.length) + suffix;
  }

  /**
   * Repeat string n times with optional separator
   */
  static repeat(str: string, count: number, separator: string = ""): string {
    if (count <= 0) return "";
    return Array(count).fill(str).join(separator);
  }

  /**
   * Remove all whitespace from string
   */
  static removeWhitespace(str: string): string {
    return str.replace(/\s+/g, "");
  }

  /**
   * Normalize whitespace (replace multiple spaces with single space)
   */
  static normalizeWhitespace(str: string): string {
    return str.replace(/\s+/g, " ").trim();
  }

  /**
   * Reverse string
   */
  static reverse(str: string): string {
    return str.split("").reverse().join("");
  }

  /**
   * Count occurrences of substring
   */
  static count(str: string, search: string): number {
    if (!search) return 0;
    return (
      str.match(
        new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
      ) || []
    ).length;
  }

  /**
   * Check if string contains only digits
   */
  static isNumeric(str: string): boolean {
    return /^\d+$/.test(str);
  }

  /**
   * Check if string contains only letters
   */
  static isAlpha(str: string): boolean {
    return /^[a-zA-Z]+$/.test(str);
  }

  /**
   * Check if string contains only letters and digits
   */
  static isAlphanumeric(str: string): boolean {
    return /^[a-zA-Z0-9]+$/.test(str);
  }

  /**
   * Check if string is a valid email
   */
  static isEmail(str: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(str);
  }

  /**
   * Check if string is a valid URL
   */
  static isUrl(str: string): boolean {
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Extract all email addresses from string
   */
  static extractEmails(str: string): string[] {
    const emailRegex = /[^\s@]+@[^\s@]+\.[^\s@]+/g;
    return str.match(emailRegex) || [];
  }

  /**
   * Extract all URLs from string
   */
  static extractUrls(str: string): string[] {
    const urlRegex = /https?:\/\/[^\s]+/g;
    return str.match(urlRegex) || [];
  }

  /**
   * Generate random string of specified length
   */
  static random(
    length: number,
    charset: string = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
  ): string {
    let result = "";
    for (let i = 0; i < length; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return result;
  }

  /**
   * Generate random alphanumeric string
   */
  static randomAlphanumeric(length: number): string {
    return this.random(length);
  }

  /**
   * Generate random alphabetic string
   */
  static randomAlpha(length: number): string {
    return this.random(
      length,
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
    );
  }

  /**
   * Generate random numeric string
   */
  static randomNumeric(length: number): string {
    return this.random(length, "0123456789");
  }

  /**
   * Generate UUID v4
   */
  static uuid(): string {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      },
    );
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  static levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1)
      .fill(null)
      .map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) {
      matrix[0][i] = i;
    }

    for (let j = 0; j <= str2.length; j++) {
      matrix[j][0] = j;
    }

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // deletion
          matrix[j - 1][i] + 1, // insertion
          matrix[j - 1][i - 1] + indicator, // substitution
        );
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Calculate string similarity (0-1 based on Levenshtein distance)
   */
  static similarity(str1: string, str2: string): number {
    const distance = this.levenshteinDistance(str1, str2);
    const maxLength = Math.max(str1.length, str2.length);
    return maxLength === 0 ? 1 : 1 - distance / maxLength;
  }

  /**
   * Split string and trim each part
   */
  static splitAndTrim(str: string, separator: string | RegExp): string[] {
    return str
      .split(separator)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }

  /**
   * Join array with different separators for last item
   */
  static joinNatural(
    items: string[],
    separator: string = ", ",
    lastSeparator: string = " and ",
  ): string {
    if (items.length === 0) return "";
    if (items.length === 1) return items[0];
    if (items.length === 2) return items.join(lastSeparator);

    const allButLast = items.slice(0, -1);
    const last = items[items.length - 1];
    return allButLast.join(separator) + lastSeparator + last;
  }

  /**
   * Escape HTML special characters
   */
  static escapeHtml(str: string): string {
    const htmlEscapes: { [key: string]: string } = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return str.replace(/[&<>"']/g, (match) => htmlEscapes[match]);
  }

  /**
   * Unescape HTML entities
   */
  static unescapeHtml(str: string): string {
    const htmlUnescapes: { [key: string]: string } = {
      "&amp;": "&",
      "&lt;": "<",
      "&gt;": ">",
      "&quot;": '"',
      "&#39;": "'",
    };
    return str.replace(
      /&(amp|lt|gt|quot|#39);/g,
      (match) => htmlUnescapes[match],
    );
  }

  /**
   * Convert string to title case
   */
  static titleCase(str: string): string {
    return str.replace(
      /\w\S*/g,
      (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(),
    );
  }

  /**
   * Extract words from string
   */
  static words(str: string): string[] {
    return str.match(/\b\w+\b/g) || [];
  }

  /**
   * Count words in string
   */
  static wordCount(str: string): number {
    return this.words(str).length;
  }
}

// Export as both StringUtils and String for convenience
export { StringUtils as String };
