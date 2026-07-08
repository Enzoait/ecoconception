import bcrypt from "bcryptjs";
import { getDb } from "@/lib/mongodb";
import { signToken, setSessionCookie } from "@/lib/auth";
import { privateJson } from "@/lib/http";

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return privateJson({ error: "Tous les champs sont requis." }, { status: 400 });
    }
    if (password.length < 6) {
      return privateJson({ error: "Le mot de passe doit contenir au moins 6 caractères." }, { status: 400 });
    }

    const db = await getDb();

    const existing = await db.collection("users").findOne({ email: email.toLowerCase() });
    if (existing) {
      return privateJson({ error: "Cette adresse email est déjà utilisée." }, { status: 409 });
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

    return privateJson({ success: true, name: name.trim() });
  } catch (error) {
    console.error("POST /api/auth/register failed:", error);
    return privateJson({ error: "Erreur serveur." }, { status: 500 });
  }
}
