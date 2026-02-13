import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ skillId: string }> }
) {
  const { skillId } = await params;
  return NextResponse.json({ skillId, message: "Not implemented" }, { status: 501 });
}
