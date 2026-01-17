import { apiClient } from '../axios.config';
import type { Hospital } from '@/types';
import type { ApiResponse } from '../types/api-response';
import type { ProximityResult } from '@/types';
import {
    transformHospitalFromApi,
    transformHospitalsFromApi,
    type HospitalApiResponse
} from '../utils/transformers';

/**
 * Hospital API Client
 * Handles all hospital-related API requests
 */

export const hospitalsApi = {
    /**
     * Fetch all hospitals
     */
    async getHospitals(): Promise<Hospital[]> {
        const response = await apiClient.get<ApiResponse<HospitalApiResponse[]>>('/hospitals');
        return transformHospitalsFromApi(response.data.data);
    },

    /**
     * Fetch a single hospital by ID
     */
    async getHospitalById(id: string): Promise<Hospital> {
        const response = await apiClient.get<ApiResponse<HospitalApiResponse>>(`/hospitals/${id}`);
        return transformHospitalFromApi(response.data.data);
    },

    /**
     * Find the nearest available ambulance to a hospital
     */
    async getNearestAmbulance(hospitalId: string): Promise<ProximityResult | null> {
        const response = await apiClient.get<ApiResponse<ProximityResult | null>>(
            `/hospitals/${hospitalId}/nearest-ambulance`
        );
        return response.data.data;
    },
};
