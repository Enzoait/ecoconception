import { NextResponse } from "next/server";
import { dbConnectionStatus } from "@/db/connection-status";

export async function GET() {
  const status = await dbConnectionStatus();
  return NextResponse.json({ status });
}
