import { clearSessionCookie } from "@/lib/auth";
import { privateJson } from "@/lib/http";

export async function POST() {
  await clearSessionCookie();
  return privateJson({ success: true });
}
