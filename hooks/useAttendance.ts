"use client";

import { useState } from "react";
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

  const addAttendanceRecord = (
    employeeId: string,
    status: AttendanceStatus,
    notes?: string
  ) => {
    const employee = employees.find((emp) => emp.id === employeeId);
    if (!employee) return;

    const existingRecordIndex =
      employee.attendanceRecords?.findIndex(
        (record) => record.date === selectedDate
      ) ?? -1;

    const baseRecord: any = {
      id: crypto.randomUUID(),
      employeeId,
      date: selectedDate,
      status,
      createdAt: new Date().toISOString(),
    };
    if (notes && notes.trim()) {
      baseRecord.notes = notes.trim();
    }
    const newRecord: AttendanceRecord = baseRecord;

    let updatedRecords = employee.attendanceRecords || [];

    if (existingRecordIndex >= 0) {
      // Update existing record
      updatedRecords[existingRecordIndex] = {
        ...updatedRecords[existingRecordIndex],
        ...newRecord,
      };
    } else {
      // Add new record
      updatedRecords = [...updatedRecords, newRecord];
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
