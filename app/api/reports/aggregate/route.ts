import { NextResponse } from "next/server";
import { TTLCache } from "@/lib/cache";
import { fetchVehiclesForAggregate, optimizedAggregate } from "@/lib/aggregate";

const CACHE_TTL_MS = Number(process.env.AGGREGATE_CACHE_TTL_MS || "30000");
const cache = new TTLCache<unknown>(CACHE_TTL_MS, 50);

export async function GET() {
  try {
    const cached = cache.get("aggregate");
    if (cached) {
      return NextResponse.json(cached, {
        headers: {
          "Cache-Control": "public, max-age=30, s-maxage=30",
          "X-Cache": "HIT",
        },
      });
    }

    const vehicles = await fetchVehiclesForAggregate();
    const result = await optimizedAggregate(vehicles);

    cache.set("aggregate", result);

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, max-age=30, s-maxage=30",
        "X-Cache": "MISS",
      },
    });
  } catch (error) {
    console.error("GET /api/reports/aggregate failed:", error);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
