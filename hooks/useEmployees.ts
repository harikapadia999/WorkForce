"use client"

import { useState, useEffect } from "react"
import type { Employee } from "@/types/employee"
import { sampleEmployees } from "@/data/sample-employees"
import { processAdvanceCarryForward } from "@/utils/salary-calculator"

export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load from localStorage on mount
    const stored = localStorage.getItem("employees")
    let initialEmployees: Employee[] = []
    if (stored) {
      initialEmployees = JSON.parse(stored)
    } else {
      // Load sample data if no stored data exists
      initialEmployees = sampleEmployees
    }

    // Process advances for carry-forward on load
    const currentMonthYear = new Date().toISOString().slice(0, 7) // "YYYY-MM"
    const processedEmployees = initialEmployees.map((employee) => {
      if (employee.lastAdvanceProcessedMonth !== currentMonthYear) {
        const updatedEmployee = processAdvanceCarryForward(employee)
        return {
          ...updatedEmployee,
          lastAdvanceProcessedMonth: currentMonthYear,
        }
      }
      return employee
    })

    setEmployees(processedEmployees)
    setLoading(false)
  }, []) // Run only once on mount

  useEffect(() => {
    // Save to localStorage whenever employees change, but only after initial load
    if (!loading) {
      localStorage.setItem("employees", JSON.stringify(employees))
    }
  }, [employees, loading])

  const addEmployee = (employee: Omit<Employee, "id" | "createdAt" | "updatedAt">) => {
    const newEmployee: Employee = {
      ...employee,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastAdvanceProcessedMonth: new Date().toISOString().slice(0, 7), // Set for new employees
    }
    setEmployees((prev) => [...prev, newEmployee])
    return newEmployee
  }

  const updateEmployee = (id: string, updates: Partial<Employee>) => {
    setEmployees((prev) =>
      prev.map((emp) => (emp.id === id ? { ...emp, ...updates, updatedAt: new Date().toISOString() } : emp)),
    )
  }

  const deleteEmployee = (id: string) => {
    setEmployees((prev) => prev.filter((emp) => emp.id !== id))
  }

  const getEmployee = (id: string) => {
    return employees.find((emp) => emp.id === id)
  }

  return {
    employees,
    loading,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    getEmployee,
  }
}
