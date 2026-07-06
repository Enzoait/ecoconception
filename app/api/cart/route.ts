import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });

  const client = await clientPromise!;
  const db = client!.db("luxe_motors");

  const cart = await db.collection("carts").findOne({ userId: session.sub });
  if (!cart || !cart.items?.length) {
    return NextResponse.json({ items: [] });
  }

  const vehicleIds = cart.items.map((i: { vehicleId: string }) => new ObjectId(i.vehicleId));
  const vehicles = await db.collection("vehicles").find({ _id: { $in: vehicleIds } }).toArray();
  const vehicleMap = Object.fromEntries(vehicles.map(v => [v._id.toString(), { ...v, _id: v._id.toString() }]));

  const populated = cart.items.map((item: { vehicleId: string; quantity: number }) => ({
    ...item,
    vehicle: vehicleMap[item.vehicleId] || null,
  }));

  return NextResponse.json({ items: populated });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });

  const { vehicleId, quantity } = await request.json();
  if (!vehicleId || !quantity || quantity < 1) {
    return NextResponse.json({ error: "Données invalides." }, { status: 400 });
  }

  const client = await clientPromise!;
  const db = client!.db("luxe_motors");

  const vehicle = await db.collection("vehicles").findOne({ _id: new ObjectId(vehicleId) });
  if (!vehicle) return NextResponse.json({ error: "Véhicule introuvable." }, { status: 404 });

  const cart = await db.collection("carts").findOne({ userId: session.sub });
  const items: { vehicleId: string; quantity: number }[] = cart?.items ?? [];

  const existingIdx = items.findIndex(i => i.vehicleId === vehicleId);
  if (existingIdx >= 0) {
    items[existingIdx].quantity += quantity;
  } else {
    items.push({ vehicleId, quantity });
  }

  await db.collection("carts").updateOne(
    { userId: session.sub },
    { $set: { items, updatedAt: new Date() } },
    { upsert: true }
  );

  return NextResponse.json({ success: true });
}

export async function PUT(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });

  const { vehicleId, quantity } = await request.json();
  if (!vehicleId || quantity == null) {
    return NextResponse.json({ error: "Données invalides." }, { status: 400 });
  }

  const client = await clientPromise!;
  const db = client!.db("luxe_motors");

  const cart = await db.collection("carts").findOne({ userId: session.sub });
  if (!cart) return NextResponse.json({ error: "Panier introuvable." }, { status: 404 });

  let items: { vehicleId: string; quantity: number }[] = cart.items ?? [];

  if (quantity <= 0) {
    items = items.filter(i => i.vehicleId !== vehicleId);
  } else {
    const idx = items.findIndex(i => i.vehicleId === vehicleId);
    if (idx >= 0) items[idx].quantity = quantity;
  }

  await db.collection("carts").updateOne(
    { userId: session.sub },
    { $set: { items, updatedAt: new Date() } }
  );

  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const vehicleId = searchParams.get("vehicleId");
  if (!vehicleId) return NextResponse.json({ error: "vehicleId requis." }, { status: 400 });

  const client = await clientPromise!;
  const db = client!.db("luxe_motors");

  const cart = await db.collection("carts").findOne({ userId: session.sub });
  if (cart) {
    const items = (cart.items ?? []).filter((i: { vehicleId: string }) => i.vehicleId !== vehicleId);
    await db.collection("carts").updateOne(
      { userId: session.sub },
      { $set: { items, updatedAt: new Date() } }
    );
  }

  return NextResponse.json({ success: true });
}
