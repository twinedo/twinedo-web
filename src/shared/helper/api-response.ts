// utils/response.ts
import type { ApiSuccessResponse, ApiErrorResponse } from '../types/api';
import { formatError } from './format-error';

export function successResponse<T>(data: T, message: string, status: number): ApiSuccessResponse<T> {
  return {
    status,
    message,
    data,
  };
}

export function errorResponse(error: unknown, defaultMessage: string, status: number): ApiErrorResponse {
  const { message, details } = formatError(error);
  return {
    status,
    message: `${defaultMessage}: ${message}`,
    ...(typeof details !== 'undefined' ? { details } : {}),
  };
}