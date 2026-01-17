/**
 * Standard API response types
 */

export interface ApiResponse<T> {
    data: T;
    message?: string;
    success: boolean;
}

export interface ApiError {
    message: string;
    code?: string;
    statusCode: number;
    errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: PaginationMeta;
}

export interface PaginationMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

/**
 * Query parameters for paginated requests
 */
export interface PaginationParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

/**
 * Generic filter parameters
 */
export type FilterParams<T> = {
    [K in keyof T]?: T[K] | T[K][];
};
