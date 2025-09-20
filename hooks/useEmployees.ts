"use client";

import { useEffect, useMemo, useState } from "react";
import type { Employee } from "@/types/employee";
import { processAdvanceCarryForward } from "@/utils/salary-calculator";
import { useAuth } from "@/contexts/auth-context";
import { db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  updateDoc,
  where,
  serverTimestamp,
} from "firebase/firestore";
import {
  logEmployeeCreate,
  logEmployeeDelete,
  logEmployeeUpdate,
} from "@/services/activity-log-service";

// Add a deepClean function to strip undefined values from objects/arrays recursively.
function deepClean<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((v) => deepClean(v)) as unknown as T;
  }
  if (value !== null && typeof value === "object") {
    const out: Record<string, any> = {};
    Object.entries(value as Record<string, any>).forEach(([k, v]) => {
      if (v !== undefined) {
        out[k] = deepClean(v);
      }
    });
    return out as T;
  }
  return value;
}

export function useEmployees() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const userId = user?.uid;

  // Subscribe to Firestore in real-time
  useEffect(() => {
    if (!db || !userId) {
      setEmployees([]);
      setLoading(false);
      return;
    }

    const q = query(collection(db, "employees"), where("userId", "==", userId));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const list: Employee[] = [];
        snap.forEach((d) => {
          const data = d.data() as Employee;
          list.push({ ...data, id: d.id });
        });
        // Sort by createdAt desc client-side to mimic the previous orderBy
        list.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setEmployees(list);
        setLoading(false);
        maybeProcessCarryForward(list);
      },
      (err) => {
        console.error("Firestore employees subscription error:", err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [userId]);

  // One-time carry-forward processor (per month)
  const maybeProcessCarryForward = async (list: Employee[]) => {
    if (!db || !userId) return;
    const currentMonthYear = new Date().toISOString().slice(0, 7);
    const updates: Array<Promise<void>> = [];

    for (const emp of list) {
      if (emp.lastAdvanceProcessedMonth !== currentMonthYear) {
        const updated = processAdvanceCarryForward(emp);
        updates.push(
          updateDoc(doc(db, "employees", emp.id), {
            ...updated,
            lastAdvanceProcessedMonth: currentMonthYear,
            updatedAt: new Date().toISOString(),
          } as any)
        );
      }
    }

    if (updates.length) {
      try {
        await Promise.all(updates);
      } catch (e) {
        console.error("Error processing carry-forward advances:", e);
      }
    }
  };

  const addEmployee = async (
    employee: Omit<Employee, "id" | "createdAt" | "updatedAt">
  ) => {
    if (!db || !userId) return null;
    try {
      const cleanEmployee = deepClean(employee);
      const docRef = await addDoc(collection(db, "employees"), {
        ...cleanEmployee,
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        _createdTs: serverTimestamp(),
      } as any);
      const afterEmployee = {
        ...cleanEmployee,
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        id: docRef.id,
      } as Employee;
      await logEmployeeCreate(afterEmployee, docRef.id);
      return afterEmployee;
    } catch (e) {
      console.error("addEmployee error:", e);
      return null;
    }
  };

  const updateEmployee = async (id: string, updates: Partial<Employee>) => {
    if (!db || !userId) return;
    try {
      const cleanUpdates = deepClean(updates);
      const before = employees.find((e) => e.id === id);
      const after = before
        ? { ...before, ...cleanUpdates, updatedAt: new Date().toISOString() }
        : undefined;
      await updateDoc(doc(db, "employees", id), {
        ...cleanUpdates,
        updatedAt: new Date().toISOString(),
        _updatedTs: serverTimestamp(),
      } as any);
      await logEmployeeUpdate(before, after, id, {
        fieldsUpdated: Object.keys(cleanUpdates || {}),
      });
    } catch (e) {
      console.error("updateEmployee error:", e);
    }
  };

  const deleteEmployee = async (id: string) => {
    if (!db || !userId) return;
    try {
      const before = employees.find((e) => e.id === id);
      await deleteDoc(doc(db, "employees", id));
      await logEmployeeDelete(before, id);
    } catch (e) {
      console.error("deleteEmployee error:", e);
    }
  };

  const getEmployee = useMemo(
    () => (id: string) => employees.find((emp) => emp.id === id),
    [employees]
  );

  return {
    employees,
    loading,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    getEmployee,
  };
}
