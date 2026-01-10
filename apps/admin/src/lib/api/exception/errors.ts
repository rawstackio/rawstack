export class AuthenticationError extends Error {
  constructor(
    public readonly message: string,
    public readonly type: 'INVALID_CREDENTIALS' | 'USER_NOT_FOUND',
  ) {
    super(message);
  }
}

type ValidationErrorResponse = {
  code: string;
  message: string;
  details: { field: string; message: string }[];
};

export class ValidationError extends Error {
  constructor(
    public readonly message: string,
    public readonly details: { [key: string]: string },
  ) {
    super(message);
  }

  static fromApiResponse(response: ValidationErrorResponse): ValidationError {
    const message = 'Validation failed';
    const details: { [key: string]: string } = {};
    response.details.forEach((detail) => {
      details[detail.field] = detail.message;
    });
    return new ValidationError(message, details);
  }
}

export class ApiError extends Error {
  constructor(
    public readonly message: string,
    public readonly type: 'UNKNOWN',
  ) {
    super(message);
  }
}
