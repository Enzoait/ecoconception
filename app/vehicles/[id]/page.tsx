"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { Vehicle } from "@/lib/types";
import { ShoppingCart, ChevronLeft, Loader2, Zap, Gauge, Clock, Cog } from "lucide-react";
import Link from "next/link";

type VehicleWithId = Vehicle & { _id: string };

export default function VehicleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [vehicle, setVehicle] = useState<VehicleWithId | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  useEffect(() => {
    fetch(`/api/vehicles/${params.id}`)
      .then(r => r.json())
      .then(d => { setVehicle(d.vehicle); setLoading(false); });
  }, [params.id]);

  async function handleAddToCart() {
    setAdding(true);
    setFeedback(null);
    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vehicleId: vehicle!._id, quantity }),
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

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gold border-t-transparent" />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <p className="font-serif text-2xl font-light text-muted-foreground">Véhicule introuvable</p>
        <Link href="/vehicles" className="mt-4 text-sm font-light text-gold hover:underline">
          Retour à la collection
        </Link>
      </div>
    );
  }

  const imageSrc = vehicle.images?.[0] ?? `https://picsum.photos/seed/${vehicle.brand}-${vehicle.model}/1200/675`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link href="/vehicles" className="mb-8 inline-flex items-center gap-1.5 text-sm font-light text-muted-foreground hover:text-gold transition-colors">
        <ChevronLeft className="h-4 w-4" />
        Retour à la collection
      </Link>

      <div className="grid gap-12 lg:grid-cols-2">
        {/* Image */}
        <div>
          <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-muted">
            <Image
              src={imageSrc}
              alt={`${vehicle.brand} ${vehicle.model}`}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>

        {/* Details */}
        <div className="flex flex-col">
          <p className="text-[11px] font-light tracking-[0.3em] uppercase text-gold">
            {vehicle.category} · {vehicle.year}
          </p>
          <h1 className="mt-2 font-serif text-4xl font-light tracking-wide lg:text-5xl">
            {vehicle.brand}
          </h1>
          <h2 className="font-serif text-3xl font-light text-muted-foreground lg:text-4xl">
            {vehicle.model}
          </h2>

          <div className="mt-6 border-y border-border py-6">
            <p className="font-serif text-4xl font-light text-gold">
              {vehicle.price.toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 })}
            </p>
            {vehicle.stock > 0 ? (
              <p className="mt-1.5 text-xs font-light tracking-widest uppercase text-muted-foreground">
                {vehicle.stock <= 3
                  ? `⚠ Derniers exemplaires — ${vehicle.stock} disponible${vehicle.stock > 1 ? "s" : ""}`
                  : `${vehicle.stock} exemplaires disponibles`}
              </p>
            ) : (
              <p className="mt-1.5 text-xs font-light tracking-widest uppercase text-red-400">
                Épuisé
              </p>
            )}
          </div>

          <p className="mt-6 text-sm font-light leading-relaxed text-muted-foreground">
            {vehicle.description}
          </p>

          {/* Specs grid */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            {[
              { icon: Zap, label: "Puissance", value: vehicle.specs.power },
              { icon: Gauge, label: "Vitesse max", value: vehicle.specs.topSpeed },
              { icon: Clock, label: "0 à 100", value: vehicle.specs.acceleration },
              { icon: Cog, label: "Moteur", value: vehicle.specs.engine },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded border border-border bg-card p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon className="h-3.5 w-3.5 text-gold" />
                  <p className="text-[10px] font-light tracking-widest uppercase text-muted-foreground">{label}</p>
                </div>
                <p className="text-sm font-light text-foreground">{value}</p>
              </div>
            ))}
          </div>

          {/* Add to cart */}
          {vehicle.stock > 0 && (
            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-4">
                <label className="text-[11px] font-light tracking-widest uppercase text-muted-foreground">
                  Quantité
                </label>
                <div className="flex items-center rounded border border-border">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="px-3 py-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    −
                  </button>
                  <span className="min-w-[2.5rem] text-center text-sm font-light">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => Math.min(vehicle.stock, q + 1))}
                    className="px-3 py-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={adding}
                className="flex w-full items-center justify-center gap-2 rounded bg-gold px-6 py-3 text-sm font-light tracking-widest uppercase text-black transition-colors hover:bg-gold-light disabled:opacity-60"
              >
                {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingCart className="h-4 w-4" />}
                Ajouter au panier
              </button>

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
          )}
        </div>
      </div>
    </div>
  );
}
