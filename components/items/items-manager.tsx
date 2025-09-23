"use client";

import type React from "react";

import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Upload,
  Search,
  Trash2,
  Edit3,
  Download,
  Filter,
} from "lucide-react";
import type { UnitType } from "@/types/employee";
import { UNIT_OPTIONS } from "@/types/item";
import { useItems, useItemsSearch } from "@/hooks/useItems";
import { format } from "date-fns";

type FormState = {
  id?: string;
  name: string;
  unit: UnitType;
  rate: string;
  tags: string;
};

const csvExample =
  "name,unit,rate,tags\nribbons,piece,5,decor;gift\npp,kg,10,\nmalai dori,kg,8,rope";

function parseCsv(text: string) {
  // Basic CSV parser: supports comma or tab, quoted values, first row headers
  const rows: string[][] = [];
  let current = "";
  let inQuotes = false;
  const pushCell = (row: string[]) => {
    row.push(current.trim());
    current = "";
  };
  const pushRow = (row: string[][], cells: string[]) => {
    // skip empty line
    if (cells.length === 1 && cells[0] === "") return;
    row.push(cells);
  };
  let row: string[] = [];
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      if (inQuotes && text[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (!inQuotes && (ch === "," || ch === "\t")) {
      pushCell(row);
    } else if (!inQuotes && (ch === "\n" || ch === "\r")) {
      // handle \r\n
      if (ch === "\r" && text[i + 1] === "\n") i++;
      pushCell(row);
      pushRow(rows, row);
      row = [];
    } else {
      current += ch;
    }
  }
  if (current.length > 0 || row.length > 0) {
    pushCell(row);
    pushRow(rows, row);
  }
  if (rows.length === 0) return [];

  const headers = rows[0].map((h) => h.toLowerCase().trim());
  const idx = {
    name: headers.indexOf("name"),
    unit: headers.indexOf("unit"),
    rate: headers.indexOf("rate"),
    tags: headers.indexOf("tags"),
  };

  const toUnit = (u: string): UnitType => {
    const val = u.toLowerCase();
    if (val.startsWith("kg")) return "kg";
    if (val.startsWith("meter") || val === "m") return "meter";
    if (val.startsWith("piece") || val === "pcs" || val === "pc")
      return "piece";
    // default piece
    return "piece";
  };

  const out: Array<{
    name: string;
    unit: UnitType;
    rate: number;
    tags?: string[];
  }> = [];
  for (let i = 1; i < rows.length; i++) {
    const cells = rows[i];
    const name = (cells[idx.name] || "").trim();
    const unit = toUnit((cells[idx.unit] || "").trim());
    const rate = Number.parseFloat((cells[idx.rate] || "0").trim()) || 0;
    const tagsRaw = (cells[idx.tags] || "").trim();
    if (!name) continue;
    out.push({
      name,
      unit,
      rate,
      tags: tagsRaw
        ? tagsRaw
            .split(/[;,]/)
            .map((t) => t.trim())
            .filter(Boolean)
        : [],
    });
  }
  return out;
}

export function ItemsManager() {
  const {
    items,
    loading,
    addOrUpdateItem,
    updateItem,
    deleteItem,
    bulkUpsert,
  } = useItems();
  const [query, setQuery] = useState("");
  const [unit, setUnit] = useState<"all" | UnitType>("all");
  const [sort, setSort] = useState("updated-desc");
  const [showForm, setShowForm] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [importPreview, setImportPreview] = useState<
    Array<{ name: string; unit: UnitType; rate: number; tags?: string[] }>
  >([]);
  const [form, setForm] = useState<FormState>({
    name: "",
    unit: "piece",
    rate: "",
    tags: "",
  });
  const fileRef = useRef<HTMLInputElement>(null);

  const filtered = useItemsSearch(items, { query, unit, sort });

  const resetForm = () =>
    setForm({
      id: undefined,
      name: "",
      unit: "piece",
      rate: "",
      tags: "",
    });

  const openEdit = (id: string) => {
    const it = items.find((i) => i.id === id);
    if (!it) return;
    setForm({
      id: it.id,
      name: it.name,
      unit: it.unit,
      rate: String(it.rate),
      tags: (it.tags || []).join("; "),
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    const payload = {
      id: form.id,
      name: form.name.trim(),
      unit: form.unit,
      rate: Number.parseFloat(form.rate || "0") || 0,
      tags: form.tags
        .split(/[;,]/)
        .map((t) => t.trim())
        .filter(Boolean),
    };
    await addOrUpdateItem(payload);
    setShowForm(false);
    resetForm();
  };

  const handleRemove = async (id: string) => {
    if (!confirm("Delete this item?")) return;
    await deleteItem(id);
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const text = await f.text();
    setImportPreview(parseCsv(text));
  };

  const handleImport = async () => {
    if (importPreview.length === 0) return;
    const res = await bulkUpsert(importPreview);
    const ok = res.filter((r) => r.ok).length;
    const fail = res.length - ok;
    alert(`Imported ${ok} items${fail ? `, ${fail} failed` : ""}`);
    setImportPreview([]);
    setShowBulk(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const exportCsv = () => {
    const header = "name,unit,rate,tags\n";
    const body = filtered
      .map((i) => {
        const tags = (i.tags || []).join(";");
        return `"${i.name.replace(/"/g, '""')}",${i.unit},${
          i.rate
        },"${tags.replace(/"/g, '""')}"`;
      })
      .join("\n");
    const blob = new Blob([header + body], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "item-catalog.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const stat = useMemo(() => {
    return {
      count: items.length,
      pieces: items.filter((i) => i.unit === "piece").length,
      kg: items.filter((i) => i.unit === "kg").length,
      meter: items.filter((i) => i.unit === "meter").length,
    };
  }, [items]);

  return (
    <div className="space-y-6">
      <Card className="apple-card border-0">
        <CardHeader>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Item Catalog
          </CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Centralized item-wise catalog with unit and rate. Use this catalog
            when recording work across all employees.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Controls */}
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search by name or tag..."
                className="pl-9"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              <Select value={unit} onValueChange={(v: any) => setUnit(v)}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Unit" />
                </SelectTrigger>
                <SelectContent className="apple-card">
                  <SelectItem value="all">All units</SelectItem>
                  <SelectItem value="piece">Piece</SelectItem>
                  <SelectItem value="kg">Kilogram</SelectItem>
                  <SelectItem value="meter">Meter</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="apple-card">
                  <SelectItem value="updated-desc">Updated • Newest</SelectItem>
                  <SelectItem value="updated-asc">Updated • Oldest</SelectItem>
                  <SelectItem value="name-asc">Name • A-Z</SelectItem>
                  <SelectItem value="name-desc">Name • Z-A</SelectItem>
                  <SelectItem value="rate-asc">Rate • Low to High</SelectItem>
                  <SelectItem value="rate-desc">Rate • High to Low</SelectItem>
                </SelectContent>
              </Select>

              {/* <Button variant="outline" className="gap-2 bg-transparent">
                <Filter className="w-4 h-4" />
                {stat.count} items
              </Button> */}

              <Button
                onClick={exportCsv}
                variant="outline"
                className="gap-2 bg-transparent"
              >
                <Download className="w-4 h-4" />
                Export
              </Button>
              <Button
                onClick={() => setShowBulk(true)}
                variant="secondary"
                className="gap-2"
              >
                <Upload className="w-4 h-4" />
                Bulk Upload
              </Button>
              <Button
                onClick={() => setShowForm(true)}
                className="apple-button gap-2 bg-gradient-to-br from-pink-500 to-purple-600 text-white rounded-xl p-4"
              >
                <Plus className="w-4 h-4" />
                Add Item
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-300 text-white rounded-xl p-4">
              <div className="text-xs opacity-80">Total</div>
              <div className="text-2xl font-semibold">{stat.count}</div>
            </div>
            <div className="bg-gradient-to-br from-emerald-500 to-green-300 text-white rounded-xl p-4">
              <div className="text-xs opacity-80">Piece</div>
              <div className="text-2xl font-semibold">{stat.pieces}</div>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-cyan-300 text-white rounded-xl p-4">
              <div className="text-xs opacity-80">Kilogram</div>
              <div className="text-2xl font-semibold">{stat.kg}</div>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-red-300 text-white rounded-xl p-4">
              <div className="text-xs opacity-80">Meter</div>
              <div className="text-2xl font-semibold">{stat.meter}</div>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="w-36">Unit</TableHead>
                  <TableHead className="w-36">Rate</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead className="w-44">Updated</TableHead>
                  <TableHead className="w-28 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10">
                      Loading catalog...
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10">
                      No items match your query.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((it) => (
                    <TableRow
                      key={it.id}
                      className="hover:bg-gray-50/60 dark:hover:bg-slate-800/40"
                    >
                      <TableCell className="font-medium">{it.name}</TableCell>
                      <TableCell className="capitalize">{it.unit}</TableCell>
                      <TableCell>₹ {it.rate.toFixed(2)}</TableCell>
                      <TableCell className="space-x-1">
                        {(it.tags || []).map((t) => (
                          <Badge key={t} variant="secondary">
                            {t}
                          </Badge>
                        ))}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {format(new Date(it.updatedAt), "PPp")}
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(it.id)}
                          aria-label="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => void handleRemove(it.id)}
                          className="text-red-500 hover:text-red-600"
                          aria-label="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit dialog */}
      <Dialog
        open={showForm}
        onOpenChange={(o) => (o ? setShowForm(true) : setShowForm(false))}
      >
        <DialogContent className="apple-card">
          <DialogHeader>
            <DialogTitle>{form.id ? "Edit Item" : "Add Item"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                placeholder="e.g., ribbons"
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Unit</Label>
              <Select
                value={form.unit}
                onValueChange={(v: UnitType) =>
                  setForm((p) => ({ ...p, unit: v }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="apple-card">
                  {UNIT_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Rate</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0"
                value={form.rate}
                onChange={(e) =>
                  setForm((p) => ({ ...p, rate: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Tags (optional)</Label>
              <Input
                placeholder="comma or ; separated (e.g., thread; cotton)"
                value={form.tags}
                onChange={(e) =>
                  setForm((p) => ({ ...p, tags: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button onClick={() => void handleSave()} className="apple-button">
              {form.id ? "Save changes" : "Add item"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Upload dialog */}
      <Dialog
        open={showBulk}
        onOpenChange={(o) => (o ? setShowBulk(true) : setShowBulk(false))}
      >
        <DialogContent className="apple-card">
          <DialogHeader>
            <DialogTitle>Bulk Upload Items</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Upload a CSV with columns: name, unit, rate, tags. Units: piece,
              kg, meter.
            </p>
            <div className="flex gap-2 items-center">
              <Input
                ref={fileRef}
                type="file"
                accept=".csv,text/csv"
                onChange={onFileChange}
              />
              <Button
                variant="outline"
                onClick={() => {
                  navigator.clipboard
                    .readText()
                    .then((t) => setImportPreview(parseCsv(t)))
                    .catch(() =>
                      alert(
                        "Could not read clipboard. Paste in any text editor, save as CSV, and upload."
                      )
                    );
                }}
              >
                Paste CSV
              </Button>
            </div>
            <div className="bg-gray-50 dark:bg-slate-900 rounded-lg p-3 text-xs overflow-x-auto">
              <div className="font-mono whitespace-pre">{csvExample}</div>
            </div>

            <div className="max-h-64 overflow-auto rounded-lg border border-gray-200 dark:border-gray-800">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="w-32">Unit</TableHead>
                    <TableHead className="w-24">Rate</TableHead>
                    <TableHead>Tags</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {importPreview.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        No rows parsed yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    importPreview.map((r, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{r.name}</TableCell>
                        <TableCell className="capitalize">{r.unit}</TableCell>
                        <TableCell>{r.rate}</TableCell>
                        <TableCell>{(r.tags || []).join("; ")}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowBulk(false)}>
              Cancel
            </Button>
            <Button
              disabled={importPreview.length === 0}
              onClick={() => void handleImport()}
              className="apple-button"
            >
              Import {importPreview.length ? `(${importPreview.length})` : ""}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
