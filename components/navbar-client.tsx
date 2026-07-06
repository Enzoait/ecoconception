"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart, Library, LogOut, LogIn, UserPlus } from "lucide-react";

interface Props {
  session: { name: string } | null;
}

export default function NavbarClient({ session }: Props) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/auth/login");
    router.refresh();
  }

  return (
    <div className="flex items-center gap-3">
      {session ? (
        <>
          <div className="hidden md:block">
            <span className="text-sm font-light text-muted-foreground">
              Bonjour,{" "}
              <span className="text-gold font-normal">{session.name}</span>
            </span>
          </div>
          <div className="flex md:hidden items-center gap-3">
            <Link href="/cart" className="text-muted-foreground hover:text-gold transition-colors">
              <ShoppingCart className="h-5 w-5" />
            </Link>
            <Link href="/collection" className="text-muted-foreground hover:text-gold transition-colors">
              <Library className="h-5 w-5" />
            </Link>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded border border-border px-3 py-1.5 text-xs tracking-widest uppercase font-light text-muted-foreground hover:border-gold/50 hover:text-gold transition-all"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Déconnexion</span>
          </button>
        </>
      ) : (
        <div className="flex items-center gap-2">
          <Link
            href="/auth/login"
            className="flex items-center gap-1.5 text-xs tracking-widest uppercase font-light text-muted-foreground hover:text-gold transition-colors"
          >
            <LogIn className="h-3.5 w-3.5" />
            <span>Connexion</span>
          </Link>
          <Link
            href="/auth/register"
            className="flex items-center gap-1.5 rounded border border-gold/50 px-3 py-1.5 text-xs tracking-widest uppercase font-light text-gold hover:bg-gold/10 transition-all"
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Inscription</span>
          </Link>
        </div>
      )}
    </div>
  );
}
