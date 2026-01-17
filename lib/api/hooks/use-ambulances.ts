import {
    useQuery,
    useMutation,
    useQueryClient,
    UseQueryResult,
    UseMutationResult,
} from '@tanstack/react-query';
import { ambulancesApi } from '../clients/ambulances.api';
import { queryKeys } from '../utils/query-keys';
import type { Ambulance, AmbulanceStatus, Coordinates } from '@/types';

/**
 * Hook to fetch all ambulances with optional status filter
 */
export function useAmbulances(
    status?: AmbulanceStatus
): UseQueryResult<Ambulance[], Error> {
    return useQuery({
        queryKey: queryKeys.ambulances.byStatus(status),
        queryFn: () => ambulancesApi.getAmbulances(status),
        // Ambulance data is highly dynamic, mark as stale after 10 seconds
        staleTime: 10 * 1000,
        // Refetch every 30 seconds to keep positions updated
        refetchInterval: 30 * 1000,
    });
}

/**
 * Hook to fetch a single ambulance by ID
 */
export function useAmbulance(
    id: string,
    options?: { enabled?: boolean }
): UseQueryResult<Ambulance, Error> {
    return useQuery({
        queryKey: queryKeys.ambulances.detail(id),
        queryFn: () => ambulancesApi.getAmbulanceById(id),
        enabled: options?.enabled ?? true,
    });
}

/**
 * Hook to update ambulance position
 * Includes optimistic updates for instant UI feedback
 */
export function useUpdateAmbulancePosition(): UseMutationResult<
    Ambulance,
    Error,
    { id: string; coordinates: Coordinates }
> {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, coordinates }) =>
            ambulancesApi.updateAmbulancePosition(id, coordinates),

        // Optimistic update
        onMutate: async ({ id, coordinates }) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: queryKeys.ambulances.all });
            await queryClient.cancelQueries({ queryKey: queryKeys.ambulances.detail(id) });

            // Snapshot previous values
            const previousAmbulances = queryClient.getQueryData<Ambulance[]>(
                queryKeys.ambulances.all
            );
            const previousAmbulance = queryClient.getQueryData<Ambulance>(
                queryKeys.ambulances.detail(id)
            );

            // Optimistically update ambulances list
            if (previousAmbulances) {
                queryClient.setQueryData<Ambulance[]>(
                    queryKeys.ambulances.all,
                    previousAmbulances.map((amb) =>
                        amb.id === id
                            ? { ...amb, coordinates, lastUpdate: new Date().toISOString() }
                            : amb
                    )
                );
            }

            // Optimistically update single ambulance
            if (previousAmbulance) {
                queryClient.setQueryData<Ambulance>(queryKeys.ambulances.detail(id), {
                    ...previousAmbulance,
                    coordinates,
                    lastUpdate: new Date().toISOString(),
                });
            }

            return { previousAmbulances, previousAmbulance };
        },

        // On error, rollback
        onError: (error, { id }, context) => {
            if (context?.previousAmbulances) {
                queryClient.setQueryData(
                    queryKeys.ambulances.all,
                    context.previousAmbulances
                );
            }
            if (context?.previousAmbulance) {
                queryClient.setQueryData(
                    queryKeys.ambulances.detail(id),
                    context.previousAmbulance
                );
            }
        },

        // Always refetch after error or success
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.ambulances.all });
            // Invalidate proximity results when ambulance positions change
            queryClient.invalidateQueries({ queryKey: queryKeys.hospitals.all });
        },
    });
}

/**
 * Hook to update ambulance status
 */
export function useUpdateAmbulanceStatus(): UseMutationResult<
    Ambulance,
    Error,
    { id: string; status: AmbulanceStatus }
> {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, status }) =>
            ambulancesApi.updateAmbulanceStatus(id, status),

        onSuccess: (updatedAmbulance) => {
            // Update cache with new data
            queryClient.setQueryData(
                queryKeys.ambulances.detail(updatedAmbulance.id),
                updatedAmbulance
            );

            // Invalidate list queries
            queryClient.invalidateQueries({ queryKey: queryKeys.ambulances.all });
            // Invalidate proximity results when status changes
            queryClient.invalidateQueries({ queryKey: queryKeys.hospitals.all });
        },
    });
}

/**
 * Hook for batch updating ambulance positions (simulation)
 */
export function useBatchUpdateAmbulances(): UseMutationResult<
    Ambulance[],
    Error,
    Array<{ id: string; coordinates: Coordinates }>
> {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (updates) => ambulancesApi.batchUpdatePositions(updates),

        onSuccess: () => {
            // Invalidate all ambulance queries
            queryClient.invalidateQueries({ queryKey: queryKeys.ambulances.all });
            // Invalidate proximity results
            queryClient.invalidateQueries({ queryKey: queryKeys.hospitals.all });
        },
    });
}
