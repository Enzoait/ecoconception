"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Crown, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erreur lors de la connexion.");
      } else {
        router.push("/vehicles");
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <Crown className="mx-auto mb-4 h-8 w-8 text-gold" />
          <h1 className="font-serif text-3xl font-light tracking-wide">Connexion</h1>
          <p className="mt-2 text-sm font-light text-muted-foreground">
            Accédez à votre espace privilégié
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-[11px] font-light tracking-widest uppercase text-muted-foreground">
              Adresse email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full rounded border border-border bg-card px-4 py-2.5 text-sm font-light text-foreground placeholder:text-muted-foreground/50 focus:border-gold/50 focus:outline-none focus:ring-1 focus:ring-gold/30 transition-colors"
              placeholder="votre@email.com"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] font-light tracking-widest uppercase text-muted-foreground">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full rounded border border-border bg-card px-4 py-2.5 text-sm font-light text-foreground placeholder:text-muted-foreground/50 focus:border-gold/50 focus:outline-none focus:ring-1 focus:ring-gold/30 transition-colors"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="rounded border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm font-light text-destructive">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded bg-gold px-4 py-2.5 text-xs font-light tracking-widest uppercase text-black transition-colors hover:bg-gold-light disabled:opacity-60"
          >
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Se connecter
          </button>
        </form>

        <p className="mt-8 text-center text-sm font-light text-muted-foreground">
          Pas encore membre ?{" "}
          <Link href="/auth/register" className="text-gold hover:underline">
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}
