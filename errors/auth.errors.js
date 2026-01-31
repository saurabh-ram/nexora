/**
 * Auth / registration related domain errors
 * These errors describe "what went wrong" in business terms,
 * not how it went wrong technically.
 */

export class UserAlreadyExistsError extends Error {
  constructor(email) {
    super(`User with email "${email}" already exists`);
    this.name = 'UserAlreadyExistsError';
    this.code = 'USER_ALREADY_EXISTS';
    this.status = 409;
  }
}

export class InvalidCredentialsError extends Error {
  constructor() {
    super('Invalid email or password');
    this.name = 'InvalidCredentialsError';
    this.code = 'INVALID_CREDENTIALS';
    this.status = 401;
  }
}

export class AccountNotVerifiedError extends Error {
  constructor() {
    super('Account is not verified');
    this.name = 'AccountNotVerifiedError';
    this.code = 'ACCOUNT_NOT_VERIFIED';
    this.status = 403;
  }
}

export class RegistrationDisabledError extends Error {
  constructor() {
    super('Registration is currently disabled');
    this.name = 'RegistrationDisabledError';
    this.code = 'REGISTRATION_DISABLED';
    this.status = 403;
  }
}
