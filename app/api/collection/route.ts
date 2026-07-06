import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });

  const client = await clientPromise!;
  const db = client!.db("luxe_motors");

  const userCollection = await db.collection("user_collections").findOne({ userId: session.sub });
  if (!userCollection || !userCollection.items?.length) {
    return NextResponse.json({ items: [] });
  }

  const vehicleIds = userCollection.items.map((i: { vehicleId: string }) => new ObjectId(i.vehicleId));
  const vehicles = await db.collection("vehicles").find({ _id: { $in: vehicleIds } }).toArray();
  const vehicleMap = Object.fromEntries(vehicles.map(v => [v._id.toString(), { ...v, _id: v._id.toString() }]));

  const populated = userCollection.items.map((item: { vehicleId: string; quantity: number; pricePaid: number; purchasedAt: Date }) => ({
    ...item,
    vehicle: vehicleMap[item.vehicleId] || null,
  }));

  return NextResponse.json({ items: populated });
}
