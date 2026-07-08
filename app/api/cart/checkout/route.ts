import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { getSession } from "@/lib/auth";
import { privateJson } from "@/lib/http";

export async function POST() {
  const session = await getSession();
  if (!session) return privateJson({ error: "Non autorisé." }, { status: 401 });

  const db = await getDb();

  const cart = await db.collection("carts").findOne({ userId: session.sub });
  if (!cart || !cart.items?.length) {
    return privateJson({ error: "Panier vide." }, { status: 400 });
  }

  const vehicleIds = cart.items.map((i: { vehicleId: string }) => new ObjectId(i.vehicleId));
  const vehicles = await db.collection("vehicles").find({ _id: { $in: vehicleIds } }).toArray();
  const vehicleMap = Object.fromEntries(vehicles.map(v => [v._id.toString(), v]));

  const purchasedAt = new Date();
  const newItems = cart.items.map((item: { vehicleId: string; quantity: number }) => {
    const vehicle = vehicleMap[item.vehicleId];
    return {
      vehicleId: item.vehicleId,
      quantity: item.quantity,
      pricePaid: vehicle ? (vehicle.price as number) * item.quantity : 0,
      purchasedAt,
    };
  });

  const existingCollection = await db.collection("user_collections").findOne({ userId: session.sub });
  if (existingCollection) {
    const updatedItems = [...(existingCollection.items ?? []), ...newItems];
    await db.collection("user_collections").updateOne(
      { userId: session.sub },
      { $set: { items: updatedItems } }
    );
  } else {
    await db.collection("user_collections").insertOne({
      userId: session.sub,
      items: newItems,
    });
  }

  await db.collection("carts").updateOne(
    { userId: session.sub },
    { $set: { items: [], updatedAt: new Date() } }
  );

  return privateJson({ success: true, purchased: newItems.length });
}
