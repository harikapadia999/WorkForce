"use client";

import { useEffect, useMemo, useState } from "react";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type {
  ActivityLog,
  ActivityAction,
  ActivityResource,
} from "@/types/activity-log";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, RefreshCw } from "lucide-react";

const ACTIONS: ActivityAction[] = [
  "Create",
  "Update",
  "Delete",
  "View",
  "Login",
  "Logout",
];
const RESOURCES: ActivityResource[] = [
  "employee",
  "workRecord",
  "advance",
  "dialog",
  "auth",
];

function toCsv(rows: ActivityLog[]): string {
  const header = [
    "timestampIso",
    "action",
    "resourceType",
    "resourceId",
    "activityName",
    "userId",
    "userEmail",
    "userName",
    "sessionId",
  ];
  const lines = [header.join(",")];
  for (const r of rows) {
    const vals = [
      r.timestampIso,
      r.action,
      r.resourceType,
      r.resourceId || "",
      r.activityName || "",
      r.userId || "",
      r.userEmail || "",
      r.userName || "",
      r.sessionId || "",
    ].map((v) => `"${String(v).replace(/"/g, '""')}"`);
    lines.push(vals.join(","));
  }
  return lines.join("\n");
}

export default function ActivityLogViewer() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastDoc, setLastDoc] = useState<any>(null);

  // Filters (client-side for simplicity)
  const [action, setAction] = useState<string>("all");
  const [resource, setResource] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  const matchesFilters = (log: ActivityLog) => {
    if (action !== "all" && log.action !== action) return false;
    if (resource !== "all" && log.resourceType !== resource) return false;
    if (search) {
      const needle = search.toLowerCase();
      const hay = `${log.userEmail || ""} ${log.userName || ""} ${
        log.activityName || ""
      } ${log.resourceId || ""}`.toLowerCase();
      if (!hay.includes(needle)) return false;
    }
    if (dateFrom) {
      const fromMs = new Date(dateFrom).getTime();
      if (log.timestampMs < fromMs) return false;
    }
    if (dateTo) {
      const end = new Date(dateTo);
      end.setHours(23, 59, 59, 999);
      const toMs = end.getTime();
      if (log.timestampMs > toMs) return false;
    }
    return true;
  };

  const filtered = useMemo(
    () => logs.filter(matchesFilters),
    [logs, action, resource, search, dateFrom, dateTo]
  );

  const loadInitial = async () => {
    if (!db) return;
    setLoading(true);
    try {
      const q = query(
        collection(db, "activity_logs"),
        orderBy("timestampMs", "desc"),
        limit(200)
      );
      const snap = await getDocs(q);
      const items: ActivityLog[] = snap.docs.map(
        (d) => d.data() as ActivityLog
      );
      setLogs(items);
      setLastDoc(snap.docs[snap.docs.length - 1] || null);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (!db || !lastDoc) return;
    setLoading(true);
    try {
      const q = query(
        collection(db, "activity_logs"),
        orderBy("timestampMs", "desc"),
        startAfter(lastDoc),
        limit(200)
      );
      const snap = await getDocs(q);
      const items: ActivityLog[] = snap.docs.map(
        (d) => d.data() as ActivityLog
      );
      setLogs((prev) => [...prev, ...items]);
      setLastDoc(snap.docs[snap.docs.length - 1] || null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadInitial();
  }, []);

  const handleExport = () => {
    const csv = toCsv(filtered);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `activity-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card className="apple-card border-0">
        <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-xl">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Activity Logs</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={loadInitial}
                disabled={loading}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button
                onClick={handleExport}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 mb-4">
            <div className="space-y-1">
              <Label className="text-xs">Action</Label>
              <Select value={action} onValueChange={setAction}>
                <SelectTrigger className="apple-input rounded-xl border-2">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent className="apple-card rounded-xl">
                  <SelectItem value="all">All</SelectItem>
                  {ACTIONS.map((a) => (
                    <SelectItem key={a} value={a}>
                      {a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Resource</Label>
              <Select value={resource} onValueChange={setResource}>
                <SelectTrigger className="apple-input rounded-xl border-2">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent className="apple-card rounded-xl">
                  <SelectItem value="all">All</SelectItem>
                  {RESOURCES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Search</Label>
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="User, activity, resource ID…"
                className="apple-input rounded-xl border-2"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">From</Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">To</Label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>

          {/* Table */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">Time</TableHead>
                  <TableHead className="whitespace-nowrap">Action</TableHead>
                  <TableHead className="whitespace-nowrap">Resource</TableHead>
                  <TableHead className="whitespace-nowrap">User</TableHead>
                  <TableHead className="whitespace-nowrap">Activity</TableHead>
                  <TableHead className="whitespace-nowrap">
                    Resource ID
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((l, idx) => (
                  <TableRow key={`${l.timestampMs}-${idx}`}>
                    <TableCell className="text-xs">
                      {new Date(l.timestampMs).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-xs">{l.action}</TableCell>
                    <TableCell className="text-xs">{l.resourceType}</TableCell>
                    <TableCell className="text-xs">
                      {l.userEmail || l.userName || "-"}
                    </TableCell>
                    <TableCell className="text-xs">
                      {l.activityName || "-"}
                    </TableCell>
                    <TableCell className="text-xs">
                      {l.resourceId || "-"}
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-sm py-6 text-gray-500"
                    >
                      No logs match your filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Load more */}
          <div className="flex justify-center mt-4">
            <Button
              variant="outline"
              onClick={loadMore}
              disabled={!lastDoc || loading}
            >
              Load more
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
