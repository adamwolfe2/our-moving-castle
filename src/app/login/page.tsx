"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Flame, Loader2 } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/app";
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (res.ok) {
      router.push(next);
      router.refresh();
    } else {
      setError("That's not the magic word.");
      setPassword("");
    }
  }

  return (
    <main
      className="flex min-h-screen items-center justify-center px-6"
      style={{ cursor: "auto" }}
    >
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-walnut">
            <Flame size={26} className="text-terracotta" />
          </div>
          <h1 className="font-serif text-3xl text-walnut">Our Moving Castle</h1>
          <p className="mt-1 text-sm text-dust">
            The move-in command center. For Adam & Melodi.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <input
            type="password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full rounded-xl border border-walnut/15 bg-white/80 px-4 py-3 text-center text-walnut outline-none transition placeholder:text-dust focus:border-terracotta/50 focus:ring-2 focus:ring-terracotta/15"
          />
          {error && (
            <p className="text-center text-sm text-terracotta">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading || !password}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-walnut px-4 py-3 text-cream transition hover:bg-walnut-soft disabled:opacity-50"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            Enter
          </button>
        </form>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
