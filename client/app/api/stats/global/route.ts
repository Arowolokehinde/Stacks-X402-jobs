import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      totalSkills: 5,
      totalExecutions: 0,
      totalRevenueSTX: 0,
    },
    { status: 200 }
  );
}
