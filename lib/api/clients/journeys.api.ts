import { apiClient } from '../axios.config';
import type { Journey } from '@/types';
import type { ApiResponse } from '../types/api-response';

/**
 * Journey API Client
 * Handles all journey/tracking-related API requests
 */

export interface StartJourneyRequest {
    ambulanceId: string;
    hospitalId: string;
}

export interface UpdateJourneyProgressRequest {
    progress: number;
}

export const journeysApi = {
    /**
     * Start a new journey
     */
    async startJourney(request: StartJourneyRequest): Promise<Journey> {
        const response = await apiClient.post<ApiResponse<Journey>>(
            '/journeys',
            request
        );
        return response.data.data;
    },

    /**
     * Get active journey for an ambulance
     */
    async getActiveJourney(ambulanceId: string): Promise<Journey | null> {
        const response = await apiClient.get<ApiResponse<Journey | null>>(
            `/journeys/active/${ambulanceId}`
        );
        return response.data.data;
    },

    /**
     * Get journey by ID
     */
    async getJourneyById(journeyId: string): Promise<Journey> {
        const response = await apiClient.get<ApiResponse<Journey>>(
            `/journeys/${journeyId}`
        );
        return response.data.data;
    },

    /**
     * Update journey progress
     */
    async updateJourneyProgress(
        journeyId: string,
        request: UpdateJourneyProgressRequest
    ): Promise<Journey> {
        const response = await apiClient.patch<ApiResponse<Journey>>(
            `/journeys/${journeyId}/progress`,
            request
        );
        return response.data.data;
    },

    /**
     * Complete a journey
     */
    async completeJourney(journeyId: string): Promise<Journey> {
        const response = await apiClient.post<ApiResponse<Journey>>(
            `/journeys/${journeyId}/complete`
        );
        return response.data.data;
    },

    /**
     * Cancel a journey
     */
    async cancelJourney(journeyId: string): Promise<void> {
        await apiClient.delete(`/journeys/${journeyId}`);
    },
};
