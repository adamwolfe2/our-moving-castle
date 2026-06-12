"use client";
import { useCallback, useEffect, useState } from "react";

interface HasId {
  id: number;
}

/**
 * Generic optimistic CRUD over a REST collection (GET/POST) + item (PATCH/DELETE).
 * One source of truth per resource page.
 */
export function useCollection<T extends HasId>(endpoint: string) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch(endpoint, { cache: "no-store" });
      if (!res.ok) throw new Error((await res.json()).error || "Failed to load");
      setItems(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    load();
  }, [load]);

  const create = useCallback(
    async (data: Partial<T>) => {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const msg = (await res.json()).error || "Could not create";
        setError(msg);
        throw new Error(msg);
      }
      const created = (await res.json()) as T;
      setItems((prev) => [...prev, created]);
      return created;
    },
    [endpoint],
  );

  const update = useCallback(
    async (id: number, patch: Partial<T>) => {
      const prev = items;
      setItems((cur) => cur.map((x) => (x.id === id ? { ...x, ...patch } : x)));
      const res = await fetch(`${endpoint}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) {
        setItems(prev); // rollback
        setError((await res.json()).error || "Could not update");
        return;
      }
      const saved = (await res.json()) as T;
      setItems((cur) => cur.map((x) => (x.id === id ? saved : x)));
    },
    [endpoint, items],
  );

  const remove = useCallback(
    async (id: number) => {
      const prev = items;
      setItems((cur) => cur.filter((x) => x.id !== id));
      const res = await fetch(`${endpoint}/${id}`, { method: "DELETE" });
      if (!res.ok) {
        setItems(prev);
        setError((await res.json()).error || "Could not delete");
      }
    },
    [endpoint, items],
  );

  return { items, loading, error, create, update, remove, reload: load, setError };
}
