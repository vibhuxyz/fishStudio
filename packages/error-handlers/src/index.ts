export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: any;

  constructor(
    message: string,
    statusCode: number,
    isOperational = true,
    details?: any,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;
  }
}

//not found error data not avaliable in the database

export class NotFoundError extends AppError {
  constructor(message = "Resources not found") {
    super(message, 404);
  }
}

//validation error (use for Joi/zod/react-hook-form validation errors)
export class ValidationError extends AppError {
  constructor(message = "Invalid request data", details?: any) {
    super(message, 400, true, details);
  }
}

//Authentication error
export class AuthError extends AppError {
  constructor(message = "Unauthorized access") {
    super(message, 401);
  }
}

//forbidden error (for Insufficient permissions)
export class ForbiddenError extends AppError {
  constructor(message = "Forbidden access") {
    super(message, 403);
  }
}

//Database Error (for MongoDB/postgres Error)
export class DatabaseError extends AppError {
  constructor(message = "Database error", details?: any) {
    super(message, 500, true, details);
  }
}

//Rate Limit Error (if user exceeds API limits)
export class RateLimitError extends AppError {
  constructor(message = "Too many request, please try again leter") {
    super(message, 429);
  }
}
