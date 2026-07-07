import { NextResponse } from "next/server";
import { getVehicleById } from "@/lib/vehicles-repo";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const vehicle = await getVehicleById(id);

    if (!vehicle) {
      return NextResponse.json({ error: "Véhicule introuvable." }, { status: 404 });
    }

    return NextResponse.json(
      { vehicle },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } }
    );
  } catch (error) {
    console.error("GET /api/vehicles/[id] failed:", error);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
