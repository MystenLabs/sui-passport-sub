import { NextResponse } from 'next/server';

export async function POST() {
    return NextResponse.json(
        { success: false, valid: false, error: 'Stamp claims are closed.' },
        { status: 410 },
    );
}

export async function GET() {
    try {
        const { stampService } = await import('~/lib/db');
        const result = await stampService.getAll();
        return NextResponse.json(result);
    } catch (error) {
        console.error('Error fetching claim stamps:', error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Failed to fetch claim stamps' },
            { status: 500 }
        );
    }
}


export async function PATCH() {
    return NextResponse.json(
        { success: false, error: 'Stamp claims are closed.' },
        { status: 410 },
    );
}
