import { NextRequest, NextResponse } from 'next/server';
import { ambulancesStore } from './store';

/**
 * GET /api/ambulances
 * Returns all ambulances, optionally filtered by status
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const status = searchParams.get('status');

        const ambulances = status
            ? ambulancesStore.getByStatus(status)
            : ambulancesStore.getAll();

        return NextResponse.json({
            success: true,
            data: ambulances,
        });
    } catch (error) {
        console.error('Error fetching ambulances:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to fetch ambulances',
            },
            { status: 500 }
        );
    }
}

/**
 * POST /api/ambulances/batch-update
 * Batch update ambulance positions
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { updates } = body;

        if (!Array.isArray(updates)) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Invalid request: updates must be an array',
                },
                { status: 400 }
            );
        }

        // Standardized to nested coordinates in request body
        const storeUpdates = updates.map((update: any) => ({
            id: update.id,
            updates: {
                coordinates: update.coordinates,
            },
        }));

        const updatedAmbulances = ambulancesStore.batchUpdate(storeUpdates);

        return NextResponse.json({
            success: true,
            data: updatedAmbulances,
        });
    } catch (error) {
        console.error('Error batch updating ambulances:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to batch update ambulances',
            },
            { status: 500 }
        );
    }
}
