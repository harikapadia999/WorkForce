"use client";

import { useEffect, useMemo, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import type { Item } from "@/types/item";
import { makeItemId } from "@/types/item";
import type { UnitType } from "@/types/employee";
import { logActivity } from "@/services/activity-log-service";

export function useItems() {
  const { user } = useAuth();
  const userId = user?.uid;
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!db || !userId) {
      setItems([]);
      setLoading(false);
      return;
    }
    const colRef = collection(db, "users", userId, "item_catalog");
    const unsub = onSnapshot(
      colRef,
      (snap) => {
        const list: Item[] = [];
        snap.forEach((d) => {
          const data = d.data() as Item;
          list.push({ ...data, id: d.id });
        });
        // Sort newest first by updatedAt
        list.sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
        setItems(list);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("useItems subscription error:", err);
        setError(err?.message || "Failed to subscribe to items");
        setLoading(false);
      }
    );
    return () => unsub();
  }, [userId]);

  const addOrUpdateItem = async (
    data: Omit<Item, "id" | "userId" | "createdAt" | "updatedAt"> & {
      id?: string;
    }
  ) => {
    if (!db || !userId) throw new Error("Not authenticated");
    const nowIso = new Date().toISOString();
    const id = data.id || makeItemId(data.name, data.unit);
    const docRef = doc(db, "users", userId, "item_catalog", id);

    // merge: create if not exists, update if exists
    const payload: Item = {
      id,
      userId,
      name: data.name.trim(),
      unit: data.unit,
      rate: Number(data.rate) || 0,
      tags: data.tags || [],
      archived: !!data.archived,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    await setDoc(
      docRef,
      {
        ...payload,
        _createdTs: serverTimestamp(),
        _updatedTs: serverTimestamp(),
      } as any,
      { merge: true }
    );

    await logActivity({
      action: "Update",
      resourceType: "item",
      resourceId: id,
      after: payload,
    });
    return id;
  };

  const updateItem = async (id: string, updates: Partial<Item>) => {
    if (!db || !userId) throw new Error("Not authenticated");
    const nowIso = new Date().toISOString();
    const docRef = doc(db, "users", userId, "item_catalog", id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: nowIso,
      _updatedTs: serverTimestamp(),
    } as any);
    await logActivity({
      action: "Update",
      resourceType: "item",
      resourceId: id,
      after: { id, ...updates },
    });
  };

  const deleteItem = async (id: string) => {
    if (!db || !userId) throw new Error("Not authenticated");
    await deleteDoc(doc(db, "users", userId, "item_catalog", id));
    await logActivity({
      action: "Delete",
      resourceType: "item",
      resourceId: id,
    });
  };

  type BulkRow = {
    name: string;
    unit: UnitType;
    rate: number;
    tags?: string[];
  };
  const bulkUpsert = async (rows: BulkRow[]) => {
    const results: { id: string; ok: boolean; error?: string }[] = [];
    for (const r of rows) {
      try {
        const id = makeItemId(r.name, r.unit);
        await addOrUpdateItem({
          id,
          name: r.name,
          unit: r.unit,
          rate: r.rate,
          tags: r.tags || [],
        });
        results.push({ id, ok: true });
      } catch (e: any) {
        results.push({
          id: makeItemId(r.name, r.unit),
          ok: false,
          error: e?.message || "Unknown error",
        });
      }
    }
    return results;
  };

  return {
    items,
    loading,
    error,
    addOrUpdateItem,
    updateItem,
    deleteItem,
    bulkUpsert,
  };
}

export function useItemsSearch(
  items: Item[],
  opts: { query: string; unit: "all" | UnitType; sort: string }
): Item[] {
  const { query, unit, sort } = opts;
  return useMemo(() => {
    let out = items;
    if (unit !== "all") {
      out = out.filter((i) => i.unit === unit);
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      out = out.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          (i.tags || []).some((t) => t.toLowerCase().includes(q))
      );
    }
    const sorters: Record<string, (a: Item, b: Item) => number> = {
      "updated-desc": (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      "updated-asc": (a, b) =>
        new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
      "name-asc": (a, b) => a.name.localeCompare(b.name),
      "name-desc": (a, b) => b.name.localeCompare(a.name),
      "rate-asc": (a, b) => a.rate - b.rate,
      "rate-desc": (a, b) => b.rate - a.rate,
    };
    const sorter = sorters[sort] || sorters["updated-desc"];
    return [...out].sort(sorter);
  }, [items, query, unit, sort]);
}
