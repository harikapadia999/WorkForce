"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import type { Employee } from "@/types/employee"
import type { AttendanceStatus } from "@/types/attendance"
import { useAttendance } from "@/hooks/useAttendance"
import { Users, UserCheck, UserX, Clock, AlertTriangle, CheckCircle2, Calendar } from "lucide-react"

interface AttendanceTrackerProps {
  employees: Employee[]
  updateEmployee: (id: string, updates: Partial<Employee>) => void
}

export function AttendanceTracker({ employees, updateEmployee }: AttendanceTrackerProps) {
  const { selectedDate, setSelectedDate, addAttendanceRecord, getAttendanceSummary } = useAttendance(
    employees,
    updateEmployee,
  )

  const summary = getAttendanceSummary(selectedDate)

  const handleQuickAttendance = (employeeId: string, status: AttendanceStatus) => {
    addAttendanceRecord(employeeId, status)
  }

  const markAllPresent = () => {
    employees.forEach((employee) => {
      const existingRecord = employee.attendanceRecords?.find((r) => r.date === selectedDate)
      if (!existingRecord) {
        handleQuickAttendance(employee.id, "present")
      }
    })
  }

  const getStatusColor = (status: AttendanceStatus) => {
    switch (status) {
      case "present":
        return "bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600"
      case "absent":
        return "bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600"
      case "half-day":
        return "bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600"
      case "early-leave":
        return "bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600"
      case "late-come":
        return "bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600"
      default:
        return "bg-gradient-to-r from-gray-400 to-gray-500 text-white hover:from-gray-500 hover:to-gray-600"
    }
  }

  const getStatusIcon = (status: AttendanceStatus) => {
    switch (status) {
      case "present":
        return <UserCheck className="w-4 h-4" />
      case "absent":
        return <UserX className="w-4 h-4" />
      case "half-day":
        return <Clock className="w-4 h-4" />
      case "early-leave":
        return <AlertTriangle className="w-4 h-4" />
      case "late-come":
        return <Clock className="w-4 h-4" />
      default:
        return <Users className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-8">
      {/* Apple-style Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
        <Card className="apple-card rounded-2xl border-0 shadow-lg apple-hover apple-float overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">
                  {summary.present}
                </p>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Present</p>
                <p className="text-xs text-gray-500 dark:text-gray-500">Today</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                <UserCheck className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="apple-card rounded-2xl border-0 shadow-lg apple-hover apple-float overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold bg-gradient-to-r from-red-600 to-pink-600 dark:from-red-400 dark:to-pink-400 bg-clip-text text-transparent">
                  {summary.absent}
                </p>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Absent</p>
                <p className="text-xs text-gray-500 dark:text-gray-500">Today</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                <UserX className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="apple-card rounded-2xl border-0 shadow-lg apple-hover apple-float overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 dark:from-yellow-400 dark:to-orange-400 bg-clip-text text-transparent">
                  {summary.halfDay}
                </p>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Half Day</p>
                <p className="text-xs text-gray-500 dark:text-gray-500">Today</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="apple-card rounded-2xl border-0 shadow-lg apple-hover apple-float overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 dark:from-orange-400 dark:to-red-400 bg-clip-text text-transparent">
                  {summary.earlyLeave}
                </p>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Early Leave</p>
                <p className="text-xs text-gray-500 dark:text-gray-500">Today</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="apple-card rounded-2xl border-0 shadow-lg apple-hover apple-float overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                  {summary.total}
                </p>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</p>
                <p className="text-xs text-gray-500 dark:text-gray-500">Employees</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Controls */}
      <Card className="apple-card rounded-3xl border-0 shadow-xl overflow-hidden apple-hover apple-float">
        <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-sm">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold mb-2">Quick Attendance</CardTitle>
                <CardDescription className="text-indigo-100">
                  Mark attendance for{" "}
                  {new Date(selectedDate).toLocaleDateString("en-IN", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <Label htmlFor="date" className="text-white font-semibold">
                  Date:
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="apple-input w-48 bg-white/20 border-white/30 text-white placeholder:text-white/70 focus:bg-white/30 rounded-xl px-4 py-2"
                />
              </div>
              <Button
                onClick={markAllPresent}
                className="apple-button bg-white/20 hover:bg-white/30 text-white border border-white/30 rounded-xl px-6 py-2 font-semibold transition-all duration-300 hover:scale-105"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Mark All Present
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
          <div className="grid gap-6">
            {employees.map((employee, index) => {
              const todayRecord = employee.attendanceRecords?.find((r) => r.date === selectedDate)
              return (
                <div
                  key={employee.id}
                  className="apple-card-inner rounded-2xl p-6 bg-white dark:bg-gray-800 shadow-lg apple-hover transition-all duration-300"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        {employee.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">{employee.name}</h4>
                        <p className="text-gray-600 dark:text-gray-400 font-medium">
                          {employee.position} • {employee.department}
                        </p>
                        {todayRecord && (
                          <div className="mt-2">
                            <Badge
                              className={`${getStatusColor(todayRecord.status)} rounded-xl px-3 py-1 font-medium shadow-lg`}
                            >
                              {getStatusIcon(todayRecord.status)}
                              <span className="ml-2 capitalize">{todayRecord.status.replace("-", " ")}</span>
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleQuickAttendance(employee.id, "present")}
                        className={`apple-button rounded-xl px-4 py-2 font-medium transition-all duration-300 hover:scale-105 shadow-lg ${
                          todayRecord?.status === "present"
                            ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white"
                            : "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                        }`}
                      >
                        <UserCheck className="w-4 h-4 mr-1" />
                        Present
                      </Button>

                      <Button
                        size="sm"
                        onClick={() => handleQuickAttendance(employee.id, "absent")}
                        className={`apple-button rounded-xl px-4 py-2 font-medium transition-all duration-300 hover:scale-105 shadow-lg ${
                          todayRecord?.status === "absent"
                            ? "bg-gradient-to-r from-red-600 to-pink-600 text-white"
                            : "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white"
                        }`}
                      >
                        <UserX className="w-4 h-4 mr-1" />
                        Absent
                      </Button>

                      <Button
                        size="sm"
                        onClick={() => handleQuickAttendance(employee.id, "half-day")}
                        className={`apple-button rounded-xl px-4 py-2 font-medium transition-all duration-300 hover:scale-105 shadow-lg ${
                          todayRecord?.status === "half-day"
                            ? "bg-gradient-to-r from-yellow-600 to-orange-600 text-white"
                            : "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
                        }`}
                      >
                        <Clock className="w-4 h-4 mr-1" />
                        Half
                      </Button>

                      <Button
                        size="sm"
                        onClick={() => handleQuickAttendance(employee.id, "late-come")}
                        className={`apple-button rounded-xl px-4 py-2 font-medium transition-all duration-300 hover:scale-105 shadow-lg ${
                          todayRecord?.status === "late-come"
                            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                            : "bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white"
                        }`}
                      >
                        <Clock className="w-4 h-4 mr-1" />
                        Late
                      </Button>

                      <Button
                        size="sm"
                        onClick={() => handleQuickAttendance(employee.id, "early-leave")}
                        className={`apple-button rounded-xl px-4 py-2 font-medium transition-all duration-300 hover:scale-105 shadow-lg ${
                          todayRecord?.status === "early-leave"
                            ? "bg-gradient-to-r from-orange-600 to-red-600 text-white"
                            : "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                        }`}
                      >
                        <AlertTriangle className="w-4 h-4 mr-1" />
                        Early
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
