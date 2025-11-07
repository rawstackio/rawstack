export class AuthenticationError extends Error {
  constructor(public readonly message: string, public readonly type: 'INVALID_CREDENTIALS' | 'USER_NOT_FOUND') {
    super(message);
  }
}

export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly type: string,
    public readonly message: string,
    public readonly data?: { [key: string]: {} },
  ) {
    super(message);
  }
}
