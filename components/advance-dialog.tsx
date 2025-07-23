"use client"

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
import { Badge } from "@/components/ui/badge"
import type { Employee, Advance } from "@/types/employee"
import { Calendar, FileText, Plus, CreditCard, AlertCircle } from "lucide-react"
import { useSubscription } from "@/hooks/useSubscription"

// Import utility functions
import { calculateMonthlySalary, calculateNetSalary, formatCurrency } from "@/utils/salary-calculator"

interface AdvanceDialogProps {
  employee: Employee
  onClose: () => void
  onUpdate: (updates: Partial<Employee>) => void
}

export function AdvanceDialog({ employee, onClose, onUpdate }: AdvanceDialogProps) {
  const [amount, setAmount] = useState("")
  const [reason, setReason] = useState("")
  const [carryForward, setCarryForward] = useState(false)
  const { canAddAdvance, limits } = useSubscription()

  const handleAddAdvance = () => {
    if (!amount || Number.parseFloat(amount) <= 0) return

    const currentAdvances = employee.advances.filter((a) => a.status !== "deducted").length
    if (!canAddAdvance(currentAdvances)) {
      return
    }

    const newAdvance: Advance = {
      id: crypto.randomUUID(),
      amount: Number.parseFloat(amount),
      date: new Date().toISOString(),
      reason: reason || "Salary advance",
      status: "approved",
      carryForward: carryForward,
      originalAmount: Number.parseFloat(amount),
    }

    const updatedAdvances = [...employee.advances, newAdvance]
    onUpdate({ advances: updatedAdvances })

    // Reset form
    setAmount("")
    setReason("")
    setCarryForward(false)
  }

  const handleUpdateAdvanceStatus = (advanceId: string, status: Advance["status"]) => {
    const updatedAdvances = employee.advances.map((advance) =>
      advance.id === advanceId ? { ...advance, status } : advance,
    )
    onUpdate({ advances: updatedAdvances })
  }

  const totalOutstanding = employee.advances
    .filter((advance) => advance.status !== "deducted")
    .reduce((total, advance) => total + advance.amount, 0)

  const currentAdvanceCount = employee.advances.filter((a) => a.status !== "deducted").length

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto apple-modal">
        {/* Header */}
        <DialogHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-8 -mx-6 -mt-6 mb-8 rounded-t-lg">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-sm">
              <span className="text-3xl text-white font-bold">₹</span>
            </div>
            <div>
              <DialogTitle className="text-3xl font-bold mb-2">Salary Advances</DialogTitle>
              <DialogDescription className="text-purple-100 text-lg">
                Manage salary advances and deductions for {employee.name}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-8">
          {/* Add New Advance */}
          <div className="apple-card-inner rounded-3xl p-8 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200/50 dark:border-blue-800/30">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                <span className="text-xl text-white font-bold">₹</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-blue-800 dark:text-blue-300">Add New Advance</h3>
                <p className="text-blue-600 dark:text-blue-400 text-sm">
                  {canAddAdvance(currentAdvanceCount)
                    ? `${limits.maxAdvances - currentAdvanceCount} advances remaining`
                    : "Advance limit reached - upgrade to Pro for unlimited advances"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="amount" className="text-blue-800 dark:text-blue-300 font-semibold flex items-center">
                  <span className="w-4 h-4 mr-2 text-blue-600 font-bold">₹</span>
                  Amount (₹)
                </Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  disabled={!canAddAdvance(currentAdvanceCount)}
                  className="apple-input rounded-xl border-2 border-blue-200 dark:border-blue-700 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-800 px-4 py-3 text-lg disabled:opacity-50"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="reason" className="text-blue-800 dark:text-blue-300 font-semibold flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  Reason
                </Label>
                <Input
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Salary advance"
                  disabled={!canAddAdvance(currentAdvanceCount)}
                  className="apple-input rounded-xl border-2 border-blue-200 dark:border-blue-700 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-800 px-4 py-3 text-lg disabled:opacity-50"
                />
              </div>
            </div>

            <div className="mt-6 apple-card-inner rounded-xl p-4 bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-700">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="carryForward"
                  checked={carryForward}
                  onChange={(e) => setCarryForward(e.target.checked)}
                  disabled={!canAddAdvance(currentAdvanceCount)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 disabled:opacity-50"
                />
                <Label htmlFor="carryForward" className="text-blue-800 dark:text-blue-300 font-semibold">
                  Carry forward if not deducted this month
                </Label>
              </div>
            </div>

            <div className="mt-6">
              <Button
                onClick={handleAddAdvance}
                disabled={!amount || Number.parseFloat(amount) <= 0 || !canAddAdvance(currentAdvanceCount)}
                className="apple-button bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg disabled:hover:scale-100"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Advance
                {!canAddAdvance(currentAdvanceCount) && <AlertCircle className="w-4 h-4 ml-2" />}
              </Button>
            </div>
          </div>

          {/* Outstanding Summary */}
          {totalOutstanding > 0 && (
            <div className="apple-card-inner rounded-3xl p-8 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200/50 dark:border-yellow-800/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl flex items-center justify-center shadow-lg">
                    <span className="text-2xl text-white font-bold">₹</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-yellow-800 dark:text-yellow-300 mb-1">
                      Outstanding Advances
                    </h3>
                    <p className="text-3xl font-bold text-yellow-900 dark:text-yellow-200">
                      {formatCurrency(totalOutstanding)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="apple-card-inner rounded-xl p-4 bg-white/50 dark:bg-gray-800/50">
                    <p className="text-sm font-medium text-yellow-700 dark:text-yellow-400 mb-1">Gross Salary</p>
                    <p className="text-lg font-bold text-yellow-800 dark:text-yellow-300">
                      {formatCurrency(calculateMonthlySalary(employee))}
                    </p>
                    <p className="text-sm font-bold text-yellow-900 dark:text-yellow-200 mt-2">
                      Net: {formatCurrency(calculateNetSalary(employee))}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Advances History */}
          <div className="apple-card-inner rounded-3xl p-8 bg-white dark:bg-gray-800 shadow-lg">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-600 rounded-2xl flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Advances History</h3>
                <p className="text-gray-600 dark:text-gray-400">All salary advances and their status</p>
              </div>
            </div>

            {employee.advances.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <CreditCard className="w-12 h-12 text-gray-500 dark:text-gray-400" />
                </div>
                <h4 className="text-lg font-bold text-gray-700 dark:text-gray-300 mb-2">No advances recorded</h4>
                <p className="text-gray-500 dark:text-gray-500">Add the first advance to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {employee.advances
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((advance, index) => (
                    <div
                      key={advance.id}
                      className="apple-card-inner rounded-2xl p-6 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 border border-gray-200 dark:border-gray-600 apple-hover"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                            <span className="text-xl text-white font-bold">₹</span>
                          </div>
                          <div>
                            <div className="flex items-center space-x-3 mb-2">
                              <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                {formatCurrency(advance.amount)}
                              </span>
                              <Badge
                                className={`rounded-xl px-3 py-1 font-medium shadow-lg ${
                                  advance.status === "deducted"
                                    ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                                    : advance.status === "carried-forward"
                                      ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
                                      : advance.status === "approved"
                                        ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white"
                                        : "bg-gradient-to-r from-gray-400 to-gray-500 text-white"
                                }`}
                              >
                                {advance.status === "carried-forward" ? "Carried Forward" : advance.status}
                              </Badge>
                              {advance.carryForward && advance.status === "approved" && (
                                <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl px-2 py-1 text-xs font-medium">
                                  Auto Carry Forward
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                              <span className="flex items-center">
                                <Calendar className="w-4 h-4 mr-2" />
                                {new Date(advance.date).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </span>
                              <span className="flex items-center">
                                <FileText className="w-4 h-4 mr-2" />
                                {advance.reason}
                              </span>
                            </div>
                          </div>
                        </div>
                        {advance.status === "approved" && (
                          <Button
                            size="sm"
                            onClick={() => handleUpdateAdvanceStatus(advance.id, "deducted")}
                            className="apple-button bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl px-4 py-2 font-medium transition-all duration-300 hover:scale-105 shadow-lg"
                          >
                            Mark as Deducted
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="bg-gray-50/80 dark:bg-gray-800/80 -mx-6 -mb-6 px-8 py-6 rounded-b-lg backdrop-blur-sm">
          <Button
            variant="outline"
            onClick={onClose}
            className="apple-button-outline px-8 py-3 border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 rounded-xl font-semibold transition-all duration-300 hover:scale-105 bg-transparent"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
