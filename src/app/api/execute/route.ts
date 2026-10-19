import { NextResponse } from "next/server";

export const POST = () => {
  return NextResponse.json(
    { error: "Sponsored transactions are closed." },
    { status: 410 },
  );
};
