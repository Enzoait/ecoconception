import Image from "next/image";
import Link from "next/link";
import type { Vehicle } from "@/lib/types";

interface Props {
  vehicle: Vehicle & { _id: string };
}

const CATEGORY_COLORS: Record<string, string> = {
  Hypercar: "text-red-400 border-red-400/30 bg-red-400/10",
  Supercar: "text-orange-400 border-orange-400/30 bg-orange-400/10",
  Sport: "text-blue-400 border-blue-400/30 bg-blue-400/10",
  Luxury: "text-purple-400 border-purple-400/30 bg-purple-400/10",
  "Grand Tourer": "text-gold border-gold/30 bg-gold/10",
  SUV: "text-green-400 border-green-400/30 bg-green-400/10",
};

export default function VehicleCard({ vehicle }: Props) {
  const categoryClass = CATEGORY_COLORS[vehicle.category] ?? "text-silver border-silver/30 bg-silver/10";
  const imageSrc = vehicle.images?.[0] ?? `https://picsum.photos/seed/${vehicle.brand}-${vehicle.model}/800/450`;

  return (
    <Link href={`/vehicles/${vehicle._id}`} className="group block">
      <div className="card-luxury">
        <div className="relative aspect-[16/9] overflow-hidden bg-muted">
          <Image
            src={imageSrc}
            alt={`${vehicle.brand} ${vehicle.model}`}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-3 left-3">
            <span className={`inline-block rounded border px-2 py-0.5 text-[10px] font-light tracking-widest uppercase ${categoryClass}`}>
              {vehicle.category}
            </span>
          </div>
        </div>

        <div className="p-4">
          <div className="mb-1 flex items-start justify-between gap-2">
            <div>
              <p className="text-[11px] font-light tracking-[0.2em] uppercase text-muted-foreground">
                {vehicle.brand}
              </p>
              <h3 className="font-serif text-lg font-light leading-tight text-foreground group-hover:text-gold transition-colors">
                {vehicle.model}
              </h3>
            </div>
            <p className="text-xs font-light text-muted-foreground mt-0.5 shrink-0">{vehicle.year}</p>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <p className="font-serif text-xl font-light text-gold">
              {vehicle.price.toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 })}
            </p>
            <p className="text-[10px] font-light tracking-widest uppercase text-muted-foreground">
              {vehicle.specs.power}
            </p>
          </div>

          {vehicle.stock <= 2 && vehicle.stock > 0 && (
            <p className="mt-2 text-[10px] font-light tracking-wider text-red-400 uppercase">
              Derniers exemplaires — {vehicle.stock} disponible{vehicle.stock > 1 ? "s" : ""}
            </p>
          )}
          {vehicle.stock === 0 && (
            <p className="mt-2 text-[10px] font-light tracking-wider text-muted-foreground uppercase">
              Épuisé
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
