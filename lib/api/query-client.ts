import { QueryClient, DefaultOptions } from '@tanstack/react-query';

const queryConfig: DefaultOptions = {
    queries: {
        staleTime: 5 * 60 * 1000,

        gcTime: 10 * 60 * 1000,

        retry: (failureCount, error: any) => {
            if (error?.response?.status >= 400 && error?.response?.status < 500) {
                return false;
            }
            return failureCount < 2;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

        refetchOnWindowFocus: process.env.NODE_ENV === 'production',
        refetchOnReconnect: true,

        refetchOnMount: false,
    },
    mutations: {
        retry: 1,

        retryDelay: 1000,
    },
};

export const queryClient = new QueryClient({
    defaultOptions: queryConfig,
});

export const invalidateAllQueries = () => {
    return queryClient.invalidateQueries();
};

export const clearAllQueries = () => {
    return queryClient.clear();
};
