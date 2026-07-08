"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CartItemPopulated, Vehicle } from "@/lib/types";

type PopulatedItem = CartItemPopulated & { vehicle: Vehicle & { _id: string } };

interface Props {
  items: PopulatedItem[];
  total: number;
}

export default function CheckoutPanel({ items, total }: Props) {
  const router = useRouter();
  const [checkingOut, setCheckingOut] = useState(false);
  const [feedback, setFeedback] = useState("");

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

  return (
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

      <Button
        variant="gold"
        size="luxury"
        onClick={handleCheckout}
        disabled={checkingOut}
        className="flex w-full items-center justify-center gap-2"
      >
        {checkingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
        Valider & Payer
      </Button>
    </div>
  );
}
