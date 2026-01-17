import { NextRequest, NextResponse } from 'next/server';
import { hospitals } from '@/data/hospitals';

/**
 * GET /api/hospitals
 * Returns all hospitals
 */
export async function GET() {
    try {
        return NextResponse.json({
            success: true,
            data: hospitals,
        });
    } catch (error) {
        console.error('Error fetching hospitals:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to fetch hospitals',
            },
            { status: 500 }
        );
    }
}
