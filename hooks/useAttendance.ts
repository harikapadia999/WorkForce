"use client";

import { useState } from "react";
import { toast } from "sonner";
import type {
  AttendanceRecord,
  AttendanceSummary,
  AttendanceStatus,
} from "@/types/attendance";
import type { Employee } from "@/types/employee";

export function useAttendance(
  employees: Employee[],
  updateEmployee: (id: string, updates: Partial<Employee>) => void
) {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // const addAttendanceRecord = (
  //   employeeId: string,
  //   status: AttendanceStatus,
  //   notes?: string
  // ) => {
  //   const employee = employees.find((emp) => emp.id === employeeId);
  //   if (!employee) return;

  //   const existingRecordIndex =
  //     employee.attendanceRecords?.findIndex(
  //       (record) => record.date === selectedDate
  //     ) ?? -1;

  //   const baseRecord: any = {
  //     id: crypto.randomUUID(),
  //     employeeId,
  //     date: selectedDate,
  //     status,
  //     createdAt: new Date().toISOString(),
  //   };
  //   if (notes && notes.trim()) {
  //     baseRecord.notes = notes.trim();
  //   }
  //   const newRecord: AttendanceRecord = baseRecord;

  //   let updatedRecords = employee.attendanceRecords || [];

  //   if (existingRecordIndex >= 0) {
  //     // Update existing record
  //     updatedRecords[existingRecordIndex] = {
  //       ...updatedRecords[existingRecordIndex],
  //       ...newRecord,
  //     };
  //   } else {
  //     // Add new record
  //     updatedRecords = [...updatedRecords, newRecord];
  //   }

  //   updateEmployee(employeeId, { attendanceRecords: updatedRecords });
  // };
  const addAttendanceRecord = (
    employeeId: string,
    status: AttendanceStatus,
    notes?: string
  ) => {
    const employee = employees.find((emp) => emp.id === employeeId);
    if (!employee) return;

    const hireDate = employee.hireDate ? new Date(employee.hireDate) : null;
    const selected = new Date(selectedDate);

    // 1. Restrict attendance before hireDate
    if (hireDate && selected < hireDate) {
      toast.warning(`Cannot mark attendance for ${employee.name}`, {
        description: `Hire date: ${hireDate.toDateString()}`,
      });
      return;
    }

    // 2. Restrict attendance for "dynamic-date" salary type (optional)
    if (employee.salaryType === "dynamic-date") {
      const dyn = employee.salaryConfig?.dynamicDate;
      if (dyn?.startDate && dyn?.endDate) {
        const start = new Date(dyn.startDate);
        const end = new Date(dyn.endDate);
        if (selected < start || selected > end) {
          toast.error(`Out of valid range for ${employee.name}`, {
            description: `Allowed only between ${start.toDateString()} and ${end.toDateString()}`,
          });
          return;
        }
      }
    }

    // 3. Normal add/update attendance logic
    const existingRecordIndex =
      employee.attendanceRecords?.findIndex(
        (record) => record.date === selectedDate
      ) ?? -1;

    const newRecord: AttendanceRecord = {
      id: crypto.randomUUID(),
      employeeId,
      date: selectedDate,
      status,
      createdAt: new Date().toISOString(),
      ...(notes?.trim() ? { notes: notes.trim() } : {}),
    };

    let updatedRecords = employee.attendanceRecords || [];

    if (existingRecordIndex >= 0) {
      updatedRecords[existingRecordIndex] = {
        ...updatedRecords[existingRecordIndex],
        ...newRecord,
      };
      toast.info(`Updated attendance for ${employee.name}`, {
        description: `${status.toUpperCase()} on ${selected.toDateString()}`,
      });
    } else {
      updatedRecords = [...updatedRecords, newRecord];
      toast.success(`Marked ${status} for ${employee.name}`, {
        description: `${selected.toDateString()}`,
      });
    }

    updateEmployee(employeeId, { attendanceRecords: updatedRecords });
  };

  const getAttendanceSummary = (date: string): AttendanceSummary => {
    const summary = {
      present: 0,
      absent: 0,
      halfDay: 0,
      earlyLeave: 0,
      lateCome: 0,
      total: employees.length,
    };

    employees.forEach((employee) => {
      const record = employee.attendanceRecords?.find((r) => r.date === date);
      if (record) {
        switch (record.status) {
          case "present":
            summary.present++;
            break;
          case "absent":
            summary.absent++;
            break;
          case "half-day":
            summary.halfDay++;
            break;
          case "early-leave":
            summary.earlyLeave++;
            break;
          case "late-come":
            summary.lateCome++;
            break;
        }
      }
    });

    return summary;
  };

  const getEmployeeAttendanceForMonth = (
    employeeId: string,
    year: number,
    month: number
  ) => {
    const employee = employees.find((emp) => emp.id === employeeId);
    if (!employee) return [];

    return (
      employee.attendanceRecords?.filter((record) => {
        const recordDate = new Date(record.date);
        return (
          recordDate.getFullYear() === year && recordDate.getMonth() === month
        );
      }) || []
    );
  };

  const getEmployeeAttendanceForYear = (employeeId: string, year: number) => {
    const employee = employees.find((emp) => emp.id === employeeId);
    if (!employee) return [];

    return (
      employee.attendanceRecords?.filter((record) => {
        const recordDate = new Date(record.date);
        return recordDate.getFullYear() === year;
      }) || []
    );
  };

  return {
    selectedDate,
    setSelectedDate,
    addAttendanceRecord,
    getAttendanceSummary,
    getEmployeeAttendanceForMonth,
    getEmployeeAttendanceForYear,
  };
}
