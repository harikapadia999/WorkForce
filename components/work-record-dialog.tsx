"use client"

import { CardDescription } from "@/components/ui/card"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Employee, WorkRecord } from "@/types/employee"
import { Calendar, Package, Ruler, Hash, Trash2, FileText, DollarSign, TrendingUp } from "lucide-react"
import { formatCurrency } from "@/utils/salary-calculator"

interface WorkRecordDialogProps {
  employee: Employee
  onClose: () => void
  onUpdate: (updates: Partial<Employee>) => void
}

export function WorkRecordDialog({ employee, onClose, onUpdate }: WorkRecordDialogProps) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [unit, setUnit] = useState<"kg" | "meter" | "piece">("kg")
  const [quantity, setQuantity] = useState("")
  const [notes, setNotes] = useState("")

  const handleAddWorkRecord = () => {
    if (!quantity || Number.parseFloat(quantity) <= 0) return

    const rate = employee.salaryConfig.daily?.perUnitRates?.[unit] || 0
    const totalAmount = Number.parseFloat(quantity) * rate

    const newRecord: WorkRecord = {
      id: crypto.randomUUID(),
      employeeId: employee.id,
      date: selectedDate,
      quantity: Number.parseFloat(quantity),
      unit,
      rate,
      totalAmount,
      notes,
      createdAt: new Date().toISOString(),
    }

    const updatedRecords = [...(employee.workRecords || []), newRecord]
    onUpdate({ workRecords: updatedRecords })

    // Reset form
    setQuantity("")
    setNotes("")
  }

  const handleDeleteRecord = (recordId: string) => {
    const updatedRecords = (employee.workRecords || []).filter((record) => record.id !== recordId)
    onUpdate({ workRecords: updatedRecords })
  }

  const getCurrentMonthRecords = () => {
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()

    return (employee.workRecords || [])
      .filter((record) => {
        const recordDate = new Date(record.date)
        return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  const getSelectedMonthRecords = () => {
    return (employee.workRecords || [])
      .filter((record) => {
        const recordDate = new Date(record.date)
        return recordDate.getMonth() === selectedMonth && recordDate.getFullYear() === selectedYear
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  const getMonthlyTotal = (records: WorkRecord[]) => {
    return records.reduce((total, record) => total + record.totalAmount, 0)
  }

  const getUnitIcon = (unit: string) => {
    switch (unit) {
      case "kg":
        return <Package className="w-4 h-4" />
      case "meter":
        return <Ruler className="w-4 h-4" />
      case "piece":
        return <Hash className="w-4 h-4" />
      default:
        return <Package className="w-4 h-4" />
    }
  }

  const getUnitColor = (unit: string) => {
    switch (unit) {
      case "kg":
        return "bg-gradient-to-r from-purple-500 to-pink-500 dark:from-purple-400 dark:to-pink-400"
      case "meter":
        return "bg-gradient-to-r from-blue-500 to-cyan-500 dark:from-blue-400 dark:to-cyan-400"
      case "piece":
        return "bg-gradient-to-r from-green-500 to-emerald-500 dark:from-green-400 dark:to-emerald-400"
      default:
        return "bg-gradient-to-r from-gray-500 to-slate-500 dark:from-gray-400 dark:to-slate-400"
    }
  }

  const currentMonthRecords = getCurrentMonthRecords()
  const selectedMonthRecords = getSelectedMonthRecords()
  const displayRecords =
    selectedMonth === new Date().getMonth() && selectedYear === new Date().getFullYear()
      ? currentMonthRecords
      : selectedMonthRecords

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
  ]

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto apple-card">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
            Work Records - {employee.name}
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-gray-700 dark:text-gray-300 font-medium">
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
                <div className="space-y-2">
                  <Label htmlFor="unit" className="text-gray-700 dark:text-gray-300 font-medium">
                    Unit Type
                  </Label>
                  <Select value={unit} onValueChange={(value: "kg" | "meter" | "piece") => setUnit(value)}>
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
                  <Label htmlFor="quantity" className="text-gray-700 dark:text-gray-300 font-medium">
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
                  <Label className="text-gray-700 dark:text-gray-300 font-medium">Rate & Total</Label>
                  <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800/30">
                    <div className="text-sm font-medium text-green-700 dark:text-green-300">
                      Rate: ₹{employee.salaryConfig.daily?.perUnitRates?.[unit] || 0}/{unit}
                    </div>
                    <div className="text-lg font-bold text-green-800 dark:text-green-200">
                      {formatCurrency(
                        (Number.parseFloat(quantity) || 0) * (employee.salaryConfig.daily?.perUnitRates?.[unit] || 0),
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <Label htmlFor="notes" className="text-gray-700 dark:text-gray-300 font-medium">
                  Notes (Optional)
                </Label>
                <Input
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional notes..."
                  className="border-2 border-gray-200 dark:border-gray-700 focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors bg-white/50 dark:bg-slate-800/50"
                />
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
            <CardHeader className="bg-gradient-to-r from-cyan-500 to-blue-600 dark:from-cyan-400 dark:to-blue-500 text-white rounded-t-lg">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    Work Records & Analytics
                  </CardTitle>
                  <CardDescription className="text-cyan-100 dark:text-cyan-200 mt-1">
                    {months[selectedMonth]} {selectedYear}
                    {selectedMonth === new Date().getMonth() &&
                      selectedYear === new Date().getFullYear() &&
                      " (Current Month)"}
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Select
                    value={selectedMonth.toString()}
                    onValueChange={(value) => setSelectedMonth(Number.parseInt(value))}
                  >
                    <SelectTrigger className="w-32 bg-white/20 dark:bg-black/20 border-white/30 dark:border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
                      {months.map((month, index) => (
                        <SelectItem key={index} value={index.toString()}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={selectedYear.toString()}
                    onValueChange={(value) => setSelectedYear(Number.parseInt(value))}
                  >
                    <SelectTrigger className="w-24 bg-white/20 dark:bg-black/20 border-white/30 dark:border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
                      {[2024, 2023, 2022].map((year) => (
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
                      <p className="text-3xl font-bold">{displayRecords.length}</p>
                      <p className="text-blue-100 dark:text-blue-200 text-sm font-medium">Work Days</p>
                    </div>
                    <Calendar className="w-8 h-8 text-blue-200 dark:text-blue-300" />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-emerald-500 to-green-600 dark:from-emerald-400 dark:to-green-500 p-4 rounded-xl text-white shadow-lg apple-hover">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-bold">
                        {displayRecords.reduce((sum, record) => sum + record.quantity, 0).toFixed(1)}
                      </p>
                      <p className="text-green-100 dark:text-green-200 text-sm font-medium">Total Units</p>
                    </div>
                    <Package className="w-8 h-8 text-green-200 dark:text-green-300" />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-400 dark:to-purple-500 p-4 rounded-xl text-white shadow-lg apple-hover">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold">{formatCurrency(getMonthlyTotal(displayRecords))}</p>
                      <p className="text-purple-100 dark:text-purple-200 text-sm font-medium">Total Earnings</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-purple-200 dark:text-purple-300" />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-orange-500 to-red-500 dark:from-orange-400 dark:to-red-400 p-4 rounded-xl text-white shadow-lg apple-hover">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold">
                        ₹
                        {displayRecords.length > 0
                          ? (getMonthlyTotal(displayRecords) / displayRecords.length).toFixed(0)
                          : "0"}
                      </p>
                      <p className="text-orange-100 dark:text-orange-200 text-sm font-medium">Avg/Day</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-orange-200 dark:text-orange-300" />
                  </div>
                </div>
              </div>

              {/* Work Records List */}
              {displayRecords.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">No work records found</p>
                  <p className="text-gray-400 dark:text-gray-500">Add your first work record to get started</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {displayRecords.map((record, index) => (
                    <div
                      key={record.id}
                      className="group flex items-center justify-between p-4 bg-white/50 dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-600 backdrop-blur-sm apple-hover"
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className={`w-12 h-12 rounded-full ${getUnitColor(record.unit)} flex items-center justify-center text-white shadow-lg`}
                        >
                          {getUnitIcon(record.unit)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-1">
                            <span className="font-bold text-lg text-gray-800 dark:text-gray-200">
                              {record.quantity} {record.unit}
                            </span>
                            <span className="text-gray-400 dark:text-gray-500">×</span>
                            <span className="text-gray-600 dark:text-gray-400 font-medium">₹{record.rate}</span>
                            <span className="text-gray-400 dark:text-gray-500">=</span>
                            <span className="font-bold text-xl text-green-600 dark:text-green-400">
                              {formatCurrency(record.totalAmount)}
                            </span>
                          </div>
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-500 space-x-4">
                            <span className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {new Date(record.date).toLocaleDateString("en-IN", {
                                weekday: "short",
                                day: "numeric",
                                month: "short",
                              })}
                            </span>
                            {record.notes && (
                              <span className="flex items-center">
                                <FileText className="w-3 h-3 mr-1" />
                                {record.notes}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteRecord(record.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
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
  )
}
