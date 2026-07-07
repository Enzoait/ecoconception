import { NextResponse } from "next/server";
import { queryVehicles } from "@/lib/vehicles-repo";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const page = searchParams.get("page");
    const limit = searchParams.get("limit");

    const result = await queryVehicles({
      category: searchParams.get("category") ?? undefined,
      search: searchParams.get("search") ?? undefined,
      sort: searchParams.get("sort") ?? undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("GET /api/vehicles failed:", error);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
