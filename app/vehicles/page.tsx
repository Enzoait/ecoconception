"use client";

import { useEffect, useState, useCallback } from "react";
import VehicleCard from "@/components/vehicle-card";
import type { Vehicle } from "@/lib/types";
import { Search, SlidersHorizontal, X } from "lucide-react";

type VehicleWithId = Vehicle & { _id: string };

const CATEGORIES = ["all", "Hypercar", "Supercar", "Sport", "Luxury", "Grand Tourer", "SUV"];
const SORT_OPTIONS = [
  { value: "price_asc", label: "Prix croissant" },
  { value: "price_desc", label: "Prix décroissant" },
  { value: "name_asc", label: "Marque A → Z" },
  { value: "name_desc", label: "Marque Z → A" },
];

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<VehicleWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("price_asc");
  const [showFilters, setShowFilters] = useState(false);

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ sort, category });
    if (search) params.set("search", search);
    const res = await fetch(`/api/vehicles?${params}`);
    const data = await res.json();
    setVehicles(data.vehicles ?? []);
    setLoading(false);
  }, [sort, category, search]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  async function handleSeed() {
    setSeeding(true);
    await fetch("/api/seed", { method: "POST" });
    await fetchVehicles();
    setSeeding(false);
  }

  const featured = vehicles.filter(v => v.featured);
  const regular = vehicles.filter(v => !v.featured);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-10">
        <p className="text-[11px] font-light tracking-[0.3em] uppercase text-gold mb-2">
          Collection Exclusive
        </p>
        <h1 className="font-serif text-4xl font-light tracking-wide md:text-5xl">
          Nos Véhicules
        </h1>
        <div className="mt-3 h-px w-16 bg-gold/40" />
      </div>

      {/* Search & Filter bar */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher une marque ou un modèle..."
            className="w-full rounded border border-border bg-card py-2.5 pl-10 pr-4 text-sm font-light placeholder:text-muted-foreground/50 focus:border-gold/50 focus:outline-none focus:ring-1 focus:ring-gold/30 transition-colors"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="rounded border border-border bg-card px-3 py-2.5 text-sm font-light text-foreground focus:border-gold/50 focus:outline-none transition-colors"
          >
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          <button
            onClick={() => setShowFilters(v => !v)}
            className={`flex items-center gap-1.5 rounded border px-3 py-2.5 text-sm font-light transition-colors ${showFilters ? "border-gold/50 text-gold" : "border-border text-muted-foreground hover:border-gold/30 hover:text-foreground"}`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span className="hidden sm:inline">Filtres</span>
          </button>
        </div>
      </div>

      {/* Category filters */}
      {showFilters && (
        <div className="mb-8 flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`rounded border px-4 py-1.5 text-xs font-light tracking-widest uppercase transition-all ${
                category === cat
                  ? "border-gold bg-gold/10 text-gold"
                  : "border-border text-muted-foreground hover:border-gold/30 hover:text-foreground"
              }`}
            >
              {cat === "all" ? "Tous" : cat}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-32">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gold border-t-transparent" />
        </div>
      ) : vehicles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <p className="font-serif text-2xl font-light text-muted-foreground">
            Aucun véhicule trouvé
          </p>
          {search || category !== "all" ? (
            <button
              onClick={() => { setSearch(""); setCategory("all"); }}
              className="mt-4 text-sm font-light text-gold hover:underline"
            >
              Réinitialiser les filtres
            </button>
          ) : (
            <button
              onClick={handleSeed}
              disabled={seeding}
              className="mt-6 rounded border border-gold/50 px-6 py-2.5 text-sm font-light tracking-widest uppercase text-gold hover:bg-gold/10 transition-all disabled:opacity-60"
            >
              {seeding ? "Initialisation..." : "Initialiser le catalogue"}
            </button>
          )}
        </div>
      ) : (
        <>
          {search || category !== "all" ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {vehicles.map(v => <VehicleCard key={v._id} vehicle={v} />)}
            </div>
          ) : (
            <>
              {featured.length > 0 && (
                <div className="mb-12">
                  <h2 className="mb-6 font-serif text-2xl font-light text-muted-foreground">
                    Sélection Prestige
                  </h2>
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {featured.map(v => <VehicleCard key={v._id} vehicle={v} />)}
                  </div>
                </div>
              )}
              {regular.length > 0 && (
                <div>
                  {featured.length > 0 && (
                    <h2 className="mb-6 font-serif text-2xl font-light text-muted-foreground">
                      Toute la Collection
                    </h2>
                  )}
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {regular.map(v => <VehicleCard key={v._id} vehicle={v} />)}
                  </div>
                </div>
              )}
            </>
          )}

          <p className="mt-10 text-center text-xs font-light tracking-widest uppercase text-muted-foreground">
            {vehicles.length} véhicule{vehicles.length > 1 ? "s" : ""} dans la collection
          </p>
        </>
      )}
    </div>
  );
}
