import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getCollectionWithVehicles } from "@/lib/vehicles-repo";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });

  const items = await getCollectionWithVehicles(session.sub);
  return NextResponse.json({ items });
}
