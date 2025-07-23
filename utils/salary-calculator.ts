import type { Employee } from "./employee"

export function calculateMonthlySalary(employee: Employee): number {
  const { salaryType, salaryConfig } = employee
  let monthlySalary = 0

  switch (salaryType) {
    case "hourly":
      monthlySalary = (salaryConfig.hourly?.rate || 0) * (salaryConfig.hourly?.hoursPerWeek || 0) * 4.33
      break
    case "daily":
      const baseDailySalary = (salaryConfig.daily?.rate || 0) * (salaryConfig.daily?.workingDays || 0)

      // Add work records earnings for current month if per-unit work is enabled
      let workRecordsEarnings = 0
      if (salaryConfig.daily?.hasPerUnitWork) {
        const currentMonth = new Date().getMonth()
        const currentYear = new Date().getFullYear()

        workRecordsEarnings = (employee.workRecords || [])
          .filter((record) => {
            const recordDate = new Date(record.date)
            return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear
          })
          .reduce((total, record) => total + record.totalAmount, 0)
      }

      monthlySalary = baseDailySalary + workRecordsEarnings
      break
    case "monthly":
      monthlySalary = salaryConfig.monthly?.amount || 0
      break
    case "piece-rate":
      monthlySalary = (salaryConfig.pieceRate?.ratePerPiece || 0) * (salaryConfig.pieceRate?.targetPieces || 0)
      break
    case "weight-based":
      monthlySalary = (salaryConfig.weightBased?.ratePerKg || 0) * (salaryConfig.weightBased?.targetWeight || 0)
      break
    case "meter-based":
      monthlySalary = (salaryConfig.meterBased?.ratePerMeter || 0) * (salaryConfig.meterBased?.targetMeters || 0)
      break
    case "dynamic-date":
      const baseAmount = salaryConfig.dynamicDate?.baseAmount || 0
      const bonusRate = salaryConfig.dynamicDate?.bonusRate || 0
      monthlySalary = baseAmount + (baseAmount * bonusRate) / 100
      break
  }

  return monthlySalary
}

// Add function to handle advance carry forward
export function processAdvanceCarryForward(employee: Employee): Employee {
  const currentDate = new Date()
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()

  const updatedAdvances = employee.advances.map((advance) => {
    const advanceDate = new Date(advance.date)
    const advanceMonth = advanceDate.getMonth()
    const advanceYear = advanceDate.getFullYear()

    // If advance is from previous month and has carry forward enabled and is still approved
    if (
      advance.status === "approved" &&
      advance.carryForward &&
      (advanceYear < currentYear || (advanceYear === currentYear && advanceMonth < currentMonth))
    ) {
      return {
        ...advance,
        status: "carried-forward" as const,
        date: new Date().toISOString(), // Update to current month
      }
    }

    return advance
  })

  return {
    ...employee,
    advances: updatedAdvances,
  }
}

// Update calculateNetSalary to handle carried forward advances
export function calculateNetSalary(employee: Employee): number {
  const grossSalary = calculateMonthlySalary(employee)
  const totalAdvances = employee.advances
    .filter((advance) => advance.status === "approved" || advance.status === "carried-forward")
    .reduce((total, advance) => total + advance.amount, 0)

  return Math.max(0, grossSalary - totalAdvances)
}

export function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
