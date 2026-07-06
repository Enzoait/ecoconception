import Link from "next/link";
import { getSession } from "@/lib/auth";
import { ShoppingCart, Crown, Library } from "lucide-react";
import NavbarClient from "./navbar-client";

export default async function Navbar() {
  const session = await getSession();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/vehicles" className="flex items-center gap-2 group">
            <Crown className="h-5 w-5 text-gold group-hover:scale-110 transition-transform" />
            <span className="font-serif text-xl font-light tracking-[0.2em] text-foreground uppercase">
              Luxe Motors
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/vehicles"
              className="text-sm font-light tracking-widest text-muted-foreground hover:text-gold transition-colors uppercase"
            >
              Véhicules
            </Link>
            {session && (
              <>
                <Link
                  href="/collection"
                  className="flex items-center gap-1.5 text-sm font-light tracking-widest text-muted-foreground hover:text-gold transition-colors uppercase"
                >
                  <Library className="h-4 w-4" />
                  Ma Collection
                </Link>
                <Link
                  href="/cart"
                  className="flex items-center gap-1.5 text-sm font-light tracking-widest text-muted-foreground hover:text-gold transition-colors uppercase"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Panier
                </Link>
              </>
            )}
          </nav>

          <NavbarClient session={session ? { name: session.name } : null} />
        </div>
      </div>
    </header>
  );
}
