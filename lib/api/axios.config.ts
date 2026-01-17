import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        if (process.env.NODE_ENV === 'development') {
            console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
                params: config.params,
                data: config.data,
            });
        }
        return config;
    },
    (error) => {
        console.error('[API Request Error]', error);
        return Promise.reject(error);
    }
);

// Response interceptor
apiClient.interceptors.response.use(
    (response: AxiosResponse) => {
        if (process.env.NODE_ENV === 'development') {
            console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, {
                status: response.status,
                data: response.data,
            });
        }

        return response;
    },
    async (error: AxiosError) => {
        // Log errors
        console.error('[API Response Error]', {
            url: error.config?.url,
            status: error.response?.status,
            message: error.message,
            data: error.response?.data,
        });

        // Handle specific error codes
        if (error.response) {
            switch (error.response.status) {
                case 401:
                    break;
                case 403:
                    console.error('Access forbidden');
                    break;
                case 404:
                    console.error('Resource not found');
                    break;
                case 500:
                    console.error('Server error occurred');
                    break;
            }
        } else if (error.request) {
            console.error('Network error - no response received');
        }

        return Promise.reject(error);
    }
);

/**
 * Generic API request wrapper with type safety
 */
export async function apiRequest<T>(
    config: InternalAxiosRequestConfig
): Promise<T> {
    const response = await apiClient.request<T>(config);
    return response.data;
}
