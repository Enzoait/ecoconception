"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import type { CartItemPopulated, Vehicle } from "@/lib/types";

type PopulatedItem = CartItemPopulated & { vehicle: Vehicle & { _id: string } };

export default function CartItemRow({ item }: { item: PopulatedItem }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const v = item.vehicle;
  const imageSrc = v.images?.[0] ?? `https://picsum.photos/seed/${v.brand}-${v.model}/400/225`;

  async function updateQuantity(quantity: number) {
    await fetch("/api/cart", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vehicleId: item.vehicleId, quantity }),
    });
    startTransition(() => router.refresh());
  }

  async function removeItem() {
    await fetch(`/api/cart?vehicleId=${item.vehicleId}`, { method: "DELETE" });
    startTransition(() => router.refresh());
  }

  return (
    <div className={`flex gap-4 rounded-lg border border-border bg-card p-4 transition-opacity ${isPending ? "opacity-60" : ""}`}>
      <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded">
        <Image src={imageSrc} alt={`${v.brand} ${v.model}`} fill className="object-cover" sizes="128px" />
      </div>
      <div className="flex flex-1 flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[10px] font-light tracking-widest uppercase text-muted-foreground">{v.brand}</p>
            <p className="font-serif text-lg font-light">{v.model}</p>
          </div>
          <button
            onClick={removeItem}
            disabled={isPending}
            aria-label={`Retirer ${v.brand} ${v.model} du panier`}
            className="text-muted-foreground hover:text-destructive transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center rounded border border-border">
            <button
              onClick={() => updateQuantity(item.quantity - 1)}
              disabled={isPending}
              aria-label="Diminuer la quantité"
              className="px-2.5 py-1 text-muted-foreground hover:text-foreground transition-colors text-sm"
            >
              −
            </button>
            <span className="min-w-[2rem] text-center text-sm font-light">{item.quantity}</span>
            <button
              onClick={() => updateQuantity(item.quantity + 1)}
              disabled={isPending}
              aria-label="Augmenter la quantité"
              className="px-2.5 py-1 text-muted-foreground hover:text-foreground transition-colors text-sm"
            >
              +
            </button>
          </div>
          <p className="font-serif text-lg font-light text-gold">
            {(v.price * item.quantity).toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 })}
          </p>
        </div>
      </div>
    </div>
  );
}
