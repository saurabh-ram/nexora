/**
 * Password / crypto related errors
 * Used to hide implementation details (bcrypt, argon2, etc.)
 */

export class PasswordHashError extends Error {
  constructor() {
    super('Failed to process password');
    this.name = 'PasswordHashError';
    this.code = 'PASSWORD_HASH_FAILED';
    this.status = 500;
  }
}

export class PasswordCompareError extends Error {
  constructor() {
    super('Failed to verify password');
    this.name = 'PasswordCompareError';
    this.code = 'PASSWORD_COMPARE_FAILED';
    this.status = 500;
  }
}
