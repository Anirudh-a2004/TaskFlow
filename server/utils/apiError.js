export class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const notFound = (resource = 'Resource') => new ApiError(404, `${resource} not found.`);
