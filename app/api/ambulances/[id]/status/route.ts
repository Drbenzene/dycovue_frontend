import { NextRequest, NextResponse } from 'next/server';
import { ambulancesStore } from '../../store';
import type { AmbulanceStatus } from '@/types';

interface RouteParams {
    params: Promise<{
        id: string;
    }>;
}

/**
 * PATCH /api/ambulances/[id]/status
 * Update ambulance status
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { status } = body as { status: AmbulanceStatus };

        if (!status || !['available', 'busy', 'en_route', 'offline'].includes(status)) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Invalid status. Must be one of: available, busy, en_route, offline',
                },
                { status: 400 }
            );
        }

        const updated = ambulancesStore.update(id, { status });

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
        console.error('Error updating ambulance status:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to update ambulance status',
            },
            { status: 500 }
        );
    }
}
