import { Validator, Sanitizer, CommonSchemas } from '../../src/stdlib/validation';

describe('Validation Library', () => {
  describe('Basic Validators', () => {
    test('string validator', () => {
      const validator = Validator.string({ minLength: 3, maxLength: 10, trim: true });
      
      // Valid cases
      let result = validator('hello', 'test');
      expect(result.isValid).toBe(true);
      expect(result.sanitizedValue).toBe('hello');

      // Trimming
      result = validator('  hello  ', 'test');
      expect(result.isValid).toBe(true);
      expect(result.sanitizedValue).toBe('hello');

      // Too short
      result = validator('hi', 'test');
      expect(result.isValid).toBe(false);
      expect(result.errors[0].code).toBe('MIN_LENGTH');

      // Too long
      result = validator('verylongstring', 'test');
      expect(result.isValid).toBe(false);
      expect(result.errors[0].code).toBe('MAX_LENGTH');

      // Wrong type
      result = validator(123 as any, 'test');
      expect(result.isValid).toBe(false);
      expect(result.errors[0].code).toBe('INVALID_TYPE');
    });

    test('number validator', () => {
      const validator = Validator.number({ min: 0, max: 100, integer: true });
      
      // Valid cases
      let result = validator(50, 'test');
      expect(result.isValid).toBe(true);

      // String to number conversion
      result = validator('42' as any, 'test');
      expect(result.isValid).toBe(true);
      expect(result.sanitizedValue).toBe(42);

      // Too small
      result = validator(-5, 'test');
      expect(result.isValid).toBe(false);
      expect(result.errors[0].code).toBe('MIN_VALUE');

      // Too large
      result = validator(150, 'test');
      expect(result.isValid).toBe(false);
      expect(result.errors[0].code).toBe('MAX_VALUE');

      // Not an integer
      result = validator(3.14, 'test');
      expect(result.isValid).toBe(false);
      expect(result.errors[0].code).toBe('NOT_INTEGER');
    });

    test('email validator', () => {
      const validator = Validator.email();
      
      // Valid emails
      expect(validator('test@example.com', 'email').isValid).toBe(true);
      expect(validator('user.name@domain.co.uk', 'email').isValid).toBe(true);

      // Invalid emails
      expect(validator('invalid-email', 'email').isValid).toBe(false);
      expect(validator('test@', 'email').isValid).toBe(false);
      expect(validator('@example.com', 'email').isValid).toBe(false);
    });

    test('array validator', () => {
      const validator = Validator.array(Validator.number(), { minLength: 1, maxLength: 5, unique: true });
      
      // Valid array
      let result = validator([1, 2, 3], 'test');
      expect(result.isValid).toBe(true);

      // Empty array
      result = validator([], 'test');
      expect(result.isValid).toBe(false);
      expect(result.errors[0].code).toBe('MIN_LENGTH');

      // Too many items
      result = validator([1, 2, 3, 4, 5, 6], 'test');
      expect(result.isValid).toBe(false);
      expect(result.errors[0].code).toBe('MAX_LENGTH');

      // Duplicate items
      result = validator([1, 2, 2, 3], 'test');
      expect(result.isValid).toBe(false);
      expect(result.errors[0].code).toBe('DUPLICATE_ITEMS');

      // Wrong type
      result = validator('not an array' as any, 'test');
      expect(result.isValid).toBe(false);
      expect(result.errors[0].code).toBe('INVALID_TYPE');
    });
  });

  describe('Complex Validators', () => {
    test('object validator', () => {
      const validator = Validator.object({
        name: Validator.required(Validator.string({ minLength: 1 })),
        age: Validator.optional(Validator.number({ min: 0, max: 150 })),
        email: Validator.required(Validator.email())
      });

      // Valid object
      let result = validator({
        name: 'John Doe',
        age: 30,
        email: 'john@example.com'
      }, 'user');
      expect(result.isValid).toBe(true);

      // Missing required field
      result = validator({
        age: 30,
        email: 'john@example.com'
      }, 'user');
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.code === 'REQUIRED')).toBe(true);

      // Invalid nested field
      result = validator({
        name: 'John Doe',
        age: 200, // Too old
        email: 'john@example.com'
      }, 'user');
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.code === 'MAX_VALUE')).toBe(true);
    });

    test('conditional validators', () => {
      const validator = Validator.oneOf(
        Validator.string(),
        Validator.number() as any
      );

      // Should accept string
      let result = validator('hello', 'test');
      expect(result.isValid).toBe(true);

      // Should accept number
      result = validator(42 as any, 'test');
      expect(result.isValid).toBe(true);

      // Should reject boolean
      result = validator(true as any, 'test');
      expect(result.isValid).toBe(false);
    });
  });

  describe('Validator Builder', () => {
    test('fluent validation builder', () => {
      const validator = new Validator();
      
      validator
        .field('username')
        .string({ minLength: 3, maxLength: 20, trim: true })
        .required()
        .transform(val => val.toLowerCase());

      validator
        .field('email')
        .email()
        .required();

      validator
        .field('age')
        .number({ min: 13, integer: true })
        .optional();

      const result = validator.validate({
        username: ' JohnDoe ',
        email: 'john@example.com',
        age: 25
      });

      expect(result.isValid).toBe(true);
      expect(result.sanitizedValue.username).toBe('johndoe'); // Should be transformed
    });
  });

  describe('Common Schemas', () => {
    test('user schema', () => {
      const result = CommonSchemas.user({
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
        isActive: true
      }, 'user');

      expect(result.isValid).toBe(true);
    });

    test('credentials schema', () => {
      let result = CommonSchemas.credentials({
        username: 'johndoe',
        password: 'securepassword123'
      }, 'creds');

      expect(result.isValid).toBe(true);

      // Test weak password
      result = CommonSchemas.credentials({
        username: 'johndoe',
        password: '123' // Too short
      }, 'creds');

      expect(result.isValid).toBe(false);
    });
  });
});

describe('Sanitizer', () => {
  test('escapeHtml', () => {
    const input = '<script>alert("xss")</script>';
    const escaped = Sanitizer.escapeHtml(input);
    expect(escaped).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;');
  });

  test('stripTags', () => {
    const input = '<p>Hello <b>world</b>!</p>';
    const stripped = Sanitizer.stripTags(input);
    expect(stripped).toBe('Hello world!');
  });

  test('normalizeWhitespace', () => {
    const input = '  Hello    world  \n\n  ';
    const normalized = Sanitizer.normalizeWhitespace(input);
    expect(normalized).toBe('Hello world');
  });

  test('slug generation', () => {
    const input = 'Hello World! This is a Test.';
    const slug = Sanitizer.slug(input);
    expect(slug).toBe('hello-world-this-is-a-test');
  });

  test('truncate', () => {
    const input = 'This is a very long string that needs to be truncated';
    const truncated = Sanitizer.truncate(input, 20, '...');
    expect(truncated).toBe('This is a very lo...');
    expect(truncated.length).toBe(20);
  });
});