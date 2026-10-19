import { NextResponse } from "next/server";

export function POST() {
  return NextResponse.json(
    { success: false, error: "Captcha verification is closed." },
    { status: 410 },
  );
}
