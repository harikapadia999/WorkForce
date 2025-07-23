"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Employee } from "@/types/employee"
import type { AttendanceRecord } from "@/types/attendance"
import {
  Calendar,
  Mail,
  Phone,
  Building,
  User,
  X,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  UserX,
  Clock,
  AlertTriangle,
  TrendingUp,
  Award,
  Target,
  Zap,
} from "lucide-react"
import { calculateNetSalary, formatCurrency } from "@/utils/salary-calculator"

interface EmployeeProfileProps {
  employee: Employee
  onClose: () => void
}

export function EmployeeProfile({ employee, onClose }: EmployeeProfileProps) {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [calendarView, setCalendarView] = useState<"yearly" | "monthly">("yearly")

  const getAttendanceCalendar = (year: number, month: number) => {
    const calendar = []
    const startDate = new Date(year, month, 1)
    const endDate = new Date(year, month + 1, 0) // Last day of the month

    // Add empty cells for days before the first day of the month
    const firstDayOfWeek = startDate.getDay()
    for (let i = 0; i < firstDayOfWeek; i++) {
      calendar.push(null)
    }

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split("T")[0]
      const record = employee.attendanceRecords?.find((r) => r.date === dateStr)

      calendar.push({
        date: new Date(d),
        dateStr,
        record,
        dayOfWeek: d.getDay(),
        isToday: dateStr === new Date().toISOString().split("T")[0],
        isWeekend: d.getDay() === 0 || d.getDay() === 6,
      })
    }

    return calendar
  }

  const getStatusColor = (record?: AttendanceRecord) => {
    if (!record) return "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"

    switch (record.status) {
      case "present":
        return "bg-gradient-to-br from-green-400 to-emerald-500 border-green-300 shadow-green-200 dark:shadow-green-900/30"
      case "absent":
        return "bg-gradient-to-br from-red-400 to-rose-500 border-red-300 shadow-red-200 dark:shadow-red-900/30"
      case "half-day":
        return "bg-gradient-to-br from-yellow-400 to-orange-500 border-yellow-300 shadow-yellow-200 dark:shadow-yellow-900/30"
      case "early-leave":
        return "bg-gradient-to-br from-orange-400 to-red-500 border-orange-300 shadow-orange-200 dark:shadow-orange-900/30"
      case "late-come":
        return "bg-gradient-to-br from-blue-400 to-indigo-500 border-blue-300 shadow-blue-200 dark:shadow-blue-900/30"
      default:
        return "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
    }
  }

  const getStatusIcon = (record?: AttendanceRecord) => {
    if (!record) return null

    const iconClass = "w-3 h-3 text-white drop-shadow-sm"

    switch (record.status) {
      case "present":
        return <UserCheck className={iconClass} />
      case "absent":
        return <UserX className={iconClass} />
      case "half-day":
        return <Clock className={iconClass} />
      case "early-leave":
        return <AlertTriangle className={iconClass} />
      case "late-come":
        return <Clock className={iconClass} />
      default:
        return null
    }
  }

  const getAttendanceStats = (year: number) => {
    const yearRecords = employee.attendanceRecords?.filter((r) => new Date(r.date).getFullYear() === year) || []

    return {
      present: yearRecords.filter((r) => r.status === "present").length,
      absent: yearRecords.filter((r) => r.status === "absent").length,
      halfDay: yearRecords.filter((r) => r.status === "half-day").length,
      earlyLeave: yearRecords.filter((r) => r.status === "early-leave").length,
      lateCome: yearRecords.filter((r) => r.status === "late-come").length,
      total: yearRecords.length,
    }
  }

  const getMonthlyStats = (year: number, month: number) => {
    const monthRecords =
      employee.attendanceRecords?.filter((r) => {
        const recordDate = new Date(r.date)
        return recordDate.getFullYear() === year && recordDate.getMonth() === month
      }) || []

    return {
      present: monthRecords.filter((r) => r.status === "present").length,
      absent: monthRecords.filter((r) => r.status === "absent").length,
      halfDay: monthRecords.filter((r) => r.status === "half-day").length,
      earlyLeave: monthRecords.filter((r) => r.status === "early-leave").length,
      lateCome: monthRecords.filter((r) => r.status === "late-come").length,
      total: monthRecords.length,
    }
  }

  const getAttendancePercentage = (stats: any) => {
    if (stats.total === 0) return 0
    return Math.round((stats.present / stats.total) * 100)
  }

  // Add this function to get monthly attendance summary
  const getMonthlyAttendanceSummary = (year: number, month: number) => {
    const monthRecords =
      employee.attendanceRecords?.filter((r) => {
        const recordDate = new Date(r.date)
        return recordDate.getFullYear() === year && recordDate.getMonth() === month
      }) || []

    const totalDays = new Date(year, month + 1, 0).getDate()
    const workingDays = monthRecords.length
    const presentDays = monthRecords.filter((r) => r.status === "present").length
    const attendanceRate = workingDays > 0 ? Math.round((presentDays / workingDays) * 100) : 0

    return {
      totalRecords: workingDays,
      presentDays,
      attendanceRate,
      hasData: workingDays > 0,
    }
  }

  // Add this function to render mini month calendar
  const renderMiniMonth = (year: number, month: number) => {
    const monthStart = new Date(year, month, 1)
    const monthEnd = new Date(year, month + 1, 0)
    const startDate = new Date(monthStart)
    startDate.setDate(startDate.getDate() - monthStart.getDay())

    const days = []
    const currentDate = new Date(startDate)

    // Generate 6 weeks (42 days) for consistent grid
    for (let i = 0; i < 42; i++) {
      const dateStr = currentDate.toISOString().split("T")[0]
      const record = employee.attendanceRecords?.find((r) => r.date === dateStr)
      const isCurrentMonth = currentDate.getMonth() === month

      days.push({
        date: new Date(currentDate),
        dateStr,
        record,
        isCurrentMonth,
        day: currentDate.getDate(),
      })

      currentDate.setDate(currentDate.getDate() + 1)
    }

    return days
  }

  const calendar = getAttendanceCalendar(selectedYear, selectedMonth)
  const yearStats = getAttendanceStats(selectedYear)
  const monthStats = getMonthlyStats(selectedYear, selectedMonth)
  const attendancePercentage = getAttendancePercentage(monthStats)

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
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const navigateMonth = (direction: "prev" | "next") => {
    if (direction === "prev") {
      if (selectedMonth === 0) {
        setSelectedMonth(11)
        setSelectedYear(selectedYear - 1)
      } else {
        setSelectedMonth(selectedMonth - 1)
      }
    } else {
      if (selectedMonth === 11) {
        setSelectedMonth(0)
        setSelectedYear(selectedYear + 1)
      } else {
        setSelectedMonth(selectedMonth + 1)
      }
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto apple-modal">
        {/* Header */}
        <DialogHeader className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white p-8 -mx-6 -mt-6 mb-8 rounded-t-lg relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16"></div>
            <div className="absolute top-20 right-10 w-24 h-24 bg-white rounded-full"></div>
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-white rounded-full translate-x-20 translate-y-20"></div>
          </div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-sm shadow-2xl">
                  <span className="text-2xl font-bold text-white">
                    {employee.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </span>
                </div>
                <div>
                  <DialogTitle className="text-3xl font-bold mb-2">{employee.name}</DialogTitle>
                  <p className="text-indigo-100 text-lg">
                    {employee.position} • {employee.department}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-white/20 rounded-xl p-3 transition-all duration-300 hover:scale-105"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Award className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{attendancePercentage}%</p>
                    <p className="text-indigo-100 text-sm">This Month</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{monthStats.present}</p>
                    <p className="text-indigo-100 text-sm">Present Days</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{yearStats.total}</p>
                    <p className="text-indigo-100 text-sm">Total Records</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{formatCurrency(calculateNetSalary(employee))}</p>
                    <p className="text-indigo-100 text-sm">Net Salary</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-8">
          {/* Employee Details Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="apple-card-inner rounded-3xl border-0 shadow-xl apple-hover overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-t-3xl">
                <CardTitle className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <span>Personal Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl apple-hover">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                    <Mail className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{employee.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl apple-hover">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                    <Phone className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Phone</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{employee.phone}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl apple-hover">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center">
                    <Building className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Department</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{employee.department}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl apple-hover">
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Hire Date</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {new Date(employee.hireDate).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="apple-card-inner rounded-3xl border-0 shadow-xl apple-hover overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-t-3xl">
                <CardTitle className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold">₹</span>
                  </div>
                  <span>Salary Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800/30">
                  <p className="text-sm text-green-700 dark:text-green-400 mb-1">Salary Type</p>
                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl px-3 py-1 font-medium shadow-lg">
                    {employee.salaryType.replace("-", " ").toUpperCase()}
                  </Badge>
                </div>
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800/30">
                  <p className="text-sm text-blue-700 dark:text-blue-400 mb-2">Net Monthly Salary</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                    {formatCurrency(calculateNetSalary(employee))}
                  </p>
                </div>
                {employee.advances.filter((a) => a.status === "approved").length > 0 && (
                  <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800/30">
                    <p className="text-sm text-yellow-700 dark:text-yellow-400 mb-2">Outstanding Advances</p>
                    <p className="text-2xl font-bold text-yellow-800 dark:text-yellow-300">
                      {formatCurrency(
                        employee.advances.filter((a) => a.status === "approved").reduce((sum, a) => sum + a.amount, 0),
                      )}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Attendance Statistics */}
          <Card className="apple-card-inner rounded-3xl border-0 shadow-xl apple-hover overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <span>Attendance Statistics - {selectedYear}</span>
                </CardTitle>
                <Select
                  value={selectedYear.toString()}
                  onValueChange={(value) => setSelectedYear(Number.parseInt(value))}
                >
                  <SelectTrigger className="w-32 apple-input rounded-xl border-2 border-purple-200 dark:border-purple-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="apple-card rounded-xl border-0 shadow-2xl">
                    {[new Date().getFullYear(), new Date().getFullYear() - 1, new Date().getFullYear() - 2].map(
                      (year) => (
                        <SelectItem key={year} value={year.toString()} className="py-3 px-4">
                          {year}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <div className="apple-card-inner rounded-2xl p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800/30 apple-hover text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                    <UserCheck className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">{yearStats.present}</p>
                  <p className="text-sm font-medium text-green-700 dark:text-green-500">Present</p>
                </div>
                <div className="apple-card-inner rounded-2xl p-4 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border border-red-200 dark:border-red-800/30 apple-hover text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                    <UserX className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-3xl font-bold text-red-600 dark:text-red-400 mb-1">{yearStats.absent}</p>
                  <p className="text-sm font-medium text-red-700 dark:text-red-500">Absent</p>
                </div>
                <div className="apple-card-inner rounded-2xl p-4 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800/30 apple-hover text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mb-1">{yearStats.halfDay}</p>
                  <p className="text-sm font-medium text-yellow-700 dark:text-yellow-500">Half Day</p>
                </div>
                <div className="apple-card-inner rounded-2xl p-4 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border border-orange-200 dark:border-orange-800/30 apple-hover text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                    <AlertTriangle className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-1">{yearStats.earlyLeave}</p>
                  <p className="text-sm font-medium text-orange-700 dark:text-orange-500">Early Leave</p>
                </div>
                <div className="apple-card-inner rounded-2xl p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800/30 apple-hover text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">{yearStats.lateCome}</p>
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-500">Late Come</p>
                </div>
                <div className="apple-card-inner rounded-2xl p-4 bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20 border border-gray-200 dark:border-gray-800/30 apple-hover text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-slate-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-3xl font-bold text-gray-600 dark:text-gray-400 mb-1">{yearStats.total}</p>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-500">Total Days</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Attendance Calendar */}
          <Card className="apple-card-inner rounded-3xl border-0 shadow-xl apple-hover overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-900/20 dark:via-purple-900/20 dark:to-pink-900/20 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span>Attendance Calendar</span>
                    <p className="text-sm font-normal text-gray-600 dark:text-gray-400 mt-1">
                      {calendarView === "yearly"
                        ? `${selectedYear} - Full year overview`
                        : `${attendancePercentage}% attendance this month`}
                    </p>
                  </div>
                </CardTitle>

                <div className="flex items-center space-x-4">
                  {/* View Toggle */}
                  <div className="flex items-center bg-white/50 dark:bg-gray-800/50 rounded-xl p-1 border border-indigo-200 dark:border-indigo-700">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCalendarView("yearly")}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                        calendarView === "yearly"
                          ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg"
                          : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                      }`}
                    >
                      Year
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCalendarView("monthly")}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                        calendarView === "monthly"
                          ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg"
                          : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                      }`}
                    >
                      Month
                    </Button>
                  </div>

                  {calendarView === "yearly" ? (
                    /* Year Navigation */
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedYear(selectedYear - 1)}
                        className="apple-button-outline w-10 h-10 p-0 rounded-xl border-2 border-indigo-200 dark:border-indigo-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-300 hover:scale-105"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <div className="text-center min-w-[80px]">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{selectedYear}</h3>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedYear(selectedYear + 1)}
                        className="apple-button-outline w-10 h-10 p-0 rounded-xl border-2 border-indigo-200 dark:border-indigo-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-300 hover:scale-105"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    /* Month Navigation */
                    <div className="flex items-center space-x-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigateMonth("prev")}
                        className="apple-button-outline w-10 h-10 p-0 rounded-xl border-2 border-indigo-200 dark:border-indigo-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-300 hover:scale-105"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>

                      <div className="text-center min-w-[140px]">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{months[selectedMonth]}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{selectedYear}</p>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigateMonth("next")}
                        className="apple-button-outline w-10 h-10 p-0 rounded-xl border-2 border-indigo-200 dark:border-indigo-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-300 hover:scale-105"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Legend */}
              <CardDescription className="mt-4">
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg shadow-sm"></div>
                    <span className="font-medium">Present</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-gradient-to-br from-red-400 to-rose-500 rounded-lg shadow-sm"></div>
                    <span className="font-medium">Absent</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg shadow-sm"></div>
                    <span className="font-medium">Half Day</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg shadow-sm"></div>
                    <span className="font-medium">Early Leave</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg shadow-sm"></div>
                    <span className="font-medium">Late Come</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-gray-100 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-lg"></div>
                    <span className="font-medium">No Record</span>
                  </div>
                </div>
              </CardDescription>
            </CardHeader>

            <CardContent className="p-8">
              {calendarView === "yearly" ? (
                /* Yearly Calendar View */
                <div className="apple-card-inner rounded-2xl p-6 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-inner">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {months.map((monthName, monthIndex) => {
                      const monthSummary = getMonthlyAttendanceSummary(selectedYear, monthIndex)
                      const miniMonthDays = renderMiniMonth(selectedYear, monthIndex)

                      return (
                        <div
                          key={monthIndex}
                          onClick={() => {
                            setSelectedMonth(monthIndex)
                            setCalendarView("monthly")
                          }}
                          className="apple-card-inner rounded-2xl p-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl group"
                        >
                          {/* Month Header */}
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                              {monthName}
                            </h4>
                            {monthSummary.hasData && (
                              <div className="flex items-center space-x-1">
                                <div
                                  className={`w-3 h-3 rounded-full ${
                                    monthSummary.attendanceRate >= 90
                                      ? "bg-green-500"
                                      : monthSummary.attendanceRate >= 75
                                        ? "bg-yellow-500"
                                        : monthSummary.attendanceRate >= 50
                                          ? "bg-orange-500"
                                          : "bg-red-500"
                                  }`}
                                ></div>
                                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                  {monthSummary.attendanceRate}%
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Mini Calendar Grid */}
                          <div className="grid grid-cols-7 gap-1 mb-3">
                            {/* Day Headers */}
                            {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                              <div
                                key={i}
                                className="text-center text-xs font-medium text-gray-500 dark:text-gray-500 py-1"
                              >
                                {day}
                              </div>
                            ))}

                            {/* Calendar Days */}
                            {miniMonthDays.slice(0, 35).map((day, dayIndex) => (
                              <div
                                key={dayIndex}
                                className={`
                                  aspect-square flex items-center justify-center text-xs rounded-md transition-all duration-200
                                  ${
                                    !day.isCurrentMonth
                                      ? "text-gray-300 dark:text-gray-600"
                                      : day.record
                                        ? getStatusColor(day.record)
                                            .replace("border-", "border-transparent ")
                                            .replace("shadow-", "")
                                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                                  }
                                  ${day.record ? "text-white font-medium" : ""}
                                `}
                              >
                                {day.day}
                              </div>
                            ))}
                          </div>

                          {/* Month Summary */}
                          {monthSummary.hasData ? (
                            <div className="text-center">
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                {monthSummary.presentDays}/{monthSummary.totalRecords} days
                              </p>
                            </div>
                          ) : (
                            <div className="text-center">
                              <p className="text-xs text-gray-400 dark:text-gray-500">No records</p>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  {/* Yearly Summary */}
                  <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="apple-card-inner rounded-xl p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800/30 text-center apple-hover">
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">{yearStats.present}</p>
                      <p className="text-sm font-medium text-green-700 dark:text-green-500">Present</p>
                    </div>
                    <div className="apple-card-inner rounded-xl p-4 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border border-red-200 dark:border-red-800/30 text-center apple-hover">
                      <p className="text-2xl font-bold text-red-600 dark:text-red-400 mb-1">{yearStats.absent}</p>
                      <p className="text-sm font-medium text-red-700 dark:text-red-500">Absent</p>
                    </div>
                    <div className="apple-card-inner rounded-xl p-4 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800/30 text-center apple-hover">
                      <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mb-1">
                        {yearStats.halfDay}
                      </p>
                      <p className="text-sm font-medium text-yellow-700 dark:text-yellow-500">Half Day</p>
                    </div>
                    <div className="apple-card-inner rounded-xl p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800/30 text-center apple-hover">
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">{yearStats.lateCome}</p>
                      <p className="text-sm font-medium text-blue-700 dark:text-blue-500">Late Come</p>
                    </div>
                    <div className="apple-card-inner rounded-xl p-4 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200 dark:border-indigo-800/30 text-center apple-hover">
                      <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                        {yearStats.total > 0 ? Math.round((yearStats.present / yearStats.total) * 100) : 0}%
                      </p>
                      <p className="text-sm font-medium text-indigo-700 dark:text-indigo-500">Overall</p>
                    </div>
                  </div>
                </div>
              ) : (
                /* Monthly Calendar View - existing code */
                <div className="apple-card-inner rounded-2xl p-6 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-inner">
                  {/* Days of Week Header */}
                  <div className="grid grid-cols-7 gap-2 mb-4">
                    {daysOfWeek.map((day) => (
                      <div
                        key={day}
                        className="text-center py-3 text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider"
                      >
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar Days */}
                  <div className="grid grid-cols-7 gap-2">
                    {calendar.map((day, index) => (
                      <div
                        key={index}
                        className={`
                          relative aspect-square flex items-center justify-center rounded-2xl border-2 transition-all duration-300 hover:scale-105 cursor-pointer group
                          ${day ? getStatusColor(day.record) : "bg-transparent border-transparent"}
                          ${day?.isToday ? "ring-4 ring-indigo-300 dark:ring-indigo-600 ring-opacity-50" : ""}
                          ${day?.isWeekend && !day?.record ? "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700" : ""}
                          ${day ? "shadow-lg hover:shadow-xl" : ""}
                        `}
                        title={
                          day
                            ? `${day.date.toLocaleDateString("en-IN", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}: ${day.record?.status ? day.record.status.replace("-", " ").toUpperCase() : "No record"}`
                            : ""
                        }
                      >
                        {day && (
                          <>
                            {/* Date Number */}
                            <span
                              className={`
                              text-lg font-bold z-10 relative
                              ${day.record ? "text-white drop-shadow-sm" : "text-gray-700 dark:text-gray-300"}
                              ${day.isToday ? "text-2xl" : ""}
                            `}
                            >
                              {day.date.getDate()}
                            </span>

                            {/* Status Icon */}
                            {day.record && (
                              <div className="absolute top-1 right-1 z-10">{getStatusIcon(day.record)}</div>
                            )}

                            {/* Today Indicator */}
                            {day.isToday && (
                              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-indigo-500 rounded-full shadow-lg"></div>
                            )}

                            {/* Hover Effect */}
                            <div className="absolute inset-0 bg-white dark:bg-gray-800 opacity-0 group-hover:opacity-20 rounded-2xl transition-opacity duration-300"></div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Monthly Summary */}
                  <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="apple-card-inner rounded-xl p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800/30 text-center apple-hover">
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">{monthStats.present}</p>
                      <p className="text-sm font-medium text-green-700 dark:text-green-500">Present</p>
                    </div>
                    <div className="apple-card-inner rounded-xl p-4 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border border-red-200 dark:border-red-800/30 text-center apple-hover">
                      <p className="text-2xl font-bold text-red-600 dark:text-red-400 mb-1">{monthStats.absent}</p>
                      <p className="text-sm font-medium text-red-700 dark:text-red-500">Absent</p>
                    </div>
                    <div className="apple-card-inner rounded-xl p-4 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800/30 text-center apple-hover">
                      <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mb-1">
                        {monthStats.halfDay + monthStats.earlyLeave + monthStats.lateCome}
                      </p>
                      <p className="text-sm font-medium text-yellow-700 dark:text-yellow-500">Partial</p>
                    </div>
                    <div className="apple-card-inner rounded-xl p-4 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200 dark:border-indigo-800/30 text-center apple-hover">
                      <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                        {attendancePercentage}%
                      </p>
                      <p className="text-sm font-medium text-indigo-700 dark:text-indigo-500">Attendance</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
