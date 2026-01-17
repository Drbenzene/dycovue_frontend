import { AxiosError } from 'axios';
import type { ApiError } from '../types/api-response';

/**
 * Transform axios error to user-friendly message
 */
export function getErrorMessage(error: unknown): string {
    if (error instanceof AxiosError) {
        // Handle axios-specific errors
        if (error.response) {
            // Server responded with error status
            const apiError = error.response.data as ApiError;
            return apiError?.message || error.message || 'An error occurred';
        }

        if (error.request) {
            // Request made but no response
            return 'Network error. Please check your connection.';
        }

        // Something else happened
        return error.message || 'An unexpected error occurred';
    }

    if (error instanceof Error) {
        return error.message;
    }

    return 'An unexpected error occurred';
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
    if (error instanceof AxiosError) {
        return !error.response && Boolean(error.request);
    }
    return false;
}

/**
 * Check if error is a client error (4xx)
 */
export function isClientError(error: unknown): boolean {
    if (error instanceof AxiosError) {
        const status = error.response?.status;
        return Boolean(status && status >= 400 && status < 500);
    }
    return false;
}

/**
 * Check if error is a server error (5xx)
 */
export function isServerError(error: unknown): boolean {
    if (error instanceof AxiosError) {
        const status = error.response?.status;
        return Boolean(status && status >= 500);
    }
    return false;
}

/**
 * Get error status code
 */
export function getErrorStatusCode(error: unknown): number | null {
    if (error instanceof AxiosError) {
        return error.response?.status ?? null;
    }
    return null;
}

/**
 * Handle API error and return formatted error object
 */
export function handleApiError(error: unknown): ApiError {
    const message = getErrorMessage(error);
    const statusCode = getErrorStatusCode(error) ?? 500;

    let errors: Record<string, string[]> | undefined;

    if (error instanceof AxiosError && error.response?.data?.errors) {
        errors = error.response.data.errors;
    }

    return {
        message,
        statusCode,
        errors,
        code: error instanceof AxiosError ? error.code : undefined,
    };
}
