import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import clientPromise from "@/lib/mongodb";
import { signToken, setSessionCookie } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email et mot de passe requis." }, { status: 400 });
    }

    const client = await clientPromise!;
    const db = client!.db("luxe_motors");

    const user = await db.collection("users").findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return NextResponse.json({ error: "Identifiants invalides." }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.password as string);
    if (!valid) {
      return NextResponse.json({ error: "Identifiants invalides." }, { status: 401 });
    }

    const token = await signToken({
      sub: user._id.toString(),
      email: user.email as string,
      name: user.name as string,
    });

    await setSessionCookie(token);

    return NextResponse.json({ success: true, name: user.name });
  } catch (error) {
    console.error("POST /api/auth/login failed:", error);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
