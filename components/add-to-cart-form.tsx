"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShoppingCart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  vehicleId: string;
  stock: number;
}

export default function AddToCartForm({ vehicleId, stock }: Props) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  async function handleAddToCart() {
    setAdding(true);
    setFeedback(null);
    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vehicleId, quantity }),
    });
    if (res.status === 401) {
      router.push("/auth/login");
      return;
    }
    const data = await res.json();
    if (res.ok) {
      setFeedback({ type: "success", msg: "Ajouté au panier avec succès." });
    } else {
      setFeedback({ type: "error", msg: data.error || "Erreur." });
    }
    setAdding(false);
  }

  if (stock <= 0) return null;

  return (
    <div className="mt-8 space-y-4">
      <div className="flex items-center gap-4">
        <label className="text-[11px] font-light tracking-widest uppercase text-muted-foreground" htmlFor="quantity">
          Quantité
        </label>
        <div className="flex items-center rounded border border-border">
          <button
            type="button"
            onClick={() => setQuantity(q => Math.max(1, q - 1))}
            aria-label="Diminuer la quantité"
            className="px-3 py-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            −
          </button>
          <span id="quantity" className="min-w-[2.5rem] text-center text-sm font-light">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity(q => Math.min(stock, q + 1))}
            aria-label="Augmenter la quantité"
            className="px-3 py-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            +
          </button>
        </div>
      </div>

      <Button
        variant="gold"
        size="luxury"
        onClick={handleAddToCart}
        disabled={adding}
        className="flex w-full items-center justify-center gap-2"
      >
        {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingCart className="h-4 w-4" />}
        Ajouter au panier
      </Button>

      {feedback && (
        <p className={`rounded border px-3 py-2 text-sm font-light ${
          feedback.type === "success"
            ? "border-gold/30 bg-gold/10 text-gold"
            : "border-destructive/30 bg-destructive/10 text-destructive"
        }`}>
          {feedback.msg}
          {feedback.type === "success" && (
            <Link href="/cart" className="ml-2 underline text-gold hover:no-underline">
              Voir le panier →
            </Link>
          )}
        </p>
      )}
    </div>
  );
}
