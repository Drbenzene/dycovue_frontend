import {
    useQuery,
    useMutation,
    useQueryClient,
    UseQueryResult,
    UseMutationResult,
} from '@tanstack/react-query';
import {
    journeysApi,
    type StartJourneyRequest,
    type UpdateJourneyProgressRequest,
} from '../clients/journeys.api';
import { queryKeys } from '../utils/query-keys';
import type { Journey } from '@/types';

/**
 * Hook to get active journey for an ambulance
 */
export function useActiveJourney(
    ambulanceId: string | null,
    options?: { enabled?: boolean }
): UseQueryResult<Journey | null, Error> {
    return useQuery({
        queryKey: ambulanceId
            ? queryKeys.journeys.active(ambulanceId)
            : ['journeys', 'active', 'null'],
        queryFn: () => {
            if (!ambulanceId) return null;
            return journeysApi.getActiveJourney(ambulanceId);
        },
        enabled: (options?.enabled ?? true) && ambulanceId !== null,
        // Poll every 5 seconds during active journey
        refetchInterval: 5 * 1000,
    });
}

/**
 * Hook to get journey by ID
 */
export function useJourney(
    journeyId: string | null,
    options?: { enabled?: boolean }
): UseQueryResult<Journey, Error> {
    return useQuery({
        queryKey: journeyId
            ? queryKeys.journeys.detail(journeyId)
            : ['journeys', 'null'],
        queryFn: () => {
            if (!journeyId) throw new Error('Journey ID is required');
            return journeysApi.getJourneyById(journeyId);
        },
        enabled: (options?.enabled ?? true) && journeyId !== null,
    });
}

/**
 * Hook to start a new journey
 */
export function useStartJourney(): UseMutationResult<
    Journey,
    Error,
    StartJourneyRequest
> {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (request: StartJourneyRequest) => journeysApi.startJourney(request),

        onSuccess: (journey: Journey) => {
            // Cache the new journey
            queryClient.setQueryData(
                queryKeys.journeys.active(journey.ambulanceId),
                journey
            );

            // Invalidate ambulance queries (status will change to 'busy')
            queryClient.invalidateQueries({ queryKey: queryKeys.ambulances.all });
        },
    });
}

/**
 * Hook to update journey progress
 */
export function useUpdateJourneyProgress(): UseMutationResult<
    Journey,
    Error,
    { journeyId: string; request: UpdateJourneyProgressRequest }
> {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ journeyId, request }: { journeyId: string; request: UpdateJourneyProgressRequest }) =>
            journeysApi.updateJourneyProgress(journeyId, request),

        onSuccess: (journey: Journey) => {
            // Update cached journey
            queryClient.setQueryData(
                queryKeys.journeys.active(journey.ambulanceId),
                journey
            );
            queryClient.setQueryData(
                queryKeys.journeys.detail(journey.ambulanceId),
                journey
            );
        },
    });
}

/**
 * Hook to complete a journey
 */
export function useCompleteJourney(): UseMutationResult<
    Journey,
    Error,
    string
> {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (journeyId: string) => journeysApi.completeJourney(journeyId),

        onSuccess: (journey: Journey) => {
            // Remove active journey from cache
            queryClient.setQueryData(
                queryKeys.journeys.active(journey.ambulanceId),
                null
            );

            // Invalidate ambulance queries (status will change back to 'available')
            queryClient.invalidateQueries({ queryKey: queryKeys.ambulances.all });
        },
    });
}

/**
 * Hook to cancel a journey
 */
export function useCancelJourney(): UseMutationResult<
    void,
    Error,
    { journeyId: string; ambulanceId: string }
> {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ journeyId }: { journeyId: string }) => journeysApi.cancelJourney(journeyId),

        onSuccess: (_: void, { ambulanceId }: { journeyId: string; ambulanceId: string }) => {
            // Remove active journey from cache
            queryClient.setQueryData(queryKeys.journeys.active(ambulanceId), null);

            // Invalidate ambulance queries
            queryClient.invalidateQueries({ queryKey: queryKeys.ambulances.all });
        },
    });
}
