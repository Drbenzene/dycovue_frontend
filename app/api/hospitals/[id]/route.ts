import { NextRequest, NextResponse } from 'next/server';
import { hospitals } from '@/data/hospitals';

interface RouteParams {
    params: Promise<{
        id: string;
    }>;
}

/**
 * GET /api/hospitals/[id]
 * Returns a single hospital by ID
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

        return NextResponse.json({
            success: true,
            data: hospital,
        });
    } catch (error) {
        console.error('Error fetching hospital:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to fetch hospital',
            },
            { status: 500 }
        );
    }
}
