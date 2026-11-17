import axios from 'axios';
import { appError, isAppError, type AppError } from '@/core/kernel';

export function toAppError(error: unknown): AppError {
  if (isAppError(error)) {
    return error;
  }
  if (axios.isCancel(error)) {
    return appError('cancelled', 'Request was cancelled', { cause: error });
  }
  if (axios.isAxiosError(error)) {
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return appError('timeout', error.message, { cause: error });
    }
    const status = error.response?.status;
    if (status === 401) {
      return appError('unauthorized', 'Request was not authorised', { status, cause: error });
    }
    if (status !== undefined) {
      return appError('http', `Request failed with status ${status}`, { status, cause: error });
    }
    return appError('network', error.message, { cause: error });
  }
  return appError('unknown', error instanceof Error ? error.message : 'Unknown error', {
    cause: error,
  });
}
