"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { CartItemPopulated, Vehicle } from "@/lib/types";
import { Trash2, ShoppingBag, Loader2, CreditCard } from "lucide-react";

type PopulatedItem = CartItemPopulated & { vehicle: Vehicle & { _id: string } };

export default function CartPage() {
  const router = useRouter();
  const [items, setItems] = useState<PopulatedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const [feedback, setFeedback] = useState("");

  async function fetchCart() {
    const res = await fetch("/api/cart");
    if (res.status === 401) { router.push("/auth/login"); return; }
    const data = await res.json();
    setItems(data.items ?? []);
    setLoading(false);
  }

  useEffect(() => { fetchCart(); }, []);

  async function updateQuantity(vehicleId: string, quantity: number) {
    await fetch("/api/cart", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vehicleId, quantity }),
    });
    fetchCart();
  }

  async function removeItem(vehicleId: string) {
    await fetch(`/api/cart?vehicleId=${vehicleId}`, { method: "DELETE" });
    fetchCart();
  }

  async function handleCheckout() {
    setCheckingOut(true);
    setFeedback("");
    const res = await fetch("/api/cart/checkout", { method: "POST" });
    if (res.ok) {
      setFeedback("Paiement validé ! Véhicules ajoutés à votre collection.");
      setTimeout(() => router.push("/collection"), 1800);
    } else {
      const data = await res.json();
      setFeedback(data.error || "Erreur lors du paiement.");
      setCheckingOut(false);
    }
  }

  const total = items.reduce((acc, item) => acc + (item.vehicle?.price ?? 0) * item.quantity, 0);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gold border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-10">
        <p className="text-[11px] font-light tracking-[0.3em] uppercase text-gold mb-2">Mon Panier</p>
        <h1 className="font-serif text-4xl font-light tracking-wide">Sélection</h1>
        <div className="mt-3 h-px w-16 bg-gold/40" />
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <ShoppingBag className="mb-4 h-12 w-12 text-muted-foreground/30" />
          <p className="font-serif text-2xl font-light text-muted-foreground">Votre panier est vide</p>
          <Link href="/vehicles" className="mt-6 rounded border border-gold/50 px-6 py-2.5 text-sm font-light tracking-widest uppercase text-gold hover:bg-gold/10 transition-all">
            Découvrir nos véhicules
          </Link>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            {items.map(item => {
              const v = item.vehicle;
              if (!v) return null;
              const imageSrc = v.images?.[0] ?? `https://picsum.photos/seed/${v.brand}-${v.model}/400/225`;
              return (
                <div key={item.vehicleId} className="flex gap-4 rounded-lg border border-border bg-card p-4">
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
                        onClick={() => removeItem(item.vehicleId)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center rounded border border-border">
                        <button onClick={() => updateQuantity(item.vehicleId, item.quantity - 1)} className="px-2.5 py-1 text-muted-foreground hover:text-foreground transition-colors text-sm">−</button>
                        <span className="min-w-[2rem] text-center text-sm font-light">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.vehicleId, item.quantity + 1)} className="px-2.5 py-1 text-muted-foreground hover:text-foreground transition-colors text-sm">+</button>
                      </div>
                      <p className="font-serif text-lg font-light text-gold">
                        {(v.price * item.quantity).toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 })}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-lg border border-border bg-card p-6">
              <h2 className="font-serif text-xl font-light mb-6">Récapitulatif</h2>
              <div className="space-y-3 mb-6">
                {items.map(item => item.vehicle && (
                  <div key={item.vehicleId} className="flex justify-between text-sm font-light">
                    <span className="text-muted-foreground">{item.vehicle.brand} {item.vehicle.model} ×{item.quantity}</span>
                    <span>{(item.vehicle.price * item.quantity).toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 })}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border pt-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-light tracking-widest uppercase text-muted-foreground">Total</span>
                  <span className="font-serif text-2xl font-light text-gold">
                    {total.toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 })}
                  </span>
                </div>
              </div>

              {feedback && (
                <p className={`mb-4 rounded border px-3 py-2 text-sm font-light ${
                  feedback.includes("validé")
                    ? "border-gold/30 bg-gold/10 text-gold"
                    : "border-destructive/30 bg-destructive/10 text-destructive"
                }`}>
                  {feedback}
                </p>
              )}

              <button
                onClick={handleCheckout}
                disabled={checkingOut}
                className="flex w-full items-center justify-center gap-2 rounded bg-gold px-4 py-3 text-sm font-light tracking-widest uppercase text-black transition-colors hover:bg-gold-light disabled:opacity-60"
              >
                {checkingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                Valider & Payer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
