import { getSession } from "@/lib/auth";
import { getCollectionWithVehicles } from "@/lib/vehicles-repo";
import { privateJson } from "@/lib/http";

export async function GET() {
  const session = await getSession();
  if (!session) return privateJson({ error: "Non autorisé." }, { status: 401 });

  const items = await getCollectionWithVehicles(session.sub);
  return privateJson({ items });
}
