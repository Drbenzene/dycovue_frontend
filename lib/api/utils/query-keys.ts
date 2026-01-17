import type { AmbulanceStatus } from '@/types';

/**
 * Centralized query key factory
 * Provides type-safe, consistent query keys for React Query
 * 
 * Benefits:
 * - Type safety for query keys
 * - Easy cache invalidation
 * - Consistent naming convention
 * - Easy refactoring
 */

export const queryKeys = {
    // Hospital-related queries
    hospitals: {
        // All hospitals
        all: ['hospitals'] as const,

        // Single hospital by ID
        detail: (id: string) => ['hospitals', id] as const,

        // Nearest ambulance for a hospital
        nearestAmbulance: (hospitalId: string) =>
            ['hospitals', hospitalId, 'nearest-ambulance'] as const,
    },

    // Ambulance-related queries
    ambulances: {
        // All ambulances
        all: ['ambulances'] as const,

        // Ambulances filtered by status
        byStatus: (status?: AmbulanceStatus) =>
            status ? (['ambulances', { status }] as const) : (['ambulances'] as const),

        // Single ambulance by ID
        detail: (id: string) => ['ambulances', id] as const,
    },

    // Journey-related queries
    journeys: {
        // All journeys
        all: ['journeys'] as const,

        // Active journey for an ambulance
        active: (ambulanceId: string) =>
            ['journeys', 'active', ambulanceId] as const,

        // Single journey by ID
        detail: (journeyId: string) => ['journeys', journeyId] as const,
    },
} as const;

/**
 * Type helper to extract query key type
 */
export type QueryKey = typeof queryKeys;
