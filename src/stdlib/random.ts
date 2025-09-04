import { debug } from "../debug";

export interface RandomOptions {
  seed?: number;
}

export interface WeightedItem<T> {
  item: T;
  weight: number;
}

export class RandomUtils {
  private static seed: number | null = null;

  /**
   * Set seed for reproducible random numbers
   */
  static setSeed(seed: number): void {
    this.seed = seed;
  }

  /**
   * Get seeded random number or use Math.random
   */
  private static getRandom(): number {
    if (this.seed !== null) {
      // Simple LCG (Linear Congruential Generator)
      this.seed = (this.seed * 1664525 + 1013904223) % Math.pow(2, 32);
      return this.seed / Math.pow(2, 32);
    }
    return Math.random();
  }

  /**
   * Generate random integer between min and max (inclusive)
   */
  static int(min: number, max: number): number {
    return Math.floor(this.getRandom() * (max - min + 1)) + min;
  }

  /**
   * Generate random float between min and max
   */
  static float(min: number = 0, max: number = 1): number {
    return this.getRandom() * (max - min) + min;
  }

  /**
   * Generate random boolean
   */
  static boolean(probability: number = 0.5): boolean {
    return this.getRandom() < probability;
  }

  /**
   * Pick random element from array
   */
  static choice<T>(array: T[]): T {
    if (array.length === 0) {
      throw new Error("Cannot pick from empty array");
    }
    return array[this.int(0, array.length - 1)];
  }

  /**
   * Pick multiple random elements from array (with replacement)
   */
  static choices<T>(array: T[], count: number): T[] {
    const result: T[] = [];
    for (let i = 0; i < count; i++) {
      result.push(this.choice(array));
    }
    return result;
  }

  /**
   * Sample random elements from array (without replacement)
   */
  static sample<T>(array: T[], count: number): T[] {
    if (count > array.length) {
      throw new Error("Sample size cannot be larger than array length");
    }

    const shuffled = this.shuffle([...array]);
    return shuffled.slice(0, count);
  }

  /**
   * Weighted random selection
   */
  static weightedChoice<T>(items: WeightedItem<T>[]): T {
    const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
    const random = this.float(0, totalWeight);

    let currentWeight = 0;
    for (const item of items) {
      currentWeight += item.weight;
      if (random <= currentWeight) {
        return item.item;
      }
    }

    // Fallback (shouldn't happen with valid weights)
    return items[items.length - 1].item;
  }

  /**
   * Shuffle array using Fisher-Yates algorithm
   */
  static shuffle<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = this.int(0, i);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Generate random string
   */
  static string(
    length: number,
    charset: string = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
  ): string {
    let result = "";
    for (let i = 0; i < length; i++) {
      result += charset.charAt(this.int(0, charset.length - 1));
    }
    return result;
  }

  /**
   * Generate random alphanumeric string
   */
  static alphanumeric(length: number): string {
    return this.string(
      length,
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
    );
  }

  /**
   * Generate random alphabetic string
   */
  static alpha(length: number): string {
    return this.string(
      length,
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
    );
  }

  /**
   * Generate random numeric string
   */
  static numeric(length: number): string {
    return this.string(length, "0123456789");
  }

  /**
   * Generate random hex string
   */
  static hex(length: number): string {
    return this.string(length, "0123456789ABCDEF");
  }

  /**
   * Generate UUID v4
   */
  static uuid(): string {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = this.int(0, 15);
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  /**
   * Generate random color in hex format
   */
  static color(): string {
    return "#" + this.hex(6).toLowerCase();
  }

  /**
   * Generate random RGB color
   */
  static rgb(): { r: number; g: number; b: number } {
    return {
      r: this.int(0, 255),
      g: this.int(0, 255),
      b: this.int(0, 255),
    };
  }

  /**
   * Generate random HSL color
   */
  static hsl(): { h: number; s: number; l: number } {
    return {
      h: this.int(0, 360),
      s: this.int(0, 100),
      l: this.int(0, 100),
    };
  }

  /**
   * Generate random bytes
   */
  static bytes(length: number): Uint8Array {
    const bytes = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
      bytes[i] = this.int(0, 255);
    }
    return bytes;
  }

  /**
   * Generate random normal distribution (Box-Muller)
   */
  static normal(mean: number = 0, standardDeviation: number = 1): number {
    const u1 = this.getRandom();
    const u2 = this.getRandom();
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return z0 * standardDeviation + mean;
  }

  /**
   * Generate random exponential distribution
   */
  static exponential(lambda: number = 1): number {
    return -Math.log(1 - this.getRandom()) / lambda;
  }

  /**
   * Generate random uniform distribution
   */
  static uniform(min: number = 0, max: number = 1): number {
    return this.float(min, max);
  }

  /**
   * Generate random poisson distribution
   */
  static poisson(lambda: number): number {
    const L = Math.exp(-lambda);
    let k = 0;
    let p = 1;

    do {
      k++;
      p *= this.getRandom();
    } while (p > L);

    return k - 1;
  }

  /**
   * Generate random date between two dates
   */
  static date(start: Date, end: Date): Date {
    return new Date(this.int(start.getTime(), end.getTime()));
  }

  /**
   * Generate random time (hours, minutes, seconds)
   */
  static time(): { hours: number; minutes: number; seconds: number } {
    return {
      hours: this.int(0, 23),
      minutes: this.int(0, 59),
      seconds: this.int(0, 59),
    };
  }

  /**
   * Generate random coordinate within bounds
   */
  static coordinate(bounds: {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  }): { lat: number; lng: number } {
    return {
      lat: this.float(bounds.minLat, bounds.maxLat),
      lng: this.float(bounds.minLng, bounds.maxLng),
    };
  }

  /**
   * Generate random point on unit circle
   */
  static unitCircle(): { x: number; y: number } {
    const angle = this.float(0, 2 * Math.PI);
    return {
      x: Math.cos(angle),
      y: Math.sin(angle),
    };
  }

  /**
   * Generate random point in unit sphere
   */
  static unitSphere(): { x: number; y: number; z: number } {
    const u = this.float(-1, 1);
    const t = this.float(0, 2 * Math.PI);
    const s = Math.sqrt(1 - u * u);

    return {
      x: s * Math.cos(t),
      y: s * Math.sin(t),
      z: u,
    };
  }

  /**
   * Generate random walk data
   */
  static walk(steps: number, stepSize: number = 1): number[] {
    const walk = [0];
    let current = 0;

    for (let i = 0; i < steps; i++) {
      current += this.boolean() ? stepSize : -stepSize;
      walk.push(current);
    }

    return walk;
  }

  /**
   * Generate random matrix
   */
  static matrix(
    rows: number,
    cols: number,
    min: number = 0,
    max: number = 1,
  ): number[][] {
    const matrix: number[][] = [];
    for (let i = 0; i < rows; i++) {
      const row: number[] = [];
      for (let j = 0; j < cols; j++) {
        row.push(this.float(min, max));
      }
      matrix.push(row);
    }
    return matrix;
  }

  /**
   * Generate random password
   */
  static password(
    length: number = 12,
    options: {
      includeUppercase?: boolean;
      includeLowercase?: boolean;
      includeNumbers?: boolean;
      includeSymbols?: boolean;
      excludeAmbiguous?: boolean;
    } = {},
  ): string {
    const {
      includeUppercase = true,
      includeLowercase = true,
      includeNumbers = true,
      includeSymbols = false,
      excludeAmbiguous = false,
    } = options;

    let charset = "";

    if (includeUppercase) {
      charset += excludeAmbiguous
        ? "ABCDEFGHJKLMNPQRSTUVWXYZ"
        : "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    }
    if (includeLowercase) {
      charset += excludeAmbiguous
        ? "abcdefghjkmnpqrstuvwxyz"
        : "abcdefghijklmnopqrstuvwxyz";
    }
    if (includeNumbers) {
      charset += excludeAmbiguous ? "23456789" : "0123456789";
    }
    if (includeSymbols) {
      charset += "!@#$%^&*()_+-=[]{}|;:,.<>?";
    }

    if (charset === "") {
      throw new Error("At least one character type must be included");
    }

    return this.string(length, charset);
  }

  /**
   * Generate random name (first name)
   */
  static firstName(): string {
    const names = [
      "Alice",
      "Bob",
      "Charlie",
      "Diana",
      "Edward",
      "Fiona",
      "George",
      "Helen",
      "Ivan",
      "Julia",
      "Kevin",
      "Luna",
      "Mike",
      "Nina",
      "Oscar",
      "Penny",
      "Quinn",
      "Rose",
      "Sam",
      "Tina",
      "Uma",
      "Victor",
      "Wendy",
      "Xander",
      "Yuki",
      "Zoe",
    ];
    return this.choice(names);
  }

  /**
   * Generate random last name
   */
  static lastName(): string {
    const names = [
      "Anderson",
      "Brown",
      "Clark",
      "Davis",
      "Evans",
      "Foster",
      "Garcia",
      "Harris",
      "Jackson",
      "Johnson",
      "King",
      "Lewis",
      "Martinez",
      "Nelson",
      "Parker",
      "Rodriguez",
      "Smith",
      "Taylor",
      "Thomas",
      "Walker",
      "White",
      "Williams",
      "Wilson",
      "Young",
    ];
    return this.choice(names);
  }

  /**
   * Generate random full name
   */
  static fullName(): string {
    return `${this.firstName()} ${this.lastName()}`;
  }

  /**
   * Generate random email
   */
  static email(): string {
    const domains = ["example.com", "test.org", "demo.net", "sample.co"];
    const username = this.alphanumeric(this.int(5, 12)).toLowerCase();
    const domain = this.choice(domains);
    return `${username}@${domain}`;
  }

  /**
   * Generate random phone number
   */
  static phoneNumber(format: string = "(###) ###-####"): string {
    return format.replace(/#/g, () => this.numeric(1));
  }

  /**
   * Reset seed (return to Math.random)
   */
  static resetSeed(): void {
    this.seed = null;
  }
}

// Export individual functions for convenience
export const {
  int: randomInt,
  float: randomFloat,
  boolean: randomBoolean,
  choice: randomChoice,
  shuffle: randomShuffle,
  string: randomString,
  uuid: randomUuid,
} = RandomUtils;
