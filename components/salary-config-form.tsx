"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { SalaryType, SalaryConfig } from "@/types/employee"
import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, Calendar, DollarSign, Package, Ruler, Hash, TrendingUp, Settings } from "lucide-react"

interface SalaryConfigFormProps {
  salaryType: SalaryType
  config: SalaryConfig
  onChange: (config: SalaryConfig) => void
}

export function SalaryConfigForm({ salaryType, config, onChange }: SalaryConfigFormProps) {
  const [paymentDates, setPaymentDates] = useState<string[]>(config.dynamicDate?.paymentDates || [""])

  const updateConfig = (updates: Partial<SalaryConfig>) => {
    onChange({ ...config, ...updates })
  }

  const getIcon = () => {
    switch (salaryType) {
      case "hourly":
        return <Clock className="w-6 h-6 text-white" />
      case "daily":
        return <Calendar className="w-6 h-6 text-white" />
      case "monthly":
        return <DollarSign className="w-6 h-6 text-white" />
      case "piece-rate":
        return <Hash className="w-6 h-6 text-white" />
      case "weight-based":
        return <Package className="w-6 h-6 text-white" />
      case "meter-based":
        return <Ruler className="w-6 h-6 text-white" />
      case "dynamic-date":
        return <TrendingUp className="w-6 h-6 text-white" />
      default:
        return <Settings className="w-6 h-6 text-white" />
    }
  }

  const getTitle = () => {
    switch (salaryType) {
      case "hourly":
        return "Hourly Rate Configuration"
      case "daily":
        return "Daily Rate Configuration"
      case "monthly":
        return "Monthly Salary Configuration"
      case "piece-rate":
        return "Piece Rate Configuration"
      case "weight-based":
        return "Weight-Based Configuration"
      case "meter-based":
        return "Meter-Based Configuration"
      case "dynamic-date":
        return "Dynamic Date Configuration"
      default:
        return "Salary Configuration"
    }
  }

  return (
    <Card className="apple-card-inner rounded-2xl border-0 shadow-lg overflow-hidden apple-hover">
      <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6">
        <CardTitle className="flex items-center space-x-3 text-xl">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">{getIcon()}</div>
          <span>{getTitle()}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
        {salaryType === "hourly" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label className="text-gray-700 dark:text-gray-300 font-semibold">Hourly Rate (₹)</Label>
              <Input
                type="number"
                step="0.01"
                value={config.hourly?.rate || ""}
                onChange={(e) =>
                  updateConfig({
                    hourly: {
                      rate: Number.parseFloat(e.target.value) || 0,
                      hoursPerWeek: config.hourly?.hoursPerWeek || 40,
                    },
                  })
                }
                className="apple-input rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-indigo-500 dark:focus:border-indigo-400 bg-white dark:bg-gray-800 px-4 py-3 text-lg"
                placeholder="0.00"
              />
            </div>
            <div className="space-y-3">
              <Label className="text-gray-700 dark:text-gray-300 font-semibold">Hours per Week</Label>
              <Input
                type="number"
                value={config.hourly?.hoursPerWeek || ""}
                onChange={(e) =>
                  updateConfig({
                    hourly: {
                      rate: config.hourly?.rate || 0,
                      hoursPerWeek: Number.parseInt(e.target.value) || 40,
                    },
                  })
                }
                className="apple-input rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-indigo-500 dark:focus:border-indigo-400 bg-white dark:bg-gray-800 px-4 py-3 text-lg"
                placeholder="40"
              />
            </div>
          </div>
        )}

        {salaryType === "daily" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-gray-700 dark:text-gray-300 font-semibold">Daily Rate (₹)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={config.daily?.rate || ""}
                  onChange={(e) =>
                    updateConfig({
                      daily: {
                        rate: Number.parseFloat(e.target.value) || 0,
                        workingDays: config.daily?.workingDays || 22,
                        hasPerUnitWork: config.daily?.hasPerUnitWork || false,
                        perUnitRates: config.daily?.perUnitRates || {},
                      },
                    })
                  }
                  className="apple-input rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-indigo-500 dark:focus:border-indigo-400 bg-white dark:bg-gray-800 px-4 py-3 text-lg"
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-3">
                <Label className="text-gray-700 dark:text-gray-300 font-semibold">Working Days per Month</Label>
                <Input
                  type="number"
                  value={config.daily?.workingDays || ""}
                  onChange={(e) =>
                    updateConfig({
                      daily: {
                        rate: config.daily?.rate || 0,
                        workingDays: Number.parseInt(e.target.value) || 22,
                        hasPerUnitWork: config.daily?.hasPerUnitWork || false,
                        perUnitRates: config.daily?.perUnitRates || {},
                      },
                    })
                  }
                  className="apple-input rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-indigo-500 dark:focus:border-indigo-400 bg-white dark:bg-gray-800 px-4 py-3 text-lg"
                  placeholder="22"
                />
              </div>
            </div>

            <div className="apple-card-inner rounded-xl p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30 apple-hover">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="hasPerUnitWork"
                  checked={config.daily?.hasPerUnitWork || false}
                  onChange={(e) =>
                    updateConfig({
                      daily: {
                        rate: config.daily?.rate || 0,
                        workingDays: config.daily?.workingDays || 22,
                        hasPerUnitWork: e.target.checked,
                        perUnitRates: config.daily?.perUnitRates || {},
                      },
                    })
                  }
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <Label htmlFor="hasPerUnitWork" className="text-blue-800 dark:text-blue-300 font-semibold">
                  Enable per-unit work tracking (KG/Meter/Piece)
                </Label>
              </div>
            </div>

            {config.daily?.hasPerUnitWork && (
              <div className="apple-card-inner rounded-xl p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800/30">
                <h4 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-4 flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Per-Unit Rates
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-3">
                    <Label className="text-green-700 dark:text-green-300 font-semibold flex items-center">
                      <Package className="w-4 h-4 mr-2" />
                      Rate per KG (₹)
                    </Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={config.daily?.perUnitRates?.kg || ""}
                      onChange={(e) =>
                        updateConfig({
                          daily: {
                            ...config.daily,
                            perUnitRates: {
                              ...config.daily?.perUnitRates,
                              kg: Number.parseFloat(e.target.value) || 0,
                            },
                          },
                        })
                      }
                      className="apple-input rounded-xl border-2 border-green-200 dark:border-green-700 focus:border-green-500 dark:focus:border-green-400 bg-white dark:bg-gray-800 px-4 py-3"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-green-700 dark:text-green-300 font-semibold flex items-center">
                      <Ruler className="w-4 h-4 mr-2" />
                      Rate per Meter (₹)
                    </Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={config.daily?.perUnitRates?.meter || ""}
                      onChange={(e) =>
                        updateConfig({
                          daily: {
                            ...config.daily,
                            perUnitRates: {
                              ...config.daily?.perUnitRates,
                              meter: Number.parseFloat(e.target.value) || 0,
                            },
                          },
                        })
                      }
                      className="apple-input rounded-xl border-2 border-green-200 dark:border-green-700 focus:border-green-500 dark:focus:border-green-400 bg-white dark:bg-gray-800 px-4 py-3"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-green-700 dark:text-green-300 font-semibold flex items-center">
                      <Hash className="w-4 h-4 mr-2" />
                      Rate per Piece (₹)
                    </Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={config.daily?.perUnitRates?.piece || ""}
                      onChange={(e) =>
                        updateConfig({
                          daily: {
                            ...config.daily,
                            perUnitRates: {
                              ...config.daily?.perUnitRates,
                              piece: Number.parseFloat(e.target.value) || 0,
                            },
                          },
                        })
                      }
                      className="apple-input rounded-xl border-2 border-green-200 dark:border-green-700 focus:border-green-500 dark:focus:border-green-400 bg-white dark:bg-gray-800 px-4 py-3"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {salaryType === "monthly" && (
          <div className="space-y-3">
            <Label className="text-gray-700 dark:text-gray-300 font-semibold">Monthly Salary (₹)</Label>
            <Input
              type="number"
              step="0.01"
              value={config.monthly?.amount || ""}
              onChange={(e) =>
                updateConfig({
                  monthly: { amount: Number.parseFloat(e.target.value) || 0 },
                })
              }
              className="apple-input rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-indigo-500 dark:focus:border-indigo-400 bg-white dark:bg-gray-800 px-4 py-3 text-lg"
              placeholder="0.00"
            />
          </div>
        )}

        {salaryType === "piece-rate" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label className="text-gray-700 dark:text-gray-300 font-semibold">Rate per Piece (₹)</Label>
              <Input
                type="number"
                step="0.01"
                value={config.pieceRate?.ratePerPiece || ""}
                onChange={(e) =>
                  updateConfig({
                    pieceRate: {
                      ratePerPiece: Number.parseFloat(e.target.value) || 0,
                      targetPieces: config.pieceRate?.targetPieces || 100,
                    },
                  })
                }
                className="apple-input rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-indigo-500 dark:focus:border-indigo-400 bg-white dark:bg-gray-800 px-4 py-3 text-lg"
                placeholder="0.00"
              />
            </div>
            <div className="space-y-3">
              <Label className="text-gray-700 dark:text-gray-300 font-semibold">Target Pieces per Month</Label>
              <Input
                type="number"
                value={config.pieceRate?.targetPieces || ""}
                onChange={(e) =>
                  updateConfig({
                    pieceRate: {
                      ratePerPiece: config.pieceRate?.ratePerPiece || 0,
                      targetPieces: Number.parseInt(e.target.value) || 100,
                    },
                  })
                }
                className="apple-input rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-indigo-500 dark:focus:border-indigo-400 bg-white dark:bg-gray-800 px-4 py-3 text-lg"
                placeholder="100"
              />
            </div>
          </div>
        )}

        {salaryType === "weight-based" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label className="text-gray-700 dark:text-gray-300 font-semibold">Rate per KG (₹)</Label>
              <Input
                type="number"
                step="0.01"
                value={config.weightBased?.ratePerKg || ""}
                onChange={(e) =>
                  updateConfig({
                    weightBased: {
                      ratePerKg: Number.parseFloat(e.target.value) || 0,
                      targetWeight: config.weightBased?.targetWeight || 1000,
                    },
                  })
                }
                className="apple-input rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-indigo-500 dark:focus:border-indigo-400 bg-white dark:bg-gray-800 px-4 py-3 text-lg"
                placeholder="0.00"
              />
            </div>
            <div className="space-y-3">
              <Label className="text-gray-700 dark:text-gray-300 font-semibold">Target Weight per Month (KG)</Label>
              <Input
                type="number"
                value={config.weightBased?.targetWeight || ""}
                onChange={(e) =>
                  updateConfig({
                    weightBased: {
                      ratePerKg: config.weightBased?.ratePerKg || 0,
                      targetWeight: Number.parseInt(e.target.value) || 1000,
                    },
                  })
                }
                className="apple-input rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-indigo-500 dark:focus:border-indigo-400 bg-white dark:bg-gray-800 px-4 py-3 text-lg"
                placeholder="1000"
              />
            </div>
          </div>
        )}

        {salaryType === "meter-based" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label className="text-gray-700 dark:text-gray-300 font-semibold">Rate per Meter (₹)</Label>
              <Input
                type="number"
                step="0.01"
                value={config.meterBased?.ratePerMeter || ""}
                onChange={(e) =>
                  updateConfig({
                    meterBased: {
                      ratePerMeter: Number.parseFloat(e.target.value) || 0,
                      targetMeters: config.meterBased?.targetMeters || 1000,
                    },
                  })
                }
                className="apple-input rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-indigo-500 dark:focus:border-indigo-400 bg-white dark:bg-gray-800 px-4 py-3 text-lg"
                placeholder="0.00"
              />
            </div>
            <div className="space-y-3">
              <Label className="text-gray-700 dark:text-gray-300 font-semibold">Target Meters per Month</Label>
              <Input
                type="number"
                value={config.meterBased?.targetMeters || ""}
                onChange={(e) =>
                  updateConfig({
                    meterBased: {
                      ratePerMeter: config.meterBased?.ratePerMeter || 0,
                      targetMeters: Number.parseInt(e.target.value) || 1000,
                    },
                  })
                }
                className="apple-input rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-indigo-500 dark:focus:border-indigo-400 bg-white dark:bg-gray-800 px-4 py-3 text-lg"
                placeholder="1000"
              />
            </div>
          </div>
        )}

        {salaryType === "dynamic-date" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-gray-700 dark:text-gray-300 font-semibold">Base Amount (₹)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={config.dynamicDate?.baseAmount || ""}
                  onChange={(e) =>
                    updateConfig({
                      dynamicDate: {
                        baseAmount: Number.parseFloat(e.target.value) || 0,
                        bonusRate: config.dynamicDate?.bonusRate || 0,
                        startDate: config.dynamicDate?.startDate || "",
                        endDate: config.dynamicDate?.endDate || "",
                        paymentFrequency: config.dynamicDate?.paymentFrequency || "monthly",
                      },
                    })
                  }
                  className="apple-input rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-indigo-500 dark:focus:border-indigo-400 bg-white dark:bg-gray-800 px-4 py-3 text-lg"
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-3">
                <Label className="text-gray-700 dark:text-gray-300 font-semibold">Bonus Rate (%)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={config.dynamicDate?.bonusRate || ""}
                  onChange={(e) =>
                    updateConfig({
                      dynamicDate: {
                        baseAmount: config.dynamicDate?.baseAmount || 0,
                        bonusRate: Number.parseFloat(e.target.value) || 0,
                        startDate: config.dynamicDate?.startDate || "",
                        endDate: config.dynamicDate?.endDate || "",
                        paymentFrequency: config.dynamicDate?.paymentFrequency || "monthly",
                      },
                    })
                  }
                  className="apple-input rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-indigo-500 dark:focus:border-indigo-400 bg-white dark:bg-gray-800 px-4 py-3 text-lg"
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-gray-700 dark:text-gray-300 font-semibold">Start Date</Label>
                <Input
                  type="date"
                  value={config.dynamicDate?.startDate || ""}
                  onChange={(e) =>
                    updateConfig({
                      dynamicDate: {
                        baseAmount: config.dynamicDate?.baseAmount || 0,
                        bonusRate: config.dynamicDate?.bonusRate || 0,
                        startDate: e.target.value,
                        endDate: config.dynamicDate?.endDate || "",
                        paymentFrequency: config.dynamicDate?.paymentFrequency || "monthly",
                      },
                    })
                  }
                  className="apple-input rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-indigo-500 dark:focus:border-indigo-400 bg-white dark:bg-gray-800 px-4 py-3 text-lg"
                />
              </div>
              <div className="space-y-3">
                <Label className="text-gray-700 dark:text-gray-300 font-semibold">End Date</Label>
                <Input
                  type="date"
                  value={config.dynamicDate?.endDate || ""}
                  onChange={(e) =>
                    updateConfig({
                      dynamicDate: {
                        baseAmount: config.dynamicDate?.baseAmount || 0,
                        bonusRate: config.dynamicDate?.bonusRate || 0,
                        startDate: config.dynamicDate?.startDate || "",
                        endDate: e.target.value,
                        paymentFrequency: config.dynamicDate?.paymentFrequency || "monthly",
                      },
                    })
                  }
                  className="apple-input rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-indigo-500 dark:focus:border-indigo-400 bg-white dark:bg-gray-800 px-4 py-3 text-lg"
                />
              </div>
            </div>
            <div className="space-y-3">
              <Label className="text-gray-700 dark:text-gray-300 font-semibold">Payment Frequency</Label>
              <Select
                value={config.dynamicDate?.paymentFrequency || "monthly"}
                onValueChange={(value: "weekly" | "bi-weekly" | "monthly") =>
                  updateConfig({
                    dynamicDate: {
                      baseAmount: config.dynamicDate?.baseAmount || 0,
                      bonusRate: config.dynamicDate?.bonusRate || 0,
                      startDate: config.dynamicDate?.startDate || "",
                      endDate: config.dynamicDate?.endDate || "",
                      paymentFrequency: value,
                    },
                  })
                }
              >
                <SelectTrigger className="apple-input rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-indigo-500 dark:focus:border-indigo-400 bg-white dark:bg-gray-800 px-4 py-3 text-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="apple-card rounded-xl border-0 shadow-2xl">
                  <SelectItem value="weekly" className="py-3 px-4">
                    📅 Weekly
                  </SelectItem>
                  <SelectItem value="bi-weekly" className="py-3 px-4">
                    📅 Bi-weekly
                  </SelectItem>
                  <SelectItem value="monthly" className="py-3 px-4">
                    📅 Monthly
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
