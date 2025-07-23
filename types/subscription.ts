export type SubscriptionTier = "free" | "pro"
export type SubscriptionStatus = "active" | "cancelled" | "past_due" | "unpaid"

export interface Subscription {
  id: string
  userId: string
  tier: SubscriptionTier
  status: SubscriptionStatus
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  priceId: string
  customerId: string
  createdAt: string
  updatedAt: string
}

export interface SubscriptionPayment {
  id: string
  subscriptionId: string
  amount: number
  currency: "INR"
  status: "pending" | "paid" | "failed"
  paymentMethod: string
  transactionId?: string
  paidAt?: string
  createdAt: string
}

export interface SubscriptionLimits {
  maxEmployees: number
  maxAdvances: number
  workRecordsEnabled: boolean
  attendanceHistoryMonths: number
  exportEnabled: boolean
  advancedReportsEnabled: boolean
  directPaymentsEnabled: boolean
}

export const SUBSCRIPTION_LIMITS: Record<SubscriptionTier, SubscriptionLimits> = {
  free: {
    maxEmployees: 5,
    maxAdvances: 10,
    workRecordsEnabled: false,
    attendanceHistoryMonths: 1,
    exportEnabled: false,
    advancedReportsEnabled: false,
    directPaymentsEnabled: false,
  },
  pro: {
    maxEmployees: Number.POSITIVE_INFINITY,
    maxAdvances: Number.POSITIVE_INFINITY,
    workRecordsEnabled: true,
    attendanceHistoryMonths: 12,
    exportEnabled: true,
    advancedReportsEnabled: true,
    directPaymentsEnabled: true,
  },
}

export interface SubscriptionFeature {
  name: string
  free: boolean | string
  pro: boolean | string
  icon: string
}

export const SUBSCRIPTION_FEATURES: SubscriptionFeature[] = [
  {
    name: "Employee Management",
    free: "Up to 5 employees",
    pro: "Unlimited employees",
    icon: "👥",
  },
  {
    name: "Salary Advances",
    free: "Up to 10 advances",
    pro: "Unlimited advances",
    icon: "💰",
  },
  {
    name: "Work Records Tracking",
    free: false,
    pro: true,
    icon: "📊",
  },
  {
    name: "Direct Employee Payments",
    free: false,
    pro: true,
    icon: "💸",
  },
  {
    name: "Attendance History",
    free: "1 month",
    pro: "12 months",
    icon: "📅",
  },
  {
    name: "Data Export",
    free: false,
    pro: true,
    icon: "📤",
  },
  {
    name: "Advanced Reports",
    free: false,
    pro: true,
    icon: "📈",
  },
  {
    name: "Priority Support",
    free: false,
    pro: true,
    icon: "🎧",
  },
]

export const SUBSCRIPTION_PRICES = {
  pro: {
    monthly: 999,
    yearly: 9999, // 2 months free
  },
}
