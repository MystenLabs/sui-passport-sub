import { NextResponse } from "next/server";

export function POST() {
  return NextResponse.json(
    { success: false, error: "Leaderboard updates are closed." },
    { status: 410 },
  );
}

export function GET() {
  return NextResponse.json(
    { success: false, error: "The leaderboard is closed." },
    { status: 410 },
  );
}
