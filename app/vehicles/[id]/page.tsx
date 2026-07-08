import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, Zap, Gauge, Clock, Cog } from "lucide-react";
import { getVehicleById } from "@/lib/vehicles-repo";
import AddToCartForm from "@/components/add-to-cart-form";

export default async function VehicleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const vehicle = await getVehicleById(id);

  if (!vehicle) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <p className="font-serif text-2xl font-light text-muted-foreground">Véhicule introuvable</p>
        <Link href="/vehicles" className="mt-4 text-sm font-light text-gold underline underline-offset-2">
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

          <AddToCartForm vehicleId={vehicle._id} stock={vehicle.stock} />
        </div>
      </div>
    </div>
  );
}

export const revalidate = 60;
