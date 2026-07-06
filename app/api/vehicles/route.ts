import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") || "price_asc";
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");

    const client = await clientPromise!;
    const db = client!.db("luxe_motors");

    const query: Record<string, unknown> = {};
    if (category && category !== "all") query.category = category;
    if (search) {
      query.$or = [
        { brand: { $regex: search, $options: "i" } },
        { model: { $regex: search, $options: "i" } },
      ];
    }
    if (minPrice || maxPrice) {
      const priceFilter: Record<string, number> = {};
      if (minPrice) priceFilter.$gte = Number(minPrice);
      if (maxPrice) priceFilter.$lte = Number(maxPrice);
      query.price = priceFilter;
    }

    const sortMap: Record<string, [string, 1 | -1]> = {
      price_asc: ["price", 1],
      price_desc: ["price", -1],
      name_asc: ["brand", 1],
      name_desc: ["brand", -1],
    };
    const [sortField, sortOrder] = sortMap[sort] ?? ["price", 1];

    const vehicles = await db
      .collection("vehicles")
      .find(query)
      .sort({ [sortField]: sortOrder })
      .toArray();

    return NextResponse.json({ vehicles: vehicles.map(v => ({ ...v, _id: v._id.toString() })) });
  } catch (error) {
    console.error("GET /api/vehicles failed:", error);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
