/**
 * Utility functions for data validation and transformation
 * These are extracted as pure functions suitable for unit testing
 */

/**
 * Validates email format
 * @param {string} email - Email to validate
 * @returns {boolean} - true if valid email format, false otherwise
 */
export function isValidEmail(email) {
  if (typeof email !== 'string' || !email.trim()) {
    return false;
  }
  // Simple email regex validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates password strength
 * Requirements: At least 8 characters, at least 1 uppercase, 1 lowercase, 1 number
 * @param {string} password - Password to validate
 * @returns {object} - { isValid: boolean, errors: string[] }
 */
export function validatePassword(password) {
  const errors = [];

  if (typeof password !== 'string') {
    return { isValid: false, errors: ['Password must be a string'] };
  }

  if (!password) {
    return { isValid: false, errors: ['Password is required'] };
  }

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates if input is a positive integer
 * @param {any} value - Value to validate
 * @param {boolean} allowZero - Whether zero is considered valid (default: false)
 * @returns {boolean}
 */
export function isValidPositiveInteger(value, allowZero = false) {
  if (!Number.isInteger(value)) {
    return false;
  }

  if (value < 0) {
    return false;
  }

  if (value === 0 && !allowZero) {
    return false;
  }

  return true;
}

/**
 * Validates phone number format (basic validation)
 * Accepts formats: +1234567890, 123-456-7890, (123) 456-7890, 1234567890
 * @param {string} phone - Phone number to validate
 * @returns {boolean}
 */
export function isValidPhoneNumber(phone) {
  if (typeof phone !== 'string' || !phone.trim()) {
    return false;
  }

  // Remove common formatting characters
  const cleanPhone = phone.replace(/[\s\-()]/g, '');

  // Check if it's all digits with optional leading +
  const phoneRegex = /^\+?\d{7,15}$/;
  return phoneRegex.test(cleanPhone);
}

/**
 * Sanitizes user input by trimming and removing special characters
 * @param {string} input - Input to sanitize
 * @param {boolean} allowSpecial - Whether to allow special characters (default: false)
 * @returns {string} - Sanitized input
 */
export function sanitizeInput(input, allowSpecial = false) {
  if (typeof input !== 'string') {
    return '';
  }

  let sanitized = input.trim();

  if (!allowSpecial) {
    // Remove special characters, keep only alphanumeric, spaces, hyphens, underscores
    sanitized = sanitized.replace(/[^\w\s\-]/g, '');
  }

  return sanitized;
}

/**
 * Checks if a value is a valid URL
 * @param {string} url - URL to validate
 * @returns {boolean}
 */
export function isValidUrl(url) {
  if (typeof url !== 'string' || !url.trim()) {
    return false;
  }

  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Removes sensitive fields from an object (password, token, etc.)
 * @param {object} obj - Object to clean
 * @param {string[]} fieldsToRemove - Fields to remove (default: ['password', 'password_hash', 'token', 'apiKey'])
 * @returns {object} - New object without sensitive fields
 */
export function removeSensitiveFields(obj, fieldsToRemove = ['password', 'password_hash', 'token', 'apiKey']) {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  const cleaned = { ...obj };

  fieldsToRemove.forEach((field) => {
    delete cleaned[field];
  });

  return cleaned;
}

/**
 * Validates if a string is a valid UUID
 * @param {string} uuid - UUID to validate
 * @returns {boolean}
 */
export function isValidUUID(uuid) {
  if (typeof uuid !== 'string') {
    return false;
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Paginates an array
 * @param {array} array - Array to paginate
 * @param {number} page - Page number (1-indexed)
 * @param {number} pageSize - Items per page
 * @returns {object} - { items: array, totalItems: number, totalPages: number, currentPage: number }
 */
export function paginate(array, page, pageSize) {
  if (!Array.isArray(array)) {
    return { items: [], totalItems: 0, totalPages: 0, currentPage: page };
  }

  if (!Number.isInteger(page) || page < 1) {
    page = 1;
  }

  if (!Number.isInteger(pageSize) || pageSize < 1) {
    pageSize = 10;
  }

  const totalItems = array.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const items = array.slice(startIndex, endIndex);

  return {
    items,
    totalItems,
    totalPages,
    currentPage: Math.min(page, totalPages || 1),
  };
}
