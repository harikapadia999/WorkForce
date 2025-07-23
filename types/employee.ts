import type { AttendanceRecord } from "./attendance"

export interface Employee {
  id: string
  name: string
  email: string
  phone: string
  position: string
  department: string
  hireDate: string
  salaryType: SalaryType
  salaryConfig: SalaryConfig
  advances: Advance[]
  attendanceRecords: AttendanceRecord[]
  workRecords: WorkRecord[]
  paymentDetails: PaymentDetails
  createdAt: string
  updatedAt: string
  lastAdvanceProcessedMonth?: string // Added to track when advances were last processed for carry-forward
}

export interface PaymentDetails {
  bankAccount?: {
    accountNumber: string
    ifscCode: string
    bankName: string
    accountHolderName: string
  }
  upi?: {
    upiId: string
    verified: boolean
  }
  preferredMethod: "bank" | "upi"
}

export interface DirectPayment {
  id: string
  employeeId: string
  amount: number
  type: "salary" | "bonus" | "advance" | "reimbursement"
  method: "bank" | "upi"
  status: "pending" | "processing" | "completed" | "failed"
  transactionId?: string
  reason: string
  scheduledDate: string
  completedDate?: string
  createdAt: string
  createdBy: string
}

export type SalaryType = "hourly" | "daily" | "monthly" | "piece-rate" | "weight-based" | "meter-based" | "dynamic-date"

export interface SalaryConfig {
  hourly?: {
    rate: number
    hoursPerWeek: number
  }
  daily?: {
    rate: number
    workingDays: number
    hasPerUnitWork?: boolean
    perUnitRates?: {
      kg?: number
      meter?: number
      piece?: number
    }
  }
  monthly?: {
    amount: number
  }
  pieceRate?: {
    ratePerPiece: number
    targetPieces: number
  }
  weightBased?: {
    ratePerKg: number
    targetWeight: number
  }
  meterBased?: {
    ratePerMeter: number
    targetMeters: number
  }
  dynamicDate?: {
    baseAmount: number
    bonusRate: number
    startDate: string
    endDate: string
    paymentFrequency: "weekly" | "bi-weekly" | "monthly"
  }
}

export interface Advance {
  id: string
  amount: number
  date: string
  reason: string
  status: "pending" | "approved" | "deducted" | "carried-forward"
  carryForward?: boolean
  originalAmount?: number
}

export interface WorkRecord {
  id: string
  employeeId: string
  date: string
  quantity: number
  unit: "kg" | "meter" | "piece"
  rate: number
  totalAmount: number
  notes?: string
  createdAt: string
}
