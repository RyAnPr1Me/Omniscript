/**
 * Comprehensive validation library for Omniscript
 * Provides schema validation, data sanitization, and constraint checking
 */

import { debug } from '../debug';

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: any;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  sanitizedValue?: any;
}

export type ValidatorFunction<T = any> = (value: T, field?: string) => ValidationResult;

export class Validator {
  private rules: Map<string, ValidatorFunction[]> = new Map();
  private transforms: Map<string, ((value: any) => any)[]> = new Map();

  // Basic type validators
  static string(options: { 
    minLength?: number; 
    maxLength?: number; 
    pattern?: RegExp; 
    trim?: boolean;
    allowEmpty?: boolean;
  } = {}): ValidatorFunction<string> {
    return (value: any, field = 'field'): ValidationResult => {
      const errors: ValidationError[] = [];
      let sanitizedValue = value;

      // Type check
      if (typeof value !== 'string') {
        errors.push({
          field,
          message: 'Must be a string',
          code: 'INVALID_TYPE',
          value
        });
        return { isValid: false, errors };
      }

      // Trim if requested
      if (options.trim) {
        sanitizedValue = value.trim();
      }

      // Check if empty string is allowed
      if (!options.allowEmpty && sanitizedValue === '') {
        errors.push({
          field,
          message: 'Cannot be empty',
          code: 'EMPTY_STRING',
          value
        });
      }

      // Length validation
      if (options.minLength !== undefined && sanitizedValue.length < options.minLength) {
        errors.push({
          field,
          message: `Must be at least ${options.minLength} characters`,
          code: 'MIN_LENGTH',
          value
        });
      }

      if (options.maxLength !== undefined && sanitizedValue.length > options.maxLength) {
        errors.push({
          field,
          message: `Must be at most ${options.maxLength} characters`,
          code: 'MAX_LENGTH',
          value
        });
      }

      // Pattern validation
      if (options.pattern && !options.pattern.test(sanitizedValue)) {
        errors.push({
          field,
          message: 'Invalid format',
          code: 'INVALID_PATTERN',
          value
        });
      }

      return {
        isValid: errors.length === 0,
        errors,
        sanitizedValue
      };
    };
  }

  static number(options: {
    min?: number;
    max?: number;
    integer?: boolean;
    positive?: boolean;
    finite?: boolean;
  } = {}): ValidatorFunction<number> {
    return (value: any, field = 'field'): ValidationResult => {
      const errors: ValidationError[] = [];
      let sanitizedValue = value;

      // Convert string numbers
      if (typeof value === 'string' && !isNaN(Number(value))) {
        sanitizedValue = Number(value);
      }

      // Type check
      if (typeof sanitizedValue !== 'number') {
        errors.push({
          field,
          message: 'Must be a number',
          code: 'INVALID_TYPE',
          value
        });
        return { isValid: false, errors };
      }

      // Finite check
      if (options.finite && !isFinite(sanitizedValue)) {
        errors.push({
          field,
          message: 'Must be a finite number',
          code: 'NOT_FINITE',
          value
        });
      }

      // Integer check
      if (options.integer && !Number.isInteger(sanitizedValue)) {
        errors.push({
          field,
          message: 'Must be an integer',
          code: 'NOT_INTEGER',
          value
        });
      }

      // Positive check
      if (options.positive && sanitizedValue <= 0) {
        errors.push({
          field,
          message: 'Must be positive',
          code: 'NOT_POSITIVE',
          value
        });
      }

      // Range validation
      if (options.min !== undefined && sanitizedValue < options.min) {
        errors.push({
          field,
          message: `Must be at least ${options.min}`,
          code: 'MIN_VALUE',
          value
        });
      }

      if (options.max !== undefined && sanitizedValue > options.max) {
        errors.push({
          field,
          message: `Must be at most ${options.max}`,
          code: 'MAX_VALUE',
          value
        });
      }

      return {
        isValid: errors.length === 0,
        errors,
        sanitizedValue
      };
    };
  }

  static boolean(): ValidatorFunction<boolean> {
    return (value: any, field = 'field'): ValidationResult => {
      const errors: ValidationError[] = [];
      let sanitizedValue = value;

      // Convert common string representations
      if (typeof value === 'string') {
        const lowerValue = value.toLowerCase();
        if (lowerValue === 'true' || lowerValue === '1' || lowerValue === 'yes') {
          sanitizedValue = true;
        } else if (lowerValue === 'false' || lowerValue === '0' || lowerValue === 'no') {
          sanitizedValue = false;
        }
      }

      // Convert numbers
      if (typeof value === 'number') {
        sanitizedValue = Boolean(value);
      }

      if (typeof sanitizedValue !== 'boolean') {
        errors.push({
          field,
          message: 'Must be a boolean',
          code: 'INVALID_TYPE',
          value
        });
        return { isValid: false, errors };
      }

      return {
        isValid: true,
        errors: [],
        sanitizedValue
      };
    };
  }

  static array<T>(itemValidator?: ValidatorFunction<T>, options: {
    minLength?: number;
    maxLength?: number;
    unique?: boolean;
  } = {}): ValidatorFunction<T[]> {
    return (value: any, field = 'field'): ValidationResult => {
      const errors: ValidationError[] = [];
      let sanitizedValue = value;

      if (!Array.isArray(value)) {
        errors.push({
          field,
          message: 'Must be an array',
          code: 'INVALID_TYPE',
          value
        });
        return { isValid: false, errors };
      }

      // Length validation
      if (options.minLength !== undefined && value.length < options.minLength) {
        errors.push({
          field,
          message: `Must have at least ${options.minLength} items`,
          code: 'MIN_LENGTH',
          value
        });
      }

      if (options.maxLength !== undefined && value.length > options.maxLength) {
        errors.push({
          field,
          message: `Must have at most ${options.maxLength} items`,
          code: 'MAX_LENGTH',
          value
        });
      }

      // Unique validation
      if (options.unique) {
        const seen = new Set();
        const duplicates = value.filter(item => {
          if (seen.has(item)) return true;
          seen.add(item);
          return false;
        });

        if (duplicates.length > 0) {
          errors.push({
            field,
            message: 'Array items must be unique',
            code: 'DUPLICATE_ITEMS',
            value: duplicates
          });
        }
      }

      // Validate individual items
      if (itemValidator) {
        const sanitizedItems: T[] = [];
        value.forEach((item, index) => {
          const itemResult = itemValidator(item, `${field}[${index}]`);
          if (!itemResult.isValid) {
            errors.push(...itemResult.errors);
          } else {
            sanitizedItems.push(itemResult.sanitizedValue || item);
          }
        });
        sanitizedValue = sanitizedItems;
      }

      return {
        isValid: errors.length === 0,
        errors,
        sanitizedValue
      };
    };
  }

  static object(schema: Record<string, ValidatorFunction>): ValidatorFunction<Record<string, any>> {
    return (value: any, field = 'field'): ValidationResult => {
      const errors: ValidationError[] = [];
      const sanitizedValue: Record<string, any> = {};

      if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        errors.push({
          field,
          message: 'Must be an object',
          code: 'INVALID_TYPE',
          value
        });
        return { isValid: false, errors };
      }

      // Validate each property in the schema
      for (const [key, validator] of Object.entries(schema)) {
        const propertyValue = value[key];
        const propertyField = field === 'field' ? key : `${field}.${key}`;
        const result = validator(propertyValue, propertyField);

        if (!result.isValid) {
          errors.push(...result.errors);
        } else {
          sanitizedValue[key] = result.sanitizedValue !== undefined ? result.sanitizedValue : propertyValue;
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
        sanitizedValue
      };
    };
  }

  static email(): ValidatorFunction<string> {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return Validator.string({ pattern: emailRegex, trim: true });
  }

  static url(): ValidatorFunction<string> {
    return (value: any, field = 'field'): ValidationResult => {
      const stringResult = Validator.string({ trim: true })(value, field);
      if (!stringResult.isValid) return stringResult;

      try {
        new URL(stringResult.sanitizedValue);
        return stringResult;
      } catch {
        return {
          isValid: false,
          errors: [{
            field,
            message: 'Must be a valid URL',
            code: 'INVALID_URL',
            value
          }]
        };
      }
    };
  }

  static date(): ValidatorFunction<Date> {
    return (value: any, field = 'field'): ValidationResult => {
      const errors: ValidationError[] = [];
      let sanitizedValue = value;

      // Try to parse date from string or number
      if (typeof value === 'string' || typeof value === 'number') {
        sanitizedValue = new Date(value);
      }

      if (!(sanitizedValue instanceof Date) || isNaN(sanitizedValue.getTime())) {
        errors.push({
          field,
          message: 'Must be a valid date',
          code: 'INVALID_DATE',
          value
        });
        return { isValid: false, errors };
      }

      return {
        isValid: true,
        errors: [],
        sanitizedValue
      };
    };
  }

  static enum<T extends string | number>(allowedValues: T[]): ValidatorFunction<T> {
    return (value: any, field = 'field'): ValidationResult => {
      if (!allowedValues.includes(value)) {
        return {
          isValid: false,
          errors: [{
            field,
            message: `Must be one of: ${allowedValues.join(', ')}`,
            code: 'INVALID_ENUM',
            value
          }]
        };
      }

      return {
        isValid: true,
        errors: [],
        sanitizedValue: value
      };
    };
  }

  static optional<T>(validator: ValidatorFunction<T>): ValidatorFunction<T | undefined> {
    return (value: any, field = 'field'): ValidationResult => {
      if (value === undefined || value === null) {
        return {
          isValid: true,
          errors: [],
          sanitizedValue: undefined
        };
      }

      return validator(value, field);
    };
  }

  static required<T>(validator: ValidatorFunction<T>): ValidatorFunction<T> {
    return (value: any, field = 'field'): ValidationResult => {
      if (value === undefined || value === null) {
        return {
          isValid: false,
          errors: [{
            field,
            message: 'Required field',
            code: 'REQUIRED',
            value
          }]
        };
      }

      return validator(value, field);
    };
  }

  static oneOf<T>(...validators: ValidatorFunction<T>[]): ValidatorFunction<T> {
    return (value: any, field = 'field'): ValidationResult => {
      let lastErrors: ValidationError[] = [];

      for (const validator of validators) {
        const result = validator(value, field);
        if (result.isValid) {
          return result;
        }
        lastErrors = result.errors;
      }

      return {
        isValid: false,
        errors: [{
          field,
          message: 'Does not match any of the allowed formats',
          code: 'NO_MATCH',
          value
        }]
      };
    };
  }

  static allOf<T>(...validators: ValidatorFunction<T>[]): ValidatorFunction<T> {
    return (value: any, field = 'field'): ValidationResult => {
      const allErrors: ValidationError[] = [];
      let sanitizedValue = value;

      for (const validator of validators) {
        const result = validator(sanitizedValue, field);
        if (!result.isValid) {
          allErrors.push(...result.errors);
        } else if (result.sanitizedValue !== undefined) {
          sanitizedValue = result.sanitizedValue;
        }
      }

      return {
        isValid: allErrors.length === 0,
        errors: allErrors,
        sanitizedValue
      };
    };
  }

  // Instance methods for building complex validation pipelines
  field(fieldName: string): FieldValidator {
    return new FieldValidator(this, fieldName);
  }

  addRule(field: string, validator: ValidatorFunction): this {
    if (!this.rules.has(field)) {
      this.rules.set(field, []);
    }
    this.rules.get(field)!.push(validator);
    return this;
  }

  addTransform(field: string, transform: (value: any) => any): this {
    if (!this.transforms.has(field)) {
      this.transforms.set(field, []);
    }
    this.transforms.get(field)!.push(transform);
    return this;
  }

  validate(data: Record<string, any>): ValidationResult {
    const errors: ValidationError[] = [];
    const sanitizedValue: Record<string, any> = { ...data };

    for (const [field, validators] of this.rules) {
      let fieldValue = data[field];

      // Apply transforms first
      const transforms = this.transforms.get(field) || [];
      for (const transform of transforms) {
        fieldValue = transform(fieldValue);
      }

      // Apply validators
      for (const validator of validators) {
        const result = validator(fieldValue, field);
        if (!result.isValid) {
          errors.push(...result.errors);
        } else if (result.sanitizedValue !== undefined) {
          fieldValue = result.sanitizedValue;
        }
      }

      sanitizedValue[field] = fieldValue;
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedValue
    };
  }
}

export class FieldValidator {
  constructor(private validator: Validator, private field: string) {}

  string(options?: Parameters<typeof Validator.string>[0]): this {
    this.validator.addRule(this.field, Validator.string(options));
    return this;
  }

  number(options?: Parameters<typeof Validator.number>[0]): this {
    this.validator.addRule(this.field, Validator.number(options));
    return this;
  }

  boolean(): this {
    this.validator.addRule(this.field, Validator.boolean());
    return this;
  }

  email(): this {
    this.validator.addRule(this.field, Validator.email());
    return this;
  }

  url(): this {
    this.validator.addRule(this.field, Validator.url());
    return this;
  }

  date(): this {
    this.validator.addRule(this.field, Validator.date());
    return this;
  }

  enum<T extends string | number>(values: T[]): this {
    this.validator.addRule(this.field, Validator.enum(values));
    return this;
  }

  required(): this {
    const existingRules = this.validator['rules'].get(this.field) || [];
    if (existingRules.length > 0) {
      const lastRule = existingRules[existingRules.length - 1];
      existingRules[existingRules.length - 1] = Validator.required(lastRule);
    }
    return this;
  }

  optional(): this {
    const existingRules = this.validator['rules'].get(this.field) || [];
    if (existingRules.length > 0) {
      const lastRule = existingRules[existingRules.length - 1];
      existingRules[existingRules.length - 1] = Validator.optional(lastRule);
    }
    return this;
  }

  transform(fn: (value: any) => any): this {
    this.validator.addTransform(this.field, fn);
    return this;
  }

  custom(validator: ValidatorFunction): this {
    this.validator.addRule(this.field, validator);
    return this;
  }
}

// Sanitization utilities
export class Sanitizer {
  static escapeHtml(input: string): string {
    const htmlEscapes: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;'
    };

    return input.replace(/[&<>"'/]/g, (match) => htmlEscapes[match]);
  }

  static stripTags(input: string): string {
    return input.replace(/<[^>]*>/g, '');
  }

  static normalizeWhitespace(input: string): string {
    return input.replace(/\s+/g, ' ').trim();
  }

  static removeSpecialChars(input: string, allowed: string = ''): string {
    const pattern = new RegExp(`[^a-zA-Z0-9${allowed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`, 'g');
    return input.replace(pattern, '');
  }

  static truncate(input: string, maxLength: number, suffix: string = '...'): string {
    if (input.length <= maxLength) return input;
    return input.substring(0, maxLength - suffix.length) + suffix;
  }

  static slug(input: string): string {
    return input
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}

// Pre-built validation schemas for common use cases
export const CommonSchemas = {
  user: Validator.object({
    name: Validator.required(Validator.string({ minLength: 1, maxLength: 100, trim: true })),
    email: Validator.required(Validator.email()),
    age: Validator.optional(Validator.number({ min: 0, max: 150, integer: true })),
    isActive: Validator.optional(Validator.boolean())
  }),

  credentials: Validator.object({
    username: Validator.required(Validator.string({ minLength: 3, maxLength: 50, trim: true })),
    password: Validator.required(Validator.string({ minLength: 8, maxLength: 128 }))
  }),

  apiResponse: Validator.object({
    success: Validator.required(Validator.boolean()),
    data: Validator.optional(Validator.object({})),
    error: Validator.optional(Validator.string())
  })
};

debug.info('Validation', 'Validation library initialized');