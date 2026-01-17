import { apiClient } from '../axios.config';
import type { Ambulance, AmbulanceStatus, Coordinates } from '@/types';
import type { ApiResponse } from '../types/api-response';
import {
    transformAmbulanceFromApi,
    transformAmbulancesFromApi,
    type AmbulanceApiResponse
} from '../utils/transformers';

/**
 * Ambulance API Client
 * Handles all ambulance-related API requests
 */

export const ambulancesApi = {
    /**
     * Fetch all ambulances with optional status filter
     */
    async getAmbulances(status?: AmbulanceStatus): Promise<Ambulance[]> {
        const params = status ? { status } : {};
        const response = await apiClient.get<ApiResponse<AmbulanceApiResponse[]>>('/ambulances', {
            params,
        });
        return transformAmbulancesFromApi(response.data.data);
    },

    /**
     * Fetch a single ambulance by ID
     */
    async getAmbulanceById(id: string): Promise<Ambulance> {
        const response = await apiClient.get<ApiResponse<AmbulanceApiResponse>>(
            `/ambulances/${id}`
        );
        return transformAmbulanceFromApi(response.data.data);
    },

    /**
     * Update ambulance position
     */
    async updateAmbulancePosition(
        id: string,
        coordinates: Coordinates
    ): Promise<Ambulance> {
        const response = await apiClient.patch<ApiResponse<AmbulanceApiResponse>>(
            `/ambulances/${id}/position`,
            {
                coordinates
            }
        );
        return transformAmbulanceFromApi(response.data.data);
    },

    /**
     * Update ambulance status
     */
    async updateAmbulanceStatus(
        id: string,
        status: AmbulanceStatus
    ): Promise<Ambulance> {
        const response = await apiClient.patch<ApiResponse<AmbulanceApiResponse>>(
            `/ambulances/${id}/status`,
            { status }
        );
        return transformAmbulanceFromApi(response.data.data);
    },

    /**
     * Batch update ambulance positions (for simulation)
     */
    async batchUpdatePositions(
        updates: Array<{ id: string; coordinates: Coordinates }>
    ): Promise<Ambulance[]> {
        // Send coordinates directly as nested objects
        const apiUpdates = updates.map(update => ({
            id: update.id,
            coordinates: update.coordinates,
        }));

        const response = await apiClient.post<ApiResponse<AmbulanceApiResponse[]>>(
            '/ambulances/batch-update',
            { updates: apiUpdates }
        );
        return transformAmbulancesFromApi(response.data.data);
    },
};
