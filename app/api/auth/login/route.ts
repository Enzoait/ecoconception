import bcrypt from "bcryptjs";
import { getDb } from "@/lib/mongodb";
import { signToken, setSessionCookie } from "@/lib/auth";
import { privateJson } from "@/lib/http";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return privateJson({ error: "Email et mot de passe requis." }, { status: 400 });
    }

    const db = await getDb();

    const user = await db.collection("users").findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return privateJson({ error: "Identifiants invalides." }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.password as string);
    if (!valid) {
      return privateJson({ error: "Identifiants invalides." }, { status: 401 });
    }

    const token = await signToken({
      sub: user._id.toString(),
      email: user.email as string,
      name: user.name as string,
    });

    await setSessionCookie(token);

    return privateJson({ success: true, name: user.name });
  } catch (error) {
    console.error("POST /api/auth/login failed:", error);
    return privateJson({ error: "Erreur serveur." }, { status: 500 });
  }
}
