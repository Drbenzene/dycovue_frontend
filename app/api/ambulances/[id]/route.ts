import { NextRequest, NextResponse } from 'next/server';
import { ambulancesStore } from '../store';

interface RouteParams {
    params: Promise<{
        id: string;
    }>;
}

/**
 * GET /api/ambulances/[id]
 * Returns a single ambulance by ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const ambulance = ambulancesStore.getById(id);

        if (!ambulance) {
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
            data: ambulance,
        });
    } catch (error) {
        console.error('Error fetching ambulance:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to fetch ambulance',
            },
            { status: 500 }
        );
    }
}
