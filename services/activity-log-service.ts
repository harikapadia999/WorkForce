"use client";

import { addDoc, collection } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import type {
  ActivityAction,
  ActivityLog,
  ActivityDiffEntry,
  ActivityResource,
} from "@/types/activity-log";

// Choose where to store logs:
// - "dual": write to /activity_logs and /users/{uid}/activity_logs
// - "global-only": write only to /activity_logs
// - "per-user-only": write only to /users/{uid}/activity_logs (if userId available)
const LOG_STRATEGY: "dual" | "global-only" | "per-user-only" = "dual";

const SESSION_KEY = "emp_session_id";

function generateId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto)
    return crypto.randomUUID();
  return `${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

export function getSessionId(): string {
  if (typeof window === "undefined") return "server";
  let sid = window.localStorage.getItem(SESSION_KEY);
  if (!sid) {
    sid = generateId();
    window.localStorage.setItem(SESSION_KEY, sid);
  }
  return sid;
}

// Deep diff of JSON-safe structures
export function diffObjects(
  beforeVal: unknown,
  afterVal: unknown,
  basePath = ""
): ActivityDiffEntry[] {
  const diffs: ActivityDiffEntry[] = [];
  const isObj = (v: unknown) =>
    v !== null && typeof v === "object" && !Array.isArray(v);
  const isArr = (v: unknown) => Array.isArray(v);

  if (
    !isObj(beforeVal) &&
    !isArr(beforeVal) &&
    !isObj(afterVal) &&
    !isArr(afterVal)
  ) {
    if (beforeVal !== afterVal)
      diffs.push({ path: basePath || "/", before: beforeVal, after: afterVal });
    return diffs;
  }

  if (isArr(beforeVal) && isArr(afterVal)) {
    const b = beforeVal as unknown[];
    const a = afterVal as unknown[];
    const maxLen = Math.max(b.length, a.length);
    for (let i = 0; i < maxLen; i++) {
      const childPath = `${basePath}/${i}`;
      if (i >= b.length)
        diffs.push({ path: childPath, before: undefined, after: a[i] });
      else if (i >= a.length)
        diffs.push({ path: childPath, before: b[i], after: undefined });
      else diffs.push(...diffObjects(b[i], a[i], childPath));
    }
    return diffs;
  }

  if (isObj(beforeVal) && isObj(afterVal)) {
    const b = beforeVal as Record<string, unknown>;
    const a = afterVal as Record<string, unknown>;
    const keys = new Set([...Object.keys(b), ...Object.keys(a)]);
    for (const k of keys) {
      const childPath = basePath ? `${basePath}/${k}` : `/${k}`;
      if (!(k in b))
        diffs.push({ path: childPath, before: undefined, after: a[k] });
      else if (!(k in a))
        diffs.push({ path: childPath, before: b[k], after: undefined });
      else diffs.push(...diffObjects(b[k], a[k], childPath));
    }
    return diffs;
  }

  if (beforeVal !== afterVal)
    diffs.push({ path: basePath || "/", before: beforeVal, after: afterVal });
  return diffs;
}

// Trim large payloads to keep documents reasonable in size
function clampPayload<T>(val: T): T {
  try {
    const str = JSON.stringify(val);
    const max = 8 * 1024; // ~8KB
    if (str.length > max) {
      const head = str.slice(0, max);
      return JSON.parse(head) as T;
    }
  } catch {
    // ignore JSON errors
  }
  return val;
}

async function writeLog(entry: ActivityLog) {
  if (!db) return;
  const writes: Promise<unknown>[] = [];

  const userId = entry.userId ?? null;
  const canWriteUser = !!userId;

  if (LOG_STRATEGY === "dual" || LOG_STRATEGY === "global-only") {
    writes.push(addDoc(collection(db, "activity_logs"), entry as any));
  }
  if (
    (LOG_STRATEGY === "dual" || LOG_STRATEGY === "per-user-only") &&
    canWriteUser
  ) {
    writes.push(
      addDoc(
        collection(db, "users", userId as string, "activity_logs"),
        entry as any
      )
    );
  }

  await Promise.all(writes);
}

export async function logActivity(params: {
  action: ActivityAction;
  resourceType: ActivityResource;
  resourceId?: string;
  activityName?: string;
  before?: unknown;
  after?: unknown;
  metadata?: Record<string, unknown>;
}) {
  try {
    if (!db) return;

    const now = Date.now();
    const user = auth?.currentUser || null;
    const entry: ActivityLog = {
      action: params.action,
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      activityName: params.activityName,
      timestampIso: new Date(now).toISOString(),
      timestampMs: now,
      userId: user?.uid ?? null,
      userEmail: user?.email ?? null,
      userName: user?.displayName ?? user?.email ?? null,
      sessionId: getSessionId(),
      before: params.before ? clampPayload(params.before) : undefined,
      after: params.after ? clampPayload(params.after) : undefined,
      metadata: params.metadata,
    };

    if (params.before !== undefined && params.after !== undefined) {
      entry.diff = diffObjects(params.before, params.after);
      if (entry.diff.length > 2000) entry.diff = entry.diff.slice(0, 2000);
    }

    await writeLog(entry);
  } catch (e) {
    console.warn("Activity logging failed:", e);
  }
}

// Convenience helpers
export async function logEmployeeCreate(after: unknown, id?: string) {
  return logActivity({
    action: "Create",
    resourceType: "employee",
    resourceId: id,
    after,
  });
}
export async function logEmployeeUpdate(
  before: unknown,
  after: unknown,
  id?: string,
  metadata?: Record<string, unknown>
) {
  return logActivity({
    action: "Update",
    resourceType: "employee",
    resourceId: id,
    before,
    after,
    metadata,
  });
}
export async function logEmployeeDelete(before: unknown, id?: string) {
  return logActivity({
    action: "Delete",
    resourceType: "employee",
    resourceId: id,
    before,
  });
}
export async function logView(
  name: string,
  metadata?: Record<string, unknown>
) {
  return logActivity({
    action: "View",
    resourceType: "dialog",
    activityName: name,
    metadata,
  });
}
export async function logAuth(
  action: "Login" | "Logout",
  metadata?: Record<string, unknown>
) {
  return logActivity({ action, resourceType: "auth", metadata });
}
