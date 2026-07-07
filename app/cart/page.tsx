import Link from "next/link";
import { redirect } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import { getSession } from "@/lib/auth";
import { getCartWithVehicles } from "@/lib/vehicles-repo";
import CartItemRow from "@/components/cart-item-row";
import CheckoutPanel from "@/components/checkout-panel";

export default async function CartPage() {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const items = await getCartWithVehicles(session.sub);
  const total = items.reduce((acc, item) => acc + (item.vehicle?.price ?? 0) * item.quantity, 0);

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
            {items.map(item => item.vehicle && (
              <CartItemRow key={item.vehicleId} item={{ ...item, vehicle: item.vehicle }} />
            ))}
          </div>

          <div className="lg:col-span-1">
            <CheckoutPanel items={items.filter(i => i.vehicle).map(i => ({ ...i, vehicle: i.vehicle! }))} total={total} />
          </div>
        </div>
      )}
    </div>
  );
}
