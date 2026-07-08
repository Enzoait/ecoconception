import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { getSession } from "@/lib/auth";
import { getCartWithVehicles } from "@/lib/vehicles-repo";
import { privateJson } from "@/lib/http";

export async function GET() {
  const session = await getSession();
  if (!session) return privateJson({ error: "Non autorisé." }, { status: 401 });

  const items = await getCartWithVehicles(session.sub);
  return privateJson({ items });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return privateJson({ error: "Non autorisé." }, { status: 401 });

  const { vehicleId, quantity } = await request.json();
  if (!vehicleId || !quantity || quantity < 1) {
    return privateJson({ error: "Données invalides." }, { status: 400 });
  }

  const db = await getDb();

  const vehicle = await db.collection("vehicles").findOne({ _id: new ObjectId(vehicleId) });
  if (!vehicle) return privateJson({ error: "Véhicule introuvable." }, { status: 404 });

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

  return privateJson({ success: true });
}

export async function PUT(request: Request) {
  const session = await getSession();
  if (!session) return privateJson({ error: "Non autorisé." }, { status: 401 });

  const { vehicleId, quantity } = await request.json();
  if (!vehicleId || quantity == null) {
    return privateJson({ error: "Données invalides." }, { status: 400 });
  }

  const db = await getDb();

  const cart = await db.collection("carts").findOne({ userId: session.sub });
  if (!cart) return privateJson({ error: "Panier introuvable." }, { status: 404 });

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

  return privateJson({ success: true });
}

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session) return privateJson({ error: "Non autorisé." }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const vehicleId = searchParams.get("vehicleId");
  if (!vehicleId) return privateJson({ error: "vehicleId requis." }, { status: 400 });

  const db = await getDb();

  const cart = await db.collection("carts").findOne({ userId: session.sub });
  if (cart) {
    const items = (cart.items ?? []).filter((i: { vehicleId: string }) => i.vehicleId !== vehicleId);
    await db.collection("carts").updateOne(
      { userId: session.sub },
      { $set: { items, updatedAt: new Date() } }
    );
  }

  return privateJson({ success: true });
}
