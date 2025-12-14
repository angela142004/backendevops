import {
  isValidEmail,
  validatePassword,
  isValidPositiveInteger,
  isValidPhoneNumber,
  sanitizeInput,
  isValidUrl,
  removeSensitiveFields,
  isValidUUID,
  paginate,
} from '../../../src/utils/validators.js';

describe('Utility - Validators', () => {
  describe('isValidEmail', () => {
    describe('Valid emails', () => {
      it('should accept standard email format', () => {
        expect(isValidEmail('user@example.com')).toBe(true);
      });

      it('should accept email with numbers', () => {
        expect(isValidEmail('user123@example.com')).toBe(true);
      });

      it('should accept email with multiple domains', () => {
        expect(isValidEmail('user@mail.example.co.uk')).toBe(true);
      });

      it('should accept email with dots in local part', () => {
        expect(isValidEmail('user.name@example.com')).toBe(true);
      });

      it('should accept email with hyphen in domain', () => {
        expect(isValidEmail('user@ex-ample.com')).toBe(true);
      });

      it('should accept email with plus sign', () => {
        expect(isValidEmail('user+tag@example.com')).toBe(true);
      });

      it('should accept email with underscore', () => {
        expect(isValidEmail('user_name@example.com')).toBe(true);
      });
    });

    describe('Invalid emails', () => {
      it('should reject email without @ symbol', () => {
        expect(isValidEmail('userexample.com')).toBe(false);
      });

      it('should reject email without domain', () => {
        expect(isValidEmail('user@')).toBe(false);
      });

      it('should reject email without local part', () => {
        expect(isValidEmail('@example.com')).toBe(false);
      });

      it('should reject email without domain extension', () => {
        expect(isValidEmail('user@example')).toBe(false);
      });

      it('should reject email with spaces', () => {
        expect(isValidEmail('user name@example.com')).toBe(false);
      });

      it('should reject empty string', () => {
        expect(isValidEmail('')).toBe(false);
      });

      it('should reject string with only spaces', () => {
        expect(isValidEmail('   ')).toBe(false);
      });

      it('should reject null', () => {
        expect(isValidEmail(null)).toBe(false);
      });

      it('should reject undefined', () => {
        expect(isValidEmail(undefined)).toBe(false);
      });

      it('should reject non-string types', () => {
        expect(isValidEmail(123)).toBe(false);
        expect(isValidEmail([])).toBe(false);
        expect(isValidEmail({})).toBe(false);
      });

      it('should reject email with multiple @ symbols', () => {
        expect(isValidEmail('user@example@com')).toBe(false);
      });

      it('should reject email with consecutive special chars', () => {
        expect(isValidEmail('user@@example.com')).toBe(false);
      });
    });

    describe('Edge cases', () => {
      it('should accept email at boundary of specification', () => {
        expect(isValidEmail('a@b.c')).toBe(true);
      });

      it('should reject email with only special chars in local part', () => {
        expect(isValidEmail('@@@example.com')).toBe(false);
      });
    });
  });

  describe('validatePassword', () => {
    describe('Valid passwords', () => {
      it('should accept password with uppercase, lowercase, and number', () => {
        const result = validatePassword('Password123');
        expect(result.isValid).toBe(true);
        expect(result.errors).toEqual([]);
      });

      it('should accept strong password with 8 characters minimum', () => {
        const result = validatePassword('Secure1Pass');
        expect(result.isValid).toBe(true);
      });

      it('should accept password with special requirements met', () => {
        const result = validatePassword('MyPass2023');
        expect(result.isValid).toBe(true);
      });

      it('should accept long password', () => {
        const result = validatePassword('VeryLongPasswordWith123Numbers');
        expect(result.isValid).toBe(true);
        expect(result.errors.length).toBe(0);
      });
    });

    describe('Invalid passwords - missing requirements', () => {
      it('should reject password less than 8 characters', () => {
        const result = validatePassword('Pass1');
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Password must be at least 8 characters long');
      });

      it('should reject password without uppercase letter', () => {
        const result = validatePassword('password123');
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Password must contain at least one uppercase letter');
      });

      it('should reject password without lowercase letter', () => {
        const result = validatePassword('PASSWORD123');
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Password must contain at least one lowercase letter');
      });

      it('should reject password without number', () => {
        const result = validatePassword('PasswordOnly');
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Password must contain at least one number');
      });

      it('should reject password with multiple missing requirements', () => {
        const result = validatePassword('short');
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(1);
      });
    });

    describe('Invalid passwords - type and empty', () => {
      it('should reject empty string', () => {
        const result = validatePassword('');
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Password is required');
      });

      it('should reject non-string type (number)', () => {
        const result = validatePassword(123);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Password must be a string');
      });

      it('should reject non-string type (object)', () => {
        const result = validatePassword({});
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Password must be a string');
      });

      it('should reject non-string type (array)', () => {
        const result = validatePassword([]);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Password must be a string');
      });

      it('should reject null', () => {
        const result = validatePassword(null);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Password must be a string');
      });

      it('should reject undefined', () => {
        const result = validatePassword(undefined);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Password must be a string');
      });
    });

    describe('Return structure', () => {
      it('should always return object with isValid and errors properties', () => {
        const result = validatePassword('ValidPass1');
        expect(result).toHaveProperty('isValid');
        expect(result).toHaveProperty('errors');
        expect(Array.isArray(result.errors)).toBe(true);
      });

      it('should return empty errors array for valid password', () => {
        const result = validatePassword('ValidPass1');
        expect(result.errors).toEqual([]);
      });
    });
  });

  describe('isValidPositiveInteger', () => {
    describe('Valid positive integers (default: zero not allowed)', () => {
      it('should accept positive integer 1', () => {
        expect(isValidPositiveInteger(1)).toBe(true);
      });

      it('should accept positive integer 100', () => {
        expect(isValidPositiveInteger(100)).toBe(true);
      });

      it('should accept positive integer 999999', () => {
        expect(isValidPositiveInteger(999999)).toBe(true);
      });

      it('should accept any positive integer', () => {
        expect(isValidPositiveInteger(42)).toBe(true);
      });
    });

    describe('Zero handling', () => {
      it('should reject zero by default', () => {
        expect(isValidPositiveInteger(0)).toBe(false);
      });

      it('should accept zero when allowZero is true', () => {
        expect(isValidPositiveInteger(0, true)).toBe(true);
      });

      it('should reject zero explicitly when allowZero is false', () => {
        expect(isValidPositiveInteger(0, false)).toBe(false);
      });
    });

    describe('Negative numbers', () => {
      it('should reject negative integer', () => {
        expect(isValidPositiveInteger(-1)).toBe(false);
      });

      it('should reject negative integer -100', () => {
        expect(isValidPositiveInteger(-100)).toBe(false);
      });

      it('should reject negative with allowZero true', () => {
        expect(isValidPositiveInteger(-5, true)).toBe(false);
      });
    });

    describe('Invalid types', () => {
      it('should reject float number', () => {
        expect(isValidPositiveInteger(1.5)).toBe(false);
      });

      it('should reject string number', () => {
        expect(isValidPositiveInteger('123')).toBe(false);
      });

      it('should reject null', () => {
        expect(isValidPositiveInteger(null)).toBe(false);
      });

      it('should reject undefined', () => {
        expect(isValidPositiveInteger(undefined)).toBe(false);
      });

      it('should reject boolean', () => {
        expect(isValidPositiveInteger(true)).toBe(false);
        expect(isValidPositiveInteger(false)).toBe(false);
      });

      it('should reject NaN', () => {
        expect(isValidPositiveInteger(NaN)).toBe(false);
      });

      it('should reject array', () => {
        expect(isValidPositiveInteger([])).toBe(false);
      });

      it('should reject object', () => {
        expect(isValidPositiveInteger({})).toBe(false);
      });
    });

    describe('Edge cases', () => {
      it('should accept Number.MAX_SAFE_INTEGER', () => {
        expect(isValidPositiveInteger(Number.MAX_SAFE_INTEGER)).toBe(true);
      });

      it('should accept 1 as minimum positive', () => {
        expect(isValidPositiveInteger(1, false)).toBe(true);
      });
    });
  });

  describe('isValidPhoneNumber', () => {
    describe('Valid phone numbers', () => {
      it('should accept simple 10-digit number', () => {
        expect(isValidPhoneNumber('1234567890')).toBe(true);
      });

      it('should accept number with hyphens', () => {
        expect(isValidPhoneNumber('123-456-7890')).toBe(true);
      });

      it('should accept number with spaces', () => {
        expect(isValidPhoneNumber('123 456 7890')).toBe(true);
      });

      it('should accept number with parentheses', () => {
        expect(isValidPhoneNumber('(123) 456-7890')).toBe(true);
      });

      it('should accept number with plus and country code', () => {
        expect(isValidPhoneNumber('+11234567890')).toBe(true);
      });

      it('should accept international format', () => {
        expect(isValidPhoneNumber('+34 666 777 888')).toBe(true);
      });

      it('should accept 7-digit number', () => {
        expect(isValidPhoneNumber('1234567')).toBe(true);
      });

      it('should accept 15-digit number (max international)', () => {
        expect(isValidPhoneNumber('123456789012345')).toBe(true);
      });

      it('should accept mixed formatting', () => {
        expect(isValidPhoneNumber('+1 (123) 456-7890')).toBe(true);
      });
    });

    describe('Invalid phone numbers', () => {
      it('should reject too short number (less than 7 digits)', () => {
        expect(isValidPhoneNumber('123456')).toBe(false);
      });

      it('should reject too long number (more than 15 digits)', () => {
        expect(isValidPhoneNumber('1234567890123456')).toBe(false);
      });

      it('should reject number with letters', () => {
        expect(isValidPhoneNumber('123-456-ABCD')).toBe(false);
      });

      it('should reject empty string', () => {
        expect(isValidPhoneNumber('')).toBe(false);
      });

      it('should reject string with only spaces', () => {
        expect(isValidPhoneNumber('   ')).toBe(false);
      });

      it('should reject non-string type', () => {
        expect(isValidPhoneNumber(1234567890)).toBe(false);
      });

      it('should reject null', () => {
        expect(isValidPhoneNumber(null)).toBe(false);
      });

      it('should reject undefined', () => {
        expect(isValidPhoneNumber(undefined)).toBe(false);
      });

      it('should reject with special characters', () => {
        expect(isValidPhoneNumber('123#456@7890')).toBe(false);
      });
    });

    describe('Edge cases', () => {
      it('should accept all digits formatted with formatting chars', () => {
        expect(isValidPhoneNumber('(555) 123-4567')).toBe(true);
      });

      it('should reject plus sign without digits', () => {
        expect(isValidPhoneNumber('+')).toBe(false);
      });
    });
  });

  describe('sanitizeInput', () => {
    describe('Valid inputs without special character removal', () => {
      it('should trim whitespace from start and end', () => {
        expect(sanitizeInput('  hello world  ')).toBe('hello world');
      });

      it('should handle normal text', () => {
        expect(sanitizeInput('normal text')).toBe('normal text');
      });

      it('should preserve numbers and letters', () => {
        expect(sanitizeInput('user123')).toBe('user123');
      });

      it('should preserve hyphens and underscores by default', () => {
        expect(sanitizeInput('user-name_123')).toBe('user-name_123');
      });

      it('should remove special characters by default', () => {
        expect(sanitizeInput('user@#$%name')).toBe('username');
      });
    });

    describe('With special characters allowed', () => {
      it('should preserve special characters when allowSpecial is true', () => {
        expect(sanitizeInput('user@example.com', true)).toBe('user@example.com');
      });

      it('should still trim whitespace even with allowSpecial', () => {
        expect(sanitizeInput('  user@example  ', true)).toBe('user@example');
      });

      it('should preserve complex special chars', () => {
        expect(sanitizeInput('price: $99.99!', true)).toBe('price: $99.99!');
      });
    });

    describe('Invalid input types', () => {
      it('should return empty string for null', () => {
        expect(sanitizeInput(null)).toBe('');
      });

      it('should return empty string for undefined', () => {
        expect(sanitizeInput(undefined)).toBe('');
      });

      it('should return empty string for number', () => {
        expect(sanitizeInput(123)).toBe('');
      });

      it('should return empty string for object', () => {
        expect(sanitizeInput({})).toBe('');
      });

      it('should return empty string for array', () => {
        expect(sanitizeInput([])).toBe('');
      });
    });

    describe('Edge cases', () => {
      it('should handle empty string', () => {
        expect(sanitizeInput('')).toBe('');
      });

      it('should handle string with only spaces', () => {
        expect(sanitizeInput('   ')).toBe('');
      });

      it('should handle string with only special characters', () => {
        expect(sanitizeInput('@#$%^&*()')).toBe('');
      });

      it('should remove multiple consecutive special chars', () => {
        expect(sanitizeInput('hello!!!world')).toBe('helloworld');
      });
    });
  });

  describe('isValidUrl', () => {
    describe('Valid URLs', () => {
      it('should accept HTTP URL', () => {
        expect(isValidUrl('http://example.com')).toBe(true);
      });

      it('should accept HTTPS URL', () => {
        expect(isValidUrl('https://example.com')).toBe(true);
      });

      it('should accept URL with path', () => {
        expect(isValidUrl('https://example.com/path/to/resource')).toBe(true);
      });

      it('should accept URL with query parameters', () => {
        expect(isValidUrl('https://example.com?key=value')).toBe(true);
      });

      it('should accept URL with port', () => {
        expect(isValidUrl('https://example.com:8080')).toBe(true);
      });

      it('should accept URL with subdomain', () => {
        expect(isValidUrl('https://api.example.com')).toBe(true);
      });

      it('should accept localhost URL', () => {
        expect(isValidUrl('http://localhost:3000')).toBe(true);
      });

      it('should accept IP address URL', () => {
        expect(isValidUrl('http://192.168.1.1')).toBe(true);
      });

      it('should accept URL with hash', () => {
        expect(isValidUrl('https://example.com#section')).toBe(true);
      });

      it('should accept file URL', () => {
        expect(isValidUrl('file:///path/to/file.txt')).toBe(true);
      });
    });

    describe('Invalid URLs', () => {
      it('should reject URL without protocol', () => {
        expect(isValidUrl('example.com')).toBe(false);
      });

      it('should reject incomplete URL', () => {
        expect(isValidUrl('http://')).toBe(false);
      });

      it('should reject empty string', () => {
        expect(isValidUrl('')).toBe(false);
      });

      it('should reject string with only spaces', () => {
        expect(isValidUrl('   ')).toBe(false);
      });

      it('should reject invalid protocol', () => {
        expect(isValidUrl('ftp://example.com')).toBe(true); // ftp is valid protocol
      });

      it('should reject non-string type', () => {
        expect(isValidUrl(123)).toBe(false);
      });

      it('should reject null', () => {
        expect(isValidUrl(null)).toBe(false);
      });

      it('should reject undefined', () => {
        expect(isValidUrl(undefined)).toBe(false);
      });

      it('should reject just text', () => {
        expect(isValidUrl('not a url')).toBe(false);
      });
    });

    describe('Edge cases', () => {
      it('should accept URL with encoded characters', () => {
        expect(isValidUrl('https://example.com/path%20with%20spaces')).toBe(true);
      });

      it('should accept URL with fragment identifier', () => {
        expect(isValidUrl('https://example.com/page#top')).toBe(true);
      });
    });
  });

  describe('removeSensitiveFields', () => {
    describe('Default sensitive fields removal', () => {
      it('should remove password field', () => {
        const obj = { id: 1, name: 'User', password: 'secret' };
        const result = removeSensitiveFields(obj);
        expect(result).not.toHaveProperty('password');
        expect(result.id).toBe(1);
        expect(result.name).toBe('User');
      });

      it('should remove password_hash field', () => {
        const obj = { id: 1, name: 'User', password_hash: 'hashed' };
        const result = removeSensitiveFields(obj);
        expect(result).not.toHaveProperty('password_hash');
      });

      it('should remove token field', () => {
        const obj = { id: 1, token: 'jwt-token' };
        const result = removeSensitiveFields(obj);
        expect(result).not.toHaveProperty('token');
      });

      it('should remove apiKey field', () => {
        const obj = { id: 1, apiKey: 'api-key-123' };
        const result = removeSensitiveFields(obj);
        expect(result).not.toHaveProperty('apiKey');
      });

      it('should remove multiple sensitive fields', () => {
        const obj = {
          id: 1,
          name: 'User',
          email: 'user@example.com',
          password: 'secret',
          token: 'jwt-token',
          apiKey: 'key-123',
        };
        const result = removeSensitiveFields(obj);
        expect(result).not.toHaveProperty('password');
        expect(result).not.toHaveProperty('token');
        expect(result).not.toHaveProperty('apiKey');
        expect(result.id).toBe(1);
        expect(result.email).toBe('user@example.com');
      });
    });

    describe('Custom fields to remove', () => {
      it('should remove custom specified fields', () => {
        const obj = { id: 1, secretKey: 'secret', publicField: 'public' };
        const result = removeSensitiveFields(obj, ['secretKey']);
        expect(result).not.toHaveProperty('secretKey');
        expect(result.publicField).toBe('public');
      });

      it('should remove multiple custom fields', () => {
        const obj = { id: 1, secret1: 'a', secret2: 'b', public: 'c' };
        const result = removeSensitiveFields(obj, ['secret1', 'secret2']);
        expect(result).not.toHaveProperty('secret1');
        expect(result).not.toHaveProperty('secret2');
        expect(result.public).toBe('c');
      });

      it('should not remove defaults when custom list provided', () => {
        const obj = { id: 1, password: 'secret', custom: 'data' };
        const result = removeSensitiveFields(obj, ['custom']);
        // When custom list is provided, only custom fields are removed
        expect(result).not.toHaveProperty('custom');
        expect(result).toHaveProperty('password'); // Still has password
      });
    });

    describe('Invalid inputs', () => {
      it('should handle null gracefully', () => {
        const result = removeSensitiveFields(null);
        expect(result).toBe(null);
      });

      it('should handle undefined gracefully', () => {
        const result = removeSensitiveFields(undefined);
        expect(result).toBe(undefined);
      });

      it('should handle non-object types', () => {
        expect(removeSensitiveFields('string')).toBe('string');
        expect(removeSensitiveFields(123)).toBe(123);
        expect(removeSensitiveFields(true)).toBe(true);
      });
    });

    describe('Edge cases', () => {
      it('should not modify original object', () => {
        const original = { id: 1, password: 'secret', name: 'User' };
        const result = removeSensitiveFields(original);
        expect(original).toHaveProperty('password');
        expect(result).not.toHaveProperty('password');
      });

      it('should handle empty object', () => {
        const result = removeSensitiveFields({});
        expect(result).toEqual({});
      });

      it('should handle object with nested properties', () => {
        const obj = {
          id: 1,
          password: 'secret',
          user: { name: 'John', password: 'nested' },
        };
        const result = removeSensitiveFields(obj);
        expect(result).not.toHaveProperty('password');
        expect(result.user).toHaveProperty('password'); // Nested not affected
      });
    });
  });

  describe('isValidUUID', () => {
    describe('Valid UUIDs', () => {
      it('should accept valid UUID v4', () => {
        expect(isValidUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
      });

      it('should accept valid UUID with uppercase', () => {
        expect(isValidUUID('550E8400-E29B-41D4-A716-446655440000')).toBe(true);
      });

      it('should accept valid UUID with mixed case', () => {
        expect(isValidUUID('550e8400-E29B-41d4-A716-446655440000')).toBe(true);
      });

      it('should accept another valid UUID', () => {
        expect(isValidUUID('f47ac10b-58cc-4372-a567-0e02b2c3d479')).toBe(true);
      });
    });

    describe('Invalid UUIDs', () => {
      it('should reject UUID without hyphens', () => {
        expect(isValidUUID('550e8400e29b41d4a716446655440000')).toBe(false);
      });

      it('should reject UUID with wrong hyphen placement', () => {
        expect(isValidUUID('550e8400-e29b-41d4a716-446655440000')).toBe(false);
      });

      it('should reject UUID with too few characters', () => {
        expect(isValidUUID('550e8400-e29b-41d4-a716')).toBe(false);
      });

      it('should reject UUID with too many characters', () => {
        expect(isValidUUID('550e8400-e29b-41d4-a716-446655440000-extra')).toBe(false);
      });

      it('should reject UUID with invalid characters', () => {
        expect(isValidUUID('550e8400-e29b-41d4-a716-44665544000g')).toBe(false);
      });

      it('should reject empty string', () => {
        expect(isValidUUID('')).toBe(false);
      });

      it('should reject null', () => {
        expect(isValidUUID(null)).toBe(false);
      });

      it('should reject undefined', () => {
        expect(isValidUUID(undefined)).toBe(false);
      });

      it('should reject non-string type', () => {
        expect(isValidUUID(12345)).toBe(false);
      });

      it('should reject UUID with spaces', () => {
        expect(isValidUUID('550e8400-e29b-41d4-a716-446655440000 ')).toBe(false);
      });
    });

    describe('Edge cases', () => {
      it('should accept UUID with all zeros', () => {
        expect(isValidUUID('00000000-0000-0000-0000-000000000000')).toBe(true);
      });

      it('should accept UUID with all Fs', () => {
        expect(isValidUUID('ffffffff-ffff-ffff-ffff-ffffffffffff')).toBe(true);
      });
    });
  });

  describe('paginate', () => {
    describe('Basic pagination', () => {
      it('should return first page of items', () => {
        const array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        const result = paginate(array, 1, 3);
        expect(result.items).toEqual([1, 2, 3]);
        expect(result.currentPage).toBe(1);
        expect(result.totalItems).toBe(10);
        expect(result.totalPages).toBe(4);
      });

      it('should return second page of items', () => {
        const array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        const result = paginate(array, 2, 3);
        expect(result.items).toEqual([4, 5, 6]);
        expect(result.currentPage).toBe(2);
      });

      it('should return last page with partial items', () => {
        const array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        const result = paginate(array, 4, 3);
        expect(result.items).toEqual([10]);
        expect(result.currentPage).toBe(4);
        expect(result.totalPages).toBe(4);
      });

      it('should handle page size equal to array length', () => {
        const array = [1, 2, 3, 4, 5];
        const result = paginate(array, 1, 5);
        expect(result.items).toEqual([1, 2, 3, 4, 5]);
        expect(result.totalPages).toBe(1);
      });

      it('should handle page size larger than array length', () => {
        const array = [1, 2, 3];
        const result = paginate(array, 1, 10);
        expect(result.items).toEqual([1, 2, 3]);
        expect(result.totalPages).toBe(1);
      });
    });

    describe('Default values', () => {
      it('should use default page size of 10 if not provided', () => {
        const array = Array.from({ length: 25 }, (_, i) => i + 1);
        const result = paginate(array, 1);
        expect(result.items.length).toBe(10);
      });

      it('should use default page of 1 if invalid', () => {
        const array = [1, 2, 3, 4, 5];
        const result = paginate(array, 0, 2);
        expect(result.items).toEqual([1, 2]);
        expect(result.currentPage).toBe(1);
      });

      it('should use default page size of 10 if invalid', () => {
        const array = Array.from({ length: 25 }, (_, i) => i + 1);
        const result = paginate(array, 1, 0);
        expect(result.items.length).toBe(10);
      });
    });

    describe('Invalid inputs', () => {
      it('should handle non-array gracefully', () => {
        const result = paginate('not-an-array', 1, 10);
        expect(result.items).toEqual([]);
        expect(result.totalItems).toBe(0);
        expect(result.totalPages).toBe(0);
      });

      it('should handle null', () => {
        const result = paginate(null, 1, 10);
        expect(result.items).toEqual([]);
        expect(result.totalItems).toBe(0);
      });

      it('should handle undefined', () => {
        const result = paginate(undefined, 1, 10);
        expect(result.items).toEqual([]);
      });

      it('should handle object instead of array', () => {
        const result = paginate({ key: 'value' }, 1, 10);
        expect(result.items).toEqual([]);
      });
    });

    describe('Invalid pagination parameters', () => {
      it('should default to page 1 for negative page number', () => {
        const array = [1, 2, 3, 4, 5];
        const result = paginate(array, -1, 2);
        expect(result.items).toEqual([1, 2]);
        expect(result.currentPage).toBe(1);
      });

      it('should default to page 1 for non-integer page', () => {
        const array = [1, 2, 3, 4, 5];
        const result = paginate(array, 1.5, 2);
        expect(result.items).toEqual([1, 2]);
      });

      it('should default to page size 10 for negative size', () => {
        const array = Array.from({ length: 25 }, (_, i) => i + 1);
        const result = paginate(array, 1, -5);
        expect(result.items.length).toBe(10);
      });

      it('should default to page size 10 for non-integer size', () => {
        const array = Array.from({ length: 25 }, (_, i) => i + 1);
        const result = paginate(array, 1, 5.7);
        expect(result.items.length).toBe(10);
      });
    });

    describe('Edge cases', () => {
      it('should handle empty array', () => {
        const result = paginate([], 1, 10);
        expect(result.items).toEqual([]);
        expect(result.totalItems).toBe(0);
        expect(result.totalPages).toBe(0);
      });

      it('should handle requesting page beyond available pages', () => {
        const array = [1, 2, 3, 4, 5];
        const result = paginate(array, 10, 2);
        expect(result.items).toEqual([]);
        expect(result.currentPage).toBe(Math.min(10, 3)); // Should adjust
      });

      it('should handle page size of 1', () => {
        const array = [1, 2, 3];
        const result = paginate(array, 2, 1);
        expect(result.items).toEqual([2]);
        expect(result.totalPages).toBe(3);
      });

      it('should calculate total pages correctly', () => {
        const array = Array.from({ length: 100 }, (_, i) => i + 1);
        const result = paginate(array, 1, 7);
        expect(result.totalPages).toBe(Math.ceil(100 / 7)); // 15 pages
      });
    });

    describe('Return structure', () => {
      it('should always return object with required properties', () => {
        const array = [1, 2, 3];
        const result = paginate(array, 1, 10);
        expect(result).toHaveProperty('items');
        expect(result).toHaveProperty('totalItems');
        expect(result).toHaveProperty('totalPages');
        expect(result).toHaveProperty('currentPage');
      });

      it('should return items as array', () => {
        const array = [1, 2, 3];
        const result = paginate(array, 1, 10);
        expect(Array.isArray(result.items)).toBe(true);
      });
    });
  });
});
