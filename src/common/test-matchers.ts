import { HttpStatus } from '@nestjs/common';

// eslint-disable-next-line security/detect-unsafe-regex
export const uuidRegex = /[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}/;

export const isoDateRegex = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/;

export const unauthorizedError = {
  message: 'Unauthorized',
  statusCode: HttpStatus.UNAUTHORIZED,
};

export const forbiddenError = {
  error: 'Forbidden',
  message: 'You are not the author of the comment',
  statusCode: HttpStatus.FORBIDDEN,
};
