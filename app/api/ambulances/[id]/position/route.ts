import { NextRequest, NextResponse } from 'next/server';
import { ambulancesStore } from '../../store';

interface RouteParams {
    params: Promise<{
        id: string;
    }>;
}

/**
 * PATCH /api/ambulances/[id]/position
 * Update ambulance position
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { coordinates } = body;

        if (!coordinates || coordinates.lat === undefined || coordinates.lng === undefined) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Invalid coordinates. coordinates object with lat and lng is required',
                },
                { status: 400 }
            );
        }

        const updated = ambulancesStore.update(id, {
            coordinates
        });

        if (!updated) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Ambulance not found',
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: updated,
        });
    } catch (error) {
        console.error('Error updating ambulance position:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to update ambulance position',
            },
            { status: 500 }
        );
    }
}
