import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "ID invalide." }, { status: 400 });
    }

    const client = await clientPromise!;
    const db = client!.db("luxe_motors");
    const vehicle = await db.collection("vehicles").findOne({ _id: new ObjectId(id) });

    if (!vehicle) {
      return NextResponse.json({ error: "Véhicule introuvable." }, { status: 404 });
    }

    return NextResponse.json({ vehicle: { ...vehicle, _id: vehicle._id.toString() } });
  } catch {
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
