import { NextRequest, NextResponse } from 'next/server';
import { hospitals } from '@/data/hospitals';
import { ambulancesStore } from '../../../ambulances/store';
import { SpatialService } from '@/services/spatial.service';

interface RouteParams {
    params: Promise<{
        id: string;
    }>;
}

/**
 * GET /api/hospitals/[id]/nearest-ambulance
 * Find the nearest available ambulance to a hospital
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const hospital = hospitals.find((h) => h.id === id);

        if (!hospital) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Hospital not found',
                },
                { status: 404 }
            );
        }

        // Get all ambulances from the store
        const ambulances = ambulancesStore.getAll();

        // Find nearest ambulance using spatial service
        const proximityResult = SpatialService.findNearestAmbulance(
            hospital.coordinates,
            ambulances
        );

        return NextResponse.json({
            success: true,
            data: proximityResult,
        });
    } catch (error) {
        console.error('Error finding nearest ambulance:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to find nearest ambulance',
            },
            { status: 500 }
        );
    }
}
