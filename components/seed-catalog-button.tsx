"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function SeedCatalogButton() {
  const router = useRouter();
  const [seeding, setSeeding] = useState(false);

  if (process.env.NODE_ENV === "production") return null;

  async function handleSeed() {
    setSeeding(true);
    await fetch("/api/seed", { method: "POST" });
    setSeeding(false);
    router.refresh();
  }

  return (
    <Button variant="gold-outline" size="luxury" onClick={handleSeed} disabled={seeding} className="mt-6">
      {seeding ? "Initialisation..." : "Initialiser le catalogue (dev)"}
    </Button>
  );
}
