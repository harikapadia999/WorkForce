export interface AttendanceRecord {
  id: string
  employeeId: string
  date: string
  status: AttendanceStatus
  checkIn?: string
  checkOut?: string
  notes?: string
  createdAt: string
}

export type AttendanceStatus = "present" | "absent" | "half-day" | "early-leave" | "late-come"

export interface AttendanceSummary {
  present: number
  absent: number
  halfDay: number
  earlyLeave: number
  lateCome: number
  total: number
}
