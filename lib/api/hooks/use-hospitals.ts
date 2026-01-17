import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { hospitalsApi } from '../clients/hospitals.api';
import { queryKeys } from '../utils/query-keys';
import type { Hospital, ProximityResult } from '@/types';

/**
 * Hook to fetch all hospitals
 */
export function useHospitals(): UseQueryResult<Hospital[], Error> {
    return useQuery({
        queryKey: queryKeys.hospitals.all,
        queryFn: () => hospitalsApi.getHospitals(),
    });
}

/**
 * Hook to fetch a single hospital by ID
 */
export function useHospital(
    id: string,
    options?: { enabled?: boolean }
): UseQueryResult<Hospital, Error> {
    return useQuery({
        queryKey: queryKeys.hospitals.detail(id),
        queryFn: () => hospitalsApi.getHospitalById(id),
        enabled: options?.enabled ?? true,
    });
}

/**
 * Hook to find the nearest ambulance to a hospital
 * 
 * This query is cached for 30 seconds to avoid redundant calculations
 * and is refetched when ambulance data changes
 */
export function useNearestAmbulance(
    hospitalId: string | null,
    options?: { enabled?: boolean }
): UseQueryResult<ProximityResult | null, Error> {
    return useQuery({
        queryKey: hospitalId
            ? queryKeys.hospitals.nearestAmbulance(hospitalId)
            : ['hospitals', 'nearest-ambulance', 'null'],
        queryFn: () => {
            if (!hospitalId) return null;
            return hospitalsApi.getNearestAmbulance(hospitalId);
        },
        enabled: (options?.enabled ?? true) && hospitalId !== null,
        // Cache proximity results for 30 seconds
        staleTime: 30 * 1000,
        // Refetch on window focus to get latest ambulance positions
        refetchOnWindowFocus: true,
    });
}
