import { getSession } from "@/lib/auth";
import { privateJson } from "@/lib/http";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return privateJson({ user: null }, { status: 401 });
  }
  return privateJson({ user: { id: session.sub, email: session.email, name: session.name } });
}
