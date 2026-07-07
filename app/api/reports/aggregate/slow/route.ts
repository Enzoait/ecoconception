import { NextResponse } from "next/server";
import { TTLCache } from "@/lib/cache";
import { fetchVehiclesForAggregate, baselineAggregate } from "@/lib/aggregate";

// Intentionally small/no TTL so every request re-executes the baseline path.
const cache = new TTLCache<unknown>(0, 1);

export async function GET() {
  try {
    const vehicles = await fetchVehiclesForAggregate();
    const result = baselineAggregate(vehicles);

    // Always miss on the baseline endpoint to measure worst-case CPU.
    cache.clear();

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, max-age=0, s-maxage=0",
        "X-Cache": "MISS",
      },
    });
  } catch (error) {
    console.error("GET /api/reports/aggregate/slow failed:", error);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
