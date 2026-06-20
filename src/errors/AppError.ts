/**
 * Base custom error class for the Nebula application.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Thrown when there is a configuration-related issue (e.g., missing env variables).
 */
export class ConfigurationError extends AppError {
  constructor(message: string) {
    super(message, 500, true);
  }
}

/**
 * Thrown during browser automation operations (e.g., failed navigation, element interaction).
 */
export class BrowserError extends AppError {
  constructor(message: string, statusCode: number = 502) {
    super(message, statusCode, true);
  }
}

/**
 * Thrown when agent execution, planning, or reasoning fails.
 */
export class AgentError extends AppError {
  constructor(message: string, statusCode: number = 500) {
    super(message, statusCode, true);
  }
}
