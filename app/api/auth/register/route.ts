import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import clientPromise from "@/lib/mongodb";
import { signToken, setSessionCookie } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Tous les champs sont requis." }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Le mot de passe doit contenir au moins 6 caractères." }, { status: 400 });
    }

    const client = await clientPromise!;
    const db = client!.db("luxe_motors");

    const existing = await db.collection("users").findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json({ error: "Cette adresse email est déjà utilisée." }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 12);
    const result = await db.collection("users").insertOne({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashed,
      createdAt: new Date(),
    });

    const token = await signToken({
      sub: result.insertedId.toString(),
      email: email.toLowerCase().trim(),
      name: name.trim(),
    });

    await setSessionCookie(token);

    return NextResponse.json({ success: true, name: name.trim() });
  } catch (error) {
    console.error("POST /api/auth/register failed:", error);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
