"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { CollectionItemPopulated, Vehicle } from "@/lib/types";
import { Library, Calendar } from "lucide-react";

type PopulatedItem = CollectionItemPopulated & { vehicle: Vehicle & { _id: string } };

export default function CollectionPage() {
  const router = useRouter();
  const [items, setItems] = useState<PopulatedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/collection")
      .then(r => {
        if (r.status === 401) { router.push("/auth/login"); return null; }
        return r.json();
      })
      .then(data => {
        if (data) { setItems(data.items ?? []); }
        setLoading(false);
      });
  }, [router]);

  const totalPaid = items.reduce((acc, item) => acc + (item.pricePaid ?? 0), 0);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gold border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-[11px] font-light tracking-[0.3em] uppercase text-gold mb-2">Mes Acquisitions</p>
          <h1 className="font-serif text-4xl font-light tracking-wide">Ma Collection</h1>
          <div className="mt-3 h-px w-16 bg-gold/40" />
        </div>
        {items.length > 0 && (
          <div className="rounded-lg border border-gold/20 bg-gold/5 px-5 py-3 text-right">
            <p className="text-[10px] font-light tracking-widest uppercase text-muted-foreground">Valeur totale</p>
            <p className="font-serif text-2xl font-light text-gold">
              {totalPaid.toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 })}
            </p>
          </div>
        )}
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <Library className="mb-4 h-12 w-12 text-muted-foreground/30" />
          <p className="font-serif text-2xl font-light text-muted-foreground">
            Votre collection est vide
          </p>
          <p className="mt-2 text-sm font-light text-muted-foreground">
            Acquérez votre premier véhicule d&apos;exception
          </p>
          <Link
            href="/vehicles"
            className="mt-6 rounded border border-gold/50 px-6 py-2.5 text-sm font-light tracking-widest uppercase text-gold hover:bg-gold/10 transition-all"
          >
            Découvrir nos véhicules
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, idx) => {
            const v = item.vehicle;
            if (!v) return null;
            const imageSrc = v.images?.[0] ?? `https://picsum.photos/seed/${v.brand}-${v.model}/800/450`;
            const purchaseDate = item.purchasedAt
              ? new Date(item.purchasedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
              : null;

            return (
              <div key={idx} className="card-luxury group">
                <div className="relative aspect-[16/9] overflow-hidden bg-muted">
                  <Image
                    src={imageSrc}
                    alt={`${v.brand} ${v.model}`}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3">
                    <span className="inline-block rounded border border-gold/40 bg-gold/20 px-2 py-0.5 text-[10px] font-light tracking-widest uppercase text-gold">
                      Acquis
                    </span>
                  </div>
                  {item.quantity > 1 && (
                    <div className="absolute top-3 right-3">
                      <span className="inline-block rounded-full bg-black/60 backdrop-blur px-2 py-0.5 text-xs font-light text-foreground">
                        ×{item.quantity}
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <p className="text-[11px] font-light tracking-[0.2em] uppercase text-muted-foreground">
                    {v.brand}
                  </p>
                  <h3 className="font-serif text-xl font-light leading-tight text-foreground">
                    {v.model}
                  </h3>

                  <div className="mt-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-light tracking-widest uppercase text-muted-foreground">
                        Prix payé
                      </span>
                      <span className="font-serif text-lg font-light text-gold">
                        {item.pricePaid.toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 })}
                      </span>
                    </div>
                    {purchaseDate && (
                      <div className="flex items-center gap-1.5 text-[10px] font-light text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>Acquis le {purchaseDate}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {items.length > 0 && (
        <div className="mt-12 flex justify-center">
          <Link
            href="/vehicles"
            className="rounded border border-gold/50 px-6 py-2.5 text-sm font-light tracking-widest uppercase text-gold hover:bg-gold/10 transition-all"
          >
            Enrichir ma collection
          </Link>
        </div>
      )}
    </div>
  );
}
