import { NextResponse } from "next/server";
import { userService } from "~/lib/db";

export async function POST() {
    return NextResponse.json(
        { success: false, error: "Leaderboard updates are closed." },
        { status: 410 },
    );
}

export async function GET() {
    try {
        const users = await userService.getTopUsers();
        return new NextResponse(JSON.stringify(users));
    } catch (error) {
        console.error('Error in GET /api/users:', error);
        return NextResponse.json(
            { error: "Internal Server Error" }, 
            { status: 500 }
        );
    }
}