"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const CATEGORIES = ["all", "Hypercar", "Supercar", "Sport", "Luxury", "Grand Tourer", "SUV"];
const SORT_OPTIONS = [
  { value: "price_asc", label: "Prix croissant" },
  { value: "price_desc", label: "Prix décroissant" },
  { value: "name_asc", label: "Marque A → Z" },
  { value: "name_desc", label: "Marque Z → A" },
];

interface Props {
  initialSearch: string;
  initialCategory: string;
  initialSort: string;
  initialMinPrice: string;
  initialMaxPrice: string;
}

export default function VehicleFilters({
  initialSearch,
  initialCategory,
  initialSort,
  initialMinPrice,
  initialMaxPrice,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const [search, setSearch] = useState(initialSearch);
  const [minPrice, setMinPrice] = useState(initialMinPrice);
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice);
  const [showFilters, setShowFilters] = useState(initialCategory !== "all" || Boolean(initialMinPrice || initialMaxPrice));

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const next = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value) next.set(key, value);
        else next.delete(key);
      });
      next.delete("page");
      startTransition(() => {
        router.push(`${pathname}?${next.toString()}`);
      });
    },
    [pathname, router, searchParams]
  );

  // Debounce : on n'interroge la base qu'après une pause de frappe, pas à chaque caractère.
  useEffect(() => {
    if (search === initialSearch) return;
    const handle = setTimeout(() => updateParams({ search }), 350);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  useEffect(() => {
    if (minPrice === initialMinPrice && maxPrice === initialMaxPrice) return;
    const handle = setTimeout(() => updateParams({ minPrice, maxPrice }), 350);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minPrice, maxPrice]);

  return (
    <>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher une marque ou un modèle..."
            aria-label="Rechercher une marque ou un modèle"
            className="w-full rounded border border-border bg-card py-2.5 pl-10 pr-4 text-sm font-light placeholder:text-muted-foreground/50 focus:border-gold/50 focus:outline-none focus:ring-1 focus:ring-gold/30 transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              aria-label="Effacer la recherche"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <select
            value={initialSort}
            onChange={e => updateParams({ sort: e.target.value })}
            aria-label="Trier les véhicules"
            className="rounded border border-border bg-card px-3 py-2.5 text-sm font-light text-foreground focus:border-gold/50 focus:outline-none transition-colors"
          >
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          <Button
            type="button"
            variant={showFilters ? "subtle-active" : "subtle"}
            size="luxury-sm"
            onClick={() => setShowFilters(v => !v)}
            aria-expanded={showFilters}
            aria-label="Afficher ou masquer les filtres"
            className="gap-1.5"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span className="hidden sm:inline">Filtres</span>
          </Button>
        </div>
      </div>

      {showFilters && (
        <div className="mb-8 space-y-4">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <Button
                key={cat}
                type="button"
                variant={initialCategory === cat ? "subtle-active" : "subtle"}
                size="luxury-sm"
                onClick={() => updateParams({ category: cat === "all" ? "" : cat })}
              >
                {cat === "all" ? "Tous" : cat}
              </Button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="text-[11px] font-light tracking-widest uppercase text-muted-foreground" htmlFor="minPrice">
              Prix min
            </label>
            <input
              id="minPrice"
              type="number"
              min={0}
              value={minPrice}
              onChange={e => setMinPrice(e.target.value)}
              placeholder="0"
              className="w-32 rounded border border-border bg-card px-3 py-1.5 text-sm font-light text-foreground focus:border-gold/50 focus:outline-none transition-colors"
            />
            <label className="text-[11px] font-light tracking-widest uppercase text-muted-foreground" htmlFor="maxPrice">
              Prix max
            </label>
            <input
              id="maxPrice"
              type="number"
              min={0}
              value={maxPrice}
              onChange={e => setMaxPrice(e.target.value)}
              placeholder="Sans limite"
              className="w-36 rounded border border-border bg-card px-3 py-1.5 text-sm font-light text-foreground focus:border-gold/50 focus:outline-none transition-colors"
            />
          </div>
        </div>
      )}
    </>
  );
}
