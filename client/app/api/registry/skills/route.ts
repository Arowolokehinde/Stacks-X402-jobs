import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ skills: [] }, { status: 200 });
}
