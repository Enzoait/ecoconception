import Link from "next/link";
import VehicleCard from "@/components/vehicle-card";
import VehicleFilters from "@/components/vehicle-filters";
import SeedCatalogButton from "@/components/seed-catalog-button";
import { queryVehicles } from "@/lib/vehicles-repo";

interface SearchParams {
  search?: string;
  category?: string;
  sort?: string;
  minPrice?: string;
  maxPrice?: string;
  page?: string;
}

function buildQueryString(params: SearchParams, overrides: Record<string, string>) {
  const next = new URLSearchParams();
  Object.entries({ ...params, ...overrides }).forEach(([key, value]) => {
    if (value) next.set(key, value);
  });
  return next.toString();
}

export default async function VehiclesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const category = params.category ?? "all";
  const search = params.search ?? "";
  const sort = params.sort ?? "price_asc";
  const page = params.page ? Number(params.page) : 1;

  const { vehicles, total, totalPages } = await queryVehicles({
    search: search || undefined,
    category,
    sort,
    minPrice: params.minPrice ? Number(params.minPrice) : undefined,
    maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
    page,
  });

  const isFiltered = Boolean(search) || category !== "all";
  const featured = !isFiltered ? vehicles.filter(v => v.featured) : [];
  const regular = !isFiltered ? vehicles.filter(v => !v.featured) : vehicles;

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

      <VehicleFilters
        initialSearch={search}
        initialCategory={category}
        initialSort={sort}
        initialMinPrice={params.minPrice ?? ""}
        initialMaxPrice={params.maxPrice ?? ""}
      />

      {vehicles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <p className="font-serif text-2xl font-light text-muted-foreground">
            Aucun véhicule trouvé
          </p>
          {isFiltered ? (
            <Link href="/vehicles" className="mt-4 text-sm font-light text-gold underline underline-offset-2">
              Réinitialiser les filtres
            </Link>
          ) : (
            <SeedCatalogButton />
          )}
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

          <p className="mt-10 text-center text-xs font-light tracking-widest uppercase text-muted-foreground">
            {total} véhicule{total > 1 ? "s" : ""} dans la collection
          </p>

          {totalPages > 1 && (
            <nav aria-label="Pagination du catalogue" className="mt-6 flex items-center justify-center gap-4">
              {page > 1 ? (
                <Link
                  href={`/vehicles?${buildQueryString(params, { page: String(page - 1) })}`}
                  className="text-sm font-light text-gold underline underline-offset-2"
                >
                  ← Précédent
                </Link>
              ) : (
                <span className="text-sm font-light text-muted-foreground/40">← Précédent</span>
              )}
              <span className="text-xs font-light tracking-widest uppercase text-muted-foreground">
                Page {page} / {totalPages}
              </span>
              {page < totalPages ? (
                <Link
                  href={`/vehicles?${buildQueryString(params, { page: String(page + 1) })}`}
                  className="text-sm font-light text-gold underline underline-offset-2"
                >
                  Suivant →
                </Link>
              ) : (
                <span className="text-sm font-light text-muted-foreground/40">Suivant →</span>
              )}
            </nav>
          )}
        </>
      )}
    </div>
  );
}
