"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Employee, DirectPayment } from "@/types/employee"
import { Smartphone, Building, Send, CheckCircle, AlertCircle, Loader2, Calendar, FileText } from "lucide-react"
import { formatCurrency } from "@/utils/salary-calculator"
import { useAuth } from "@/contexts/auth-context"

interface DirectPaymentDialogProps {
  employee: Employee
  onClose: () => void
  onPaymentInitiated: (payment: DirectPayment) => void
}

export function DirectPaymentDialog({ employee, onClose, onPaymentInitiated }: DirectPaymentDialogProps) {
  const [amount, setAmount] = useState("")
  const [paymentType, setPaymentType] = useState<"salary" | "bonus" | "advance" | "reimbursement">("salary")
  // Safely access preferredMethod, defaulting to "bank" if paymentDetails is undefined
  const preferredMethod = employee.paymentDetails?.preferredMethod ?? "bank"
  const [paymentMethod, setPaymentMethod] = useState<"bank" | "upi">(preferredMethod)
  const [reason, setReason] = useState("")
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split("T")[0])
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  const { user } = useAuth()

  const handlePaymentSubmit = async () => {
    if (!amount || Number.parseFloat(amount) <= 0) return

    setIsProcessing(true)
    setPaymentStatus("processing")
    setErrorMessage("")

    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 3000))

      const payment: DirectPayment = {
        id: crypto.randomUUID(),
        employeeId: employee.id,
        amount: Number.parseFloat(amount),
        type: paymentType,
        method: paymentMethod,
        status: "processing",
        reason: reason || `${paymentType} payment`,
        scheduledDate,
        createdAt: new Date().toISOString(),
        createdBy: user?.uid || "unknown",
      }

      // Simulate payment success (85% success rate)
      if (Math.random() > 0.15) {
        const completedPayment = {
          ...payment,
          status: "completed" as const,
          transactionId: `TXN${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
          completedDate: new Date().toISOString(),
        }

        setPaymentStatus("success")
        onPaymentInitiated(completedPayment)

        setTimeout(() => {
          onClose()
        }, 2000)
      } else {
        throw new Error("Payment failed due to insufficient funds or network error")
      }
    } catch (error) {
      setPaymentStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "Payment failed")
    } finally {
      setIsProcessing(false)
    }
  }

  const getPaymentMethodDetails = () => {
    // Add optional chaining to employee.paymentDetails
    if (paymentMethod === "bank" && employee.paymentDetails?.bankAccount) {
      const bank = employee.paymentDetails.bankAccount
      return (
        <div className="apple-card-inner rounded-xl p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30 apple-hover">
          <div className="flex items-center space-x-3 mb-3">
            <Building className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="font-semibold text-blue-800 dark:text-blue-300">Bank Transfer</span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-blue-700 dark:text-blue-400">Account Holder:</span>
              <span className="font-medium text-blue-900 dark:text-blue-200">{bank.accountHolderName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700 dark:text-blue-400">Bank:</span>
              <span className="font-medium text-blue-900 dark:text-blue-200">{bank.bankName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700 dark:text-blue-400">Account:</span>
              <span className="font-medium text-blue-900 dark:text-blue-200">****{bank.accountNumber.slice(-4)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700 dark:text-blue-400">IFSC:</span>
              <span className="font-medium text-blue-900 dark:text-blue-200">{bank.ifscCode}</span>
            </div>
          </div>
        </div>
      )
    }

    // Add optional chaining to employee.paymentDetails
    if (paymentMethod === "upi" && employee.paymentDetails?.upi) {
      const upi = employee.paymentDetails.upi
      return (
        <div className="apple-card-inner rounded-xl p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30 apple-hover">
          <div className="flex items-center space-x-3 mb-3">
            <Smartphone className="w-5 h-5 text-green-600 dark:text-green-400" />
            <span className="font-semibold text-green-800 dark:text-green-300">UPI Transfer</span>
            {upi.verified && <Badge className="bg-green-500 text-white text-xs">Verified</Badge>}
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-green-700 dark:text-green-400">UPI ID:</span>
            <span className="font-medium text-green-900 dark:text-green-200">{upi.upiId}</span>
          </div>
        </div>
      )
    }

    return (
      <div className="apple-card-inner rounded-xl p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 apple-hover">
        <div className="flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
          <span className="font-semibold text-red-800 dark:text-red-300">Payment details not configured</span>
        </div>
        <p className="text-sm text-red-700 dark:text-red-400 mt-2">
          Please update employee payment details before making a payment.
        </p>
      </div>
    )
  }

  const getPaymentTypeColor = (type: string) => {
    switch (type) {
      case "salary":
        return "bg-gradient-to-r from-blue-500 to-indigo-500"
      case "bonus":
        return "bg-gradient-to-r from-green-500 to-emerald-500"
      case "advance":
        return "bg-gradient-to-r from-yellow-500 to-orange-500"
      case "reimbursement":
        return "bg-gradient-to-r from-purple-500 to-pink-500"
      default:
        return "bg-gradient-to-r from-gray-500 to-slate-500"
    }
  }

  if (paymentStatus === "success") {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-md apple-modal">
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Payment Initiated!</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Payment of {formatCurrency(Number.parseFloat(amount))} has been successfully initiated to {employee.name}.
            </p>
            <div className="apple-card-inner rounded-xl p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
              <div className="flex items-center justify-center space-x-2">
                <Send className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="font-semibold text-green-800 dark:text-green-300">Processing Transfer</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  const hasPaymentDetails =
    (paymentMethod === "bank" && employee.paymentDetails?.bankAccount) ||
    (paymentMethod === "upi" && employee.paymentDetails?.upi)

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto apple-modal">
        <DialogHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 -mx-6 -mt-6 mb-6 rounded-t-lg">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <Send className="w-6 h-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold">Direct Payment</DialogTitle>
              <DialogDescription className="text-indigo-100">
                Send payment directly to {employee.name}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Employee Info */}
          <Card className="apple-card-inner rounded-2xl border-0 shadow-lg apple-hover">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 rounded-t-2xl">
              <CardTitle className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold">
                  {employee.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </div>
                <div>
                  <span className="text-lg">{employee.name}</span>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-normal">
                    {employee.position} • {employee.department}
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
          </Card>

          {/* Payment Details Form */}
          <Card className="apple-card-inner rounded-2xl border-0 shadow-lg apple-hover">
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (₹)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="apple-input rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-indigo-500 dark:focus:border-indigo-400 px-4 py-3 text-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentType">Payment Type</Label>
                  <Select value={paymentType} onValueChange={(value: any) => setPaymentType(value)}>
                    <SelectTrigger className="apple-input rounded-xl border-2 border-gray-200 dark:border-gray-700 px-4 py-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="salary">💰 Salary Payment</SelectItem>
                      <SelectItem value="bonus">🎉 Bonus</SelectItem>
                      <SelectItem value="advance">⚡ Advance</SelectItem>
                      <SelectItem value="reimbursement">📋 Reimbursement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <Select value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                    <SelectTrigger className="apple-input rounded-xl border-2 border-gray-200 dark:border-gray-700 px-4 py-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank">🏦 Bank Transfer</SelectItem>
                      <SelectItem value="upi">📱 UPI Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scheduledDate">Scheduled Date</Label>
                  <Input
                    id="scheduledDate"
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="apple-input rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-indigo-500 dark:focus:border-indigo-400 px-4 py-3"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason/Notes</Label>
                <Input
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={`${paymentType} payment for ${employee.name}`}
                  className="apple-input rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-indigo-500 dark:focus:border-indigo-400 px-4 py-3"
                />
              </div>

              {/* Payment Method Details */}
              {getPaymentMethodDetails()}

              {/* Payment Summary */}
              {amount && Number.parseFloat(amount) > 0 && (
                <div className="apple-card-inner rounded-xl p-6 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200 dark:border-indigo-800/30 apple-hover">
                  <h4 className="font-semibold text-indigo-800 dark:text-indigo-300 mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Payment Summary
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-indigo-700 dark:text-indigo-400">Amount:</span>
                      <span className="text-2xl font-bold text-indigo-900 dark:text-indigo-200">
                        {formatCurrency(Number.parseFloat(amount))}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-indigo-700 dark:text-indigo-400">Type:</span>
                      <Badge className={`${getPaymentTypeColor(paymentType)} text-white rounded-xl px-3 py-1`}>
                        {paymentType.charAt(0).toUpperCase() + paymentType.slice(1)}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-indigo-700 dark:text-indigo-400">Method:</span>
                      <span className="font-medium text-indigo-900 dark:text-indigo-200 flex items-center">
                        {paymentMethod === "bank" ? (
                          <Building className="w-4 h-4 mr-1" />
                        ) : (
                          <Smartphone className="w-4 h-4 mr-1" />
                        )}
                        {paymentMethod === "bank" ? "Bank Transfer" : "UPI Transfer"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-indigo-700 dark:text-indigo-400">Scheduled:</span>
                      <span className="font-medium text-indigo-900 dark:text-indigo-200 flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(scheduledDate).toLocaleDateString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {paymentStatus === "error" && (
                <div className="apple-card-inner rounded-xl p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 apple-hover">
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                    <div>
                      <p className="font-semibold text-red-800 dark:text-red-300">Payment Failed</p>
                      <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              onClick={handlePaymentSubmit}
              disabled={!amount || Number.parseFloat(amount) <= 0 || isProcessing || !hasPaymentDetails}
              className="flex-1 apple-button bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-4 rounded-2xl text-lg font-semibold transition-all duration-300 hover:scale-105 shadow-2xl disabled:hover:scale-100"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing Payment...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Send Payment
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isProcessing}
              className="apple-button-outline px-8 py-4 border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 rounded-2xl font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-50 bg-transparent"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
