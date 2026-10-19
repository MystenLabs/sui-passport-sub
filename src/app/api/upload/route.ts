import { NextResponse } from "next/server";

export function POST() {
  return NextResponse.json(
    { error: "Uploads are closed." },
    { status: 410 },
  );
}
