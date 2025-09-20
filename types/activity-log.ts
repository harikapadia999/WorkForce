export type ActivityAction =
  | "Create"
  | "Update"
  | "Delete"
  | "View"
  | "Login"
  | "Logout";

export type ActivityResource =
  | "employee"
  | "workRecord"
  | "advance"
  | "auth"
  | "dialog"
  | string; // allow future extensibility

export interface ActivityDiffEntry {
  path: string;
  before: unknown;
  after: unknown;
}

export interface ActivityLog {
  // who/when
  userId: string | null;
  userEmail: string | null;
  userName: string | null;
  sessionId: string | null;
  timestampIso: string;
  timestampMs: number;

  // what
  action: ActivityAction;
  resourceType: ActivityResource;
  resourceId?: string;
  activityName?: string;

  // context
  before?: unknown;
  after?: unknown;
  diff?: ActivityDiffEntry[];
  metadata?: Record<string, unknown>;
}
