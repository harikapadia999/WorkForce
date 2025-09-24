"use client";

import { CardDescription } from "@/components/ui/card";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import type { Employee, WorkRecord } from "@/types/employee";
import {
  Calendar,
  Package,
  Ruler,
  Hash,
  Trash2,
  FileText,
  IndianRupee,
  TrendingUp,
  Tag,
} from "lucide-react";
import { formatCurrency, getDailyWorkSummary } from "@/utils/salary-calculator";
import { logActivity, logView } from "@/services/activity-log-service";
import { useItems } from "@/hooks/useItems";

type UnitType = "kg" | "meter" | "piece";

interface WorkRecordDialogProps {
  employee: Employee;
  onClose: () => void;
  onUpdate: (updates: Partial<Employee>) => void;
}

function parseItemFromNotes(notes?: string) {
  if (!notes) return { itemName: null as string | null, rest: "" };
  const m = notes.match(/^Item:\s*([^|]+?)(?:\s*\|\s*(.*))?$/);
  if (m) return { itemName: m[1].trim(), rest: (m[2] || "").trim() };
  return { itemName: null, rest: notes };
}

export function WorkRecordDialog({
  employee,
  onClose,
  onUpdate,
}: WorkRecordDialogProps) {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // Item catalog (daily per-unit)
  // const catalog = useMemo(
  //   () => (employee.salaryConfig as any)?.daily?.perUnitCatalog || [],
  //   [employee.salaryConfig]
  // );
  // Item catalog (daily per-unit) + global catalog
  const { items: globalItems } = useItems();
  const localCatalog = useMemo(
    () => (employee.salaryConfig as any)?.daily?.perUnitCatalog || [],
    [employee.salaryConfig]
  );
  const catalog = useMemo(() => {
    // Convert global items to the same shape as perUnitCatalog
    const globals = (globalItems || []).map((g) => ({
      id: g.id,
      name: g.name,
      unit: g.unit,
      rate: g.rate,
    }));
    // Merge without duplicates (by name+unit)
    const key = (x: any) => `${String(x.name).toLowerCase()}|${x.unit}`;
    const map = new Map<string, any>();
    for (const it of [...globals, ...localCatalog]) {
      map.set(key(it), it);
    }
    return Array.from(map.values());
  }, [globalItems, localCatalog]);

  const [selectedItemId, setSelectedItemId] = useState<string>("");
  const [unit, setUnit] = useState<UnitType>("kg");
  const [quantity, setQuantity] = useState("");
  const [rate, setRate] = useState<number>(0);
  const [notes, setNotes] = useState("");

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const legacyRates = (employee.salaryConfig as any)?.daily?.perUnitRates || {};

  const handleSelectItem = (id: string) => {
    setSelectedItemId(id);
    const item = catalog.find((i: any) => i.id === id);
    if (item) {
      setUnit(item.unit);
      setRate(item.rate);
    }
  };

  const computeRateFromFallback = (u: UnitType): number => {
    return (legacyRates?.[u] || 0) as number;
  };

  const effectiveRate = selectedItemId
    ? rate
    : rate || computeRateFromFallback(unit);

  const handleAddWorkRecord = async () => {
    const q = Number.parseFloat(quantity);
    if (!q || q <= 0) return;

    const recordRate = effectiveRate;
    const totalAmount = Number((q * recordRate).toFixed(2));

    const item = catalog.find((i: any) => i.id === selectedItemId);
    const itemNotePrefix = item ? `Item: ${item.name}` : "";
    const combinedNotes = itemNotePrefix
      ? notes
        ? `${itemNotePrefix} | ${notes}`
        : itemNotePrefix
      : notes;

    const newRecord: WorkRecord = {
      id: crypto.randomUUID(),
      employeeId: employee.id,
      date: selectedDate,
      quantity: q,
      unit,
      rate: recordRate,
      totalAmount,
      notes: combinedNotes,
      createdAt: new Date().toISOString(),
    };

    const before = employee.workRecords || [];
    const updatedRecords = [...before, newRecord];
    onUpdate({ workRecords: updatedRecords });

    // Log granular action (Create workRecord)
    await logActivity({
      action: "Create",
      resourceType: "workRecord",
      resourceId: newRecord.id,
      metadata: {
        employeeId: employee.id,
        employeeName: (employee as any).name,
      },
      after: newRecord,
    });

    // Reset
    setSelectedItemId("");
    setUnit("kg");
    setQuantity("");
    setRate(0);
    setNotes("");
  };

  const handleDeleteRecord = async (recordId: string) => {
    const before = employee.workRecords || [];
    const rec = before.find((r) => r.id === recordId);
    const updatedRecords = before.filter((record) => record.id !== recordId);
    onUpdate({ workRecords: updatedRecords });

    await logActivity({
      action: "Delete",
      resourceType: "workRecord",
      resourceId: recordId,
      metadata: {
        employeeId: employee.id,
        employeeName: (employee as any).name,
      },
      before: rec,
    });
  };
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const summary = getDailyWorkSummary(employee, year, month);
  const rateText = formatCurrency(effectiveRate);
  let daysDisplay: string;
  let suffix = "days/month";

  if (summary.daysWithWork > 0) {
    daysDisplay = `${summary.daysWithWork}`;
  } else if (summary.configuredWorkingDays !== null) {
    daysDisplay = `${summary.configuredWorkingDays}`;
  } else {
    daysDisplay = "Set working days";
    suffix = "";
  }

  const getSelectedMonthRecords = () => {
    return (employee.workRecords || [])
      .filter((record) => {
        const recordDate = new Date(record.date);
        return (
          recordDate.getMonth() === selectedMonth &&
          recordDate.getFullYear() === selectedYear
        );
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const displayRecords = getSelectedMonthRecords();

  const getMonthlyTotal = (records: WorkRecord[]) => {
    return records.reduce((total, record) => total + record.totalAmount, 0);
  };

  const getUnitIcon = (u: string) => {
    switch (u) {
      case "kg":
        return <Package className="w-4 h-4" />;
      case "meter":
        return <Ruler className="w-4 h-4" />;
      case "piece":
        return <Hash className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  useEffect(() => {
    void logView("WorkRecordDialog", {
      employeeId: employee.id,
      employeeName: (employee as any).name,
    });
  }, [employee]);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto apple-card">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
            Work Records - {(employee as any).name}
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            Track daily work output and earnings with detailed analytics
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add New Work Record */}
          <Card className="border-0 shadow-lg apple-card apple-hover">
            <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-400 dark:to-purple-500 text-white rounded-t-lg">
              <CardTitle className="text-xl flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Add Work Record
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {/* Item-first when catalog available */}
              {catalog.length > 0 &&
                (employee.salaryConfig as any)?.daily?.hasPerUnitWork && (
                  <div className="mb-4 apple-card-inner rounded-xl p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200/70 dark:border-indigo-800/40">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className="text-gray-700 dark:text-gray-300 font-medium flex p-1 items-center">
                          <Tag className="w-4 h-4 mr-2" />
                          Item
                        </Label>
                        <Select
                          value={selectedItemId}
                          onValueChange={handleSelectItem}
                        >
                          <SelectTrigger className="apple-input rounded-xl border-2">
                            <SelectValue placeholder="Select item" />
                          </SelectTrigger>
                          <SelectContent className="apple-card rounded-xl">
                            {catalog.map((it: any) => (
                              <SelectItem key={it.id} value={it.id}>
                                {it.name} • ₹{it.rate}/{it.unit}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-gray-700 dark:text-gray-300 font-medium">
                          Unit
                        </Label>
                        <Select
                          value={unit}
                          onValueChange={(val: UnitType) => {
                            setUnit(val);
                            if (!selectedItemId)
                              setRate(computeRateFromFallback(val));
                          }}
                        >
                          <SelectTrigger className="apple-input rounded-xl border-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="apple-card rounded-xl">
                            <SelectItem value="kg">🏋️ Kilogram (KG)</SelectItem>
                            <SelectItem value="meter">📏 Meter</SelectItem>
                            <SelectItem value="piece">🔢 Piece</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-gray-700 dark:text-gray-300 font-medium">
                          Rate (₹/{unit})
                        </Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={effectiveRate}
                          onChange={(e) =>
                            setRate(Number.parseFloat(e.target.value) || 0)
                          }
                          className="apple-input rounded-xl border-2"
                        />
                        <p className="text-[11px] text-gray-500 dark:text-gray-400">
                          {selectedItemId
                            ? "Auto‑filled from item; you can override."
                            : "Using fallback unit rate."}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

              {/* Basic inputs */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="date"
                    className="text-gray-700 dark:text-gray-300 font-medium"
                  >
                    Date
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="border-2 border-gray-200 dark:border-gray-700 focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors bg-white/50 dark:bg-slate-800/50"
                  />
                </div>

                {/* If no catalog, offer legacy unit + rate path */}
                {!(
                  catalog.length > 0 &&
                  (employee.salaryConfig as any)?.daily?.hasPerUnitWork
                ) && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-gray-700 dark:text-gray-300 font-medium">
                        Unit Type
                      </Label>
                      <Select
                        value={unit}
                        onValueChange={(value: UnitType) => {
                          setUnit(value);
                          setRate(computeRateFromFallback(value));
                        }}
                      >
                        <SelectTrigger className="border-2 border-gray-200 dark:border-gray-700 focus:border-indigo-500 dark:focus:border-indigo-400 bg-white/50 dark:bg-slate-800/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
                          <SelectItem value="kg">🏋️ Kilogram (KG)</SelectItem>
                          <SelectItem value="meter">📏 Meter</SelectItem>
                          <SelectItem value="piece">🔢 Piece</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-700 dark:text-gray-300 font-medium">
                        Rate (₹/{unit})
                      </Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={rate || computeRateFromFallback(unit)}
                        onChange={(e) =>
                          setRate(Number.parseFloat(e.target.value) || 0)
                        }
                        placeholder="0.00"
                        className="border-2 border-gray-200 dark:border-gray-700 focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors bg-white/50 dark:bg-slate-800/50"
                      />
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label
                    htmlFor="quantity"
                    className="text-gray-700 dark:text-gray-300 font-medium"
                  >
                    Quantity
                  </Label>
                  <Input
                    id="quantity"
                    type="number"
                    step="0.01"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="0.00"
                    className="border-2 border-gray-200 dark:border-gray-700 focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors bg-white/50 dark:bg-slate-800/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="total"
                    className="text-gray-700 dark:text-gray-300 font-medium"
                  >
                    Total
                  </Label>
                  <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800/30">
                    <div className="text-sm font-medium text-green-700 dark:text-green-300">
                      Rate: ₹{(effectiveRate || 0).toFixed(2)}/{unit}
                    </div>
                    <div className="text-lg font-bold text-green-800 dark:text-green-200">
                      {formatCurrency(
                        (Number.parseFloat(quantity) || 0) *
                          (effectiveRate || 0)
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <Label
                  htmlFor="notes"
                  className="text-gray-700 dark:text-gray-300 font-medium"
                >
                  Notes (Optional)
                </Label>
                <Input
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional notes..."
                  className="border-2 border-gray-200 dark:border-gray-700 focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors bg-white/50 dark:bg-slate-800/50"
                />
                <p className="text-[11px] text-gray-500">
                  If an item is selected, it will be saved as "Item: Name" at
                  the start of notes for reporting.
                </p>
              </div>

              <div className="mt-6">
                <Button
                  onClick={handleAddWorkRecord}
                  disabled={!quantity || Number.parseFloat(quantity) <= 0}
                  className="apple-button bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 dark:from-indigo-400 dark:to-purple-500 dark:hover:from-indigo-500 dark:hover:to-purple-600 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  <Package className="w-4 h-4 mr-2" />
                  Add Work Record
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Combined Work Records with Month Selector */}
          <Card className="border-0 shadow-lg apple-card apple-hover">
            <CardHeader className="bg-gradient-to-r from-cyan-400 via-blue-500 to-blue-800 dark:from-cyan-400 dark:via-blue-500 dark:to-blue-800 text-white rounded-t-lg">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    Work Records & Analytics
                  </CardTitle>
                  <DialogDescription className="text-cyan-100 dark:text-cyan-200 mt-1">
                    {months[selectedMonth]} {selectedYear}
                    {selectedMonth === new Date().getMonth() &&
                      selectedYear === new Date().getFullYear() &&
                      " (Current Month)"}
                  </DialogDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Select
                    value={selectedMonth.toString()}
                    onValueChange={(value) =>
                      setSelectedMonth(Number.parseInt(value))
                    }
                  >
                    <SelectTrigger className="w-32 bg-white/20 dark:bg-black/20 border-white/30 dark:border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
                      {Array.from({ length: 12 }).map((_, i) => (
                        <SelectItem key={i} value={i.toString()}>
                          {months[i]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={selectedYear.toString()}
                    onValueChange={(value) =>
                      setSelectedYear(Number.parseInt(value))
                    }
                  >
                    <SelectTrigger className="w-24 bg-white/20 dark:bg-black/20 border-white/30 dark:border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
                      {[
                        new Date().getFullYear(),
                        new Date().getFullYear() - 1,
                        new Date().getFullYear() - 2,
                      ].map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 p-4 rounded-xl text-white shadow-lg apple-hover">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-bold">{daysDisplay}</p>
                      <p className="text-blue-100 dark:text-blue-200 text-sm font-medium">
                        Work Days
                      </p>
                    </div>
                    <Calendar className="w-8 h-8 text-blue-200 dark:text-blue-300" />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-emerald-500 to-green-600 dark:from-emerald-400 dark:to-green-500 p-4 rounded-xl text-white shadow-lg apple-hover">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-bold">
                        {displayRecords
                          .reduce((sum, record) => sum + record.quantity, 0)
                          .toFixed(1)}
                      </p>
                      <p className="text-green-100 dark:text-green-200 text-sm font-medium">
                        Total Units
                      </p>
                    </div>
                    <Package className="w-8 h-8 text-green-200 dark:text-green-300" />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-400 dark:to-purple-500 p-4 rounded-xl text-white shadow-lg apple-hover">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold">
                        {formatCurrency(getMonthlyTotal(displayRecords))}
                      </p>
                      <p className="text-purple-100 dark:text-purple-200 text-sm font-medium">
                        Total Earnings
                      </p>
                    </div>
                    <IndianRupee className="w-8 h-8 text-purple-200 dark:text-purple-300" />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-orange-500 to-red-500 dark:from-orange-400 dark:to-red-400 p-4 rounded-xl text-white shadow-lg apple-hover">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold">
                        ₹
                        {displayRecords.length > 0
                          ? (
                              getMonthlyTotal(displayRecords) /
                              displayRecords.length
                            ).toFixed(0)
                          : "0"}
                      </p>
                      <p className="text-orange-100 dark:text-orange-200 text-sm font-medium">
                        Avg/Day
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-orange-200 dark:text-orange-300" />
                  </div>
                </div>
              </div>

              {/* Work Records List */}
              {displayRecords.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
                    No work records found
                  </p>
                  <p className="text-gray-400 dark:text-gray-500">
                    Add your first work record to get started
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {displayRecords.map((record) => {
                    const { itemName, rest } = parseItemFromNotes(record.notes);
                    return (
                      <div
                        key={record.id}
                        className="group flex items-center justify-between p-4 bg-white/50 dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-600 backdrop-blur-sm apple-hover"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg"
                            style={{
                              background:
                                "linear-gradient(135deg, #7C3AED, #A78BFA)",
                            }}
                          >
                            {getUnitIcon(record.unit)}
                          </div>
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              {itemName && (
                                <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300">
                                  {itemName}
                                </span>
                              )}
                              <span className="font-bold text-lg text-gray-800 dark:text-gray-200">
                                {record.quantity} {record.unit}
                              </span>
                              <span className="text-gray-400 dark:text-gray-500">
                                ×
                              </span>
                              <span className="text-gray-600 dark:text-gray-400 font-medium">
                                ₹{record.rate}
                              </span>
                              <span className="text-gray-400 dark:text-gray-500">
                                =
                              </span>
                              <span className="font-bold text-xl text-green-600 dark:text-green-400">
                                {formatCurrency(record.totalAmount)}
                              </span>
                            </div>
                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-500 gap-4">
                              <span className="flex items-center">
                                <Calendar className="w-3 h-3 mr-1" />
                                {new Date(record.date).toLocaleDateString(
                                  "en-IN",
                                  {
                                    weekday: "short",
                                    day: "numeric",
                                    month: "short",
                                  }
                                )}
                              </span>
                              {rest && (
                                <span className="flex items-center">
                                  <FileText className="w-3 h-3 mr-1" />
                                  {rest}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => void handleDeleteRecord(record.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="bg-gray-50/80 dark:bg-slate-800/80 -mx-6 -mb-6 px-6 py-4 rounded-b-lg backdrop-blur-sm">
          <Button
            variant="outline"
            onClick={onClose}
            className="apple-button px-6 py-2 border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 transition-colors bg-transparent backdrop-blur-sm"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
