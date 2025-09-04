import { debug } from '../debug';

export interface RegexMatch {
  match: string;
  index: number;
  groups: string[];
  namedGroups?: Record<string, string>;
}

export interface RegexReplaceOptions {
  global?: boolean;
  ignoreCase?: boolean;
  multiline?: boolean;
  dotAll?: boolean;
  unicode?: boolean;
  sticky?: boolean;
}

export class Regex {
  private pattern: RegExp;

  constructor(pattern: string | RegExp, flags?: string) {
    try {
      if (pattern instanceof RegExp) {
        this.pattern = pattern;
      } else {
        this.pattern = new RegExp(pattern, flags);
      }
    } catch (error) {
      debug.error('Regex', `Invalid regex pattern: ${error}`);
      throw new Error(`Invalid regex: ${error}`);
    }
  }

  /**
   * Test if pattern matches string
   */
  test(input: string): boolean {
    return this.pattern.test(input);
  }

  /**
   * Find first match in string
   */
  match(input: string): RegexMatch | null {
    const match = this.pattern.exec(input);
    if (!match) return null;

    return {
      match: match[0],
      index: match.index!,
      groups: match.slice(1),
      namedGroups: match.groups
    };
  }

  /**
   * Find all matches in string
   */
  matchAll(input: string): RegexMatch[] {
    const matches: RegexMatch[] = [];
    let match: RegExpExecArray | null;
    
    // Create a global version of the regex
    const globalPattern = new RegExp(this.pattern.source, this.pattern.flags + (this.pattern.global ? '' : 'g'));
    
    while ((match = globalPattern.exec(input)) !== null) {
      matches.push({
        match: match[0],
        index: match.index!,
        groups: match.slice(1),
        namedGroups: match.groups
      });
      
      // Prevent infinite loop on zero-length matches
      if (match.index === globalPattern.lastIndex) {
        globalPattern.lastIndex++;
      }
    }
    
    return matches;
  }

  /**
   * Replace matches in string
   */
  replace(input: string, replacement: string | ((match: RegexMatch) => string)): string {
    if (typeof replacement === 'string') {
      return input.replace(this.pattern, replacement);
    }

    return input.replace(this.pattern, (match, ...args) => {
      const index = args[args.length - 2];
      const groups = args.slice(0, -2);
      const namedGroups = args[args.length - 1];
      
      return replacement({
        match,
        index,
        groups,
        namedGroups: typeof namedGroups === 'object' ? namedGroups : undefined
      });
    });
  }

  /**
   * Split string by regex pattern
   */
  split(input: string, limit?: number): string[] {
    return input.split(this.pattern, limit);
  }

  /**
   * Get the regex pattern as string
   */
  toString(): string {
    return this.pattern.toString();
  }

  /**
   * Get the regex flags
   */
  get flags(): string {
    return this.pattern.flags;
  }

  /**
   * Get the regex source
   */
  get source(): string {
    return this.pattern.source;
  }

  // Static utility methods

  /**
   * Escape special regex characters in string
   */
  static escape(input: string): string {
    return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Create regex from string with flags
   */
  static create(pattern: string, options?: RegexReplaceOptions): Regex {
    let flags = '';
    if (options?.global) flags += 'g';
    if (options?.ignoreCase) flags += 'i';
    if (options?.multiline) flags += 'm';
    if (options?.dotAll) flags += 's';
    if (options?.unicode) flags += 'u';
    if (options?.sticky) flags += 'y';
    
    return new Regex(pattern, flags);
  }

  /**
   * Test if string matches pattern
   */
  static test(pattern: string, input: string, flags?: string): boolean {
    try {
      const regex = new RegExp(pattern, flags);
      return regex.test(input);
    } catch (error) {
      debug.error('Regex', `Test failed: ${error}`);
      return false;
    }
  }

  /**
   * Find first match
   */
  static match(pattern: string, input: string, flags?: string): RegexMatch | null {
    try {
      const regex = new Regex(pattern, flags);
      return regex.match(input);
    } catch (error) {
      debug.error('Regex', `Match failed: ${error}`);
      return null;
    }
  }

  /**
   * Find all matches
   */
  static matchAll(pattern: string, input: string, flags?: string): RegexMatch[] {
    try {
      const regex = new Regex(pattern, flags);
      return regex.matchAll(input);
    } catch (error) {
      debug.error('Regex', `MatchAll failed: ${error}`);
      return [];
    }
  }

  /**
   * Replace matches
   */
  static replace(pattern: string, input: string, replacement: string | ((match: RegexMatch) => string), flags?: string): string {
    try {
      const regex = new Regex(pattern, flags);
      return regex.replace(input, replacement);
    } catch (error) {
      debug.error('Regex', `Replace failed: ${error}`);
      return input;
    }
  }

  /**
   * Split string
   */
  static split(pattern: string, input: string, limit?: number, flags?: string): string[] {
    try {
      const regex = new Regex(pattern, flags);
      return regex.split(input, limit);
    } catch (error) {
      debug.error('Regex', `Split failed: ${error}`);
      return [input];
    }
  }

  // Common regex patterns
  static readonly patterns = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/,
    phone: /^[+]?[1-9][\d]{7,15}$/,
    creditCard: /^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3[0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})$/,
    ipv4: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
    ipv6: /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/,
    uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    hexColor: /^#(?:[0-9a-fA-F]{3}){1,2}$/,
    base64: /^[A-Za-z0-9+/]*={0,2}$/,
    alphanumeric: /^[a-zA-Z0-9]+$/,
    numeric: /^[0-9]+$/,
    alpha: /^[a-zA-Z]+$/
  };

  /**
   * Validate email format
   */
  static isEmail(input: string): boolean {
    return this.patterns.email.test(input);
  }

  /**
   * Validate URL format
   */
  static isUrl(input: string): boolean {
    return this.patterns.url.test(input);
  }

  /**
   * Validate phone number format
   */
  static isPhone(input: string): boolean {
    return this.patterns.phone.test(input);
  }

  /**
   * Validate IPv4 address format
   */
  static isIPv4(input: string): boolean {
    return this.patterns.ipv4.test(input);
  }

  /**
   * Validate IPv6 address format
   */
  static isIPv6(input: string): boolean {
    return this.patterns.ipv6.test(input);
  }

  /**
   * Validate UUID format
   */
  static isUUID(input: string): boolean {
    return this.patterns.uuid.test(input);
  }

  /**
   * Validate hex color format
   */
  static isHexColor(input: string): boolean {
    return this.patterns.hexColor.test(input);
  }

  /**
   * Extract all email addresses from text
   */
  static extractEmails(text: string): string[] {
    const matches = text.match(/[^\s@]+@[^\s@]+\.[^\s@]+/g);
    return matches || [];
  }

  /**
   * Extract all URLs from text
   */
  static extractUrls(text: string): string[] {
    const matches = text.match(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/g);
    return matches || [];
  }
}