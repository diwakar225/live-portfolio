import type { AppError } from '@/core/kernel';

export function toUserMessage(error: AppError): string {
  switch (error.kind) {
    case 'network':
      return "Can't reach the server. Check your connection and try again.";
    case 'timeout':
      return 'The server took too long to respond. Please try again.';
    case 'unauthorized':
      return 'Your session has expired. Please sign in again.';
    case 'http':
      return error.status !== undefined && error.status >= 500
        ? 'The server is having trouble right now. Please try again shortly.'
        : "The request couldn't be completed. Please try again.";
    case 'invalid-response':
      return 'We received data we could not read. Please try again later.';
    case 'validation':
      return error.message;
    case 'cancelled':
      return 'The request was cancelled.';
    case 'unknown':
      return 'Something went wrong. Please try again.';
  }
}
