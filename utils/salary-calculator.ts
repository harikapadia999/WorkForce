// import type { Employee } from "./employee"

// export function calculateMonthlySalary(employee: Employee): number {
//   const { salaryType, salaryConfig } = employee
//   let monthlySalary = 0

//   switch (salaryType) {
//     case "hourly":
//       monthlySalary = (salaryConfig.hourly?.rate || 0) * (salaryConfig.hourly?.hoursPerWeek || 0) * 4.33
//       break
//     case "daily":
//       const baseDailySalary = (salaryConfig.daily?.rate || 0) * (salaryConfig.daily?.workingDays || 0)

//       // Add work records earnings for current month if per-unit work is enabled
//       let workRecordsEarnings = 0
//       if (salaryConfig.daily?.hasPerUnitWork) {
//         const currentMonth = new Date().getMonth()
//         const currentYear = new Date().getFullYear()

//         workRecordsEarnings = (employee.workRecords || [])
//           .filter((record) => {
//             const recordDate = new Date(record.date)
//             return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear
//           })
//           .reduce((total, record) => total + record.totalAmount, 0)
//       }

//       monthlySalary = baseDailySalary + workRecordsEarnings
//       break
//     case "monthly":
//       monthlySalary = salaryConfig.monthly?.amount || 0
//       break
//     case "piece-rate":
//       monthlySalary = (salaryConfig.pieceRate?.ratePerPiece || 0) * (salaryConfig.pieceRate?.targetPieces || 0)
//       break
//     case "weight-based":
//       monthlySalary = (salaryConfig.weightBased?.ratePerKg || 0) * (salaryConfig.weightBased?.targetWeight || 0)
//       break
//     case "meter-based":
//       monthlySalary = (salaryConfig.meterBased?.ratePerMeter || 0) * (salaryConfig.meterBased?.targetMeters || 0)
//       break
//     case "dynamic-date":
//       const baseAmount = salaryConfig.dynamicDate?.baseAmount || 0
//       const bonusRate = salaryConfig.dynamicDate?.bonusRate || 0
//       monthlySalary = baseAmount + (baseAmount * bonusRate) / 100
//       break
//   }

//   return monthlySalary
// }

// // Add function to handle advance carry forward
// export function processAdvanceCarryForward(employee: Employee): Employee {
//   const currentDate = new Date()
//   const currentMonth = currentDate.getMonth()
//   const currentYear = currentDate.getFullYear()

//   const updatedAdvances = employee.advances.map((advance) => {
//     const advanceDate = new Date(advance.date)
//     const advanceMonth = advanceDate.getMonth()
//     const advanceYear = advanceDate.getFullYear()

//     // If advance is from previous month and has carry forward enabled and is still approved
//     if (
//       advance.status === "approved" &&
//       advance.carryForward &&
//       (advanceYear < currentYear || (advanceYear === currentYear && advanceMonth < currentMonth))
//     ) {
//       return {
//         ...advance,
//         status: "carried-forward" as const,
//         date: new Date().toISOString(), // Update to current month
//       }
//     }

//     return advance
//   })

//   return {
//     ...employee,
//     advances: updatedAdvances,
//   }
// }

// // Update calculateNetSalary to handle carried forward advances
// export function calculateNetSalary(employee: Employee): number {
//   const grossSalary = calculateMonthlySalary(employee)
//   const totalAdvances = employee.advances
//     .filter((advance) => advance.status === "approved" || advance.status === "carried-forward")
//     .reduce((total, advance) => total + advance.amount, 0)

//   return Math.max(0, grossSalary - totalAdvances)
// }

// export function formatCurrency(amount: number): string {
//   return `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
// }
import type { Employee } from "./employee";

export function calculateMonthlySalary(employee: Employee): number {
  const { salaryType, salaryConfig } = employee;
  let monthlySalary = 0;

  switch (salaryType) {
    case "hourly":
      monthlySalary =
        (salaryConfig.hourly?.rate || 0) *
        (salaryConfig.hourly?.hoursPerWeek || 0) *
        4.33;
      break;
    case "daily":
      // const baseDailySalary =
      //   (salaryConfig.daily?.rate || 0) *
      //   (salaryConfig.daily?.workingDays || 0);
      const rate = salaryConfig.daily?.rate || 0;

      // Calculate effective working days from attendance records
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      const attendanceForMonth = (employee.attendanceRecords || []).filter(
        (r) => {
          const d = new Date(r.date);
          return (
            d.getFullYear() === currentYear && d.getMonth() === currentMonth
          );
        }
      );

      let effectiveDays = 0;
      for (const r of attendanceForMonth) {
        switch (r.status) {
          case "present":
            effectiveDays += 1;
            break;
          case "half-day":
            effectiveDays += 0.5;
            break;
          case "late-come":
          case "early-leave":
            effectiveDays += 0.75;
            break;
          case "absent":
          default:
            break; // adds 0
        }
      }

      // Base salary = rate × effective working days
      const baseDailySalary = rate * effectiveDays;
      // Add work records earnings for current month if per-unit work is enabled
      let workRecordsEarnings = 0;
      if (salaryConfig.daily?.hasPerUnitWork) {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        workRecordsEarnings = (employee.workRecords || [])
          .filter((record) => {
            const recordDate = new Date(record.date);
            return (
              recordDate.getMonth() === currentMonth &&
              recordDate.getFullYear() === currentYear
            );
          })
          .reduce((total, record) => total + record.totalAmount, 0);
      }

      monthlySalary = baseDailySalary + workRecordsEarnings;
      break;
    case "monthly":
      monthlySalary = salaryConfig.monthly?.amount || 0;
      break;
    case "piece-rate":
      monthlySalary =
        (salaryConfig.pieceRate?.ratePerPiece || 0) *
        (salaryConfig.pieceRate?.targetPieces || 0);
      break;
    case "weight-based":
      monthlySalary =
        (salaryConfig.weightBased?.ratePerKg || 0) *
        (salaryConfig.weightBased?.targetWeight || 0);
      break;
    case "meter-based":
      monthlySalary =
        (salaryConfig.meterBased?.ratePerMeter || 0) *
        (salaryConfig.meterBased?.targetMeters || 0);
      break;
    case "dynamic-date":
      const baseAmount = salaryConfig.dynamicDate?.baseAmount || 0;
      const bonusRate = salaryConfig.dynamicDate?.bonusRate || 0;
      monthlySalary = baseAmount + (baseAmount * bonusRate) / 100;
      break;
  }

  return monthlySalary;
}

// Add function to handle advance carry forward
export function processAdvanceCarryForward(employee: Employee): Employee {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const updatedAdvances = employee.advances.map((advance) => {
    const advanceDate = new Date(advance.date);
    const advanceMonth = advanceDate.getMonth();
    const advanceYear = advanceDate.getFullYear();

    // If advance is from previous month and has carry forward enabled and is still approved
    if (
      advance.status === "approved" &&
      advance.carryForward &&
      (advanceYear < currentYear ||
        (advanceYear === currentYear && advanceMonth < currentMonth))
    ) {
      return {
        ...advance,
        status: "carried-forward" as const,
        date: new Date().toISOString(), // Update to current month
      };
    }

    return advance;
  });

  return {
    ...employee,
    advances: updatedAdvances,
  };
}

// Update calculateNetSalary to handle carried forward advances
export function calculateNetSalary(employee: Employee): number {
  const grossSalary = calculateMonthlySalary(employee);
  const totalAdvances = employee.advances
    .filter(
      (advance) =>
        advance.status === "approved" || advance.status === "carried-forward"
    )
    .reduce((total, advance) => total + advance.amount, 0);

  return Math.max(0, grossSalary - totalAdvances);
}

export function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Attendance-based gross salary calculation for a given month.
 * - present = 1.0 day, half-day = 0.5, late-come = 0.75, early-leave = 0.75, absent = 0
 * - hourly: maps to 8/4/6/6/0 hours per day respectively
 * - daily: rate * weightedDays (+ per-unit earnings if enabled, current month only)
 * - monthly/piece/weight/meter/dynamic-date: pro-rate monthly base by attendance ratio
 */
export function calculateAttendanceGrossForMonth(
  employee: Employee,
  year = new Date().getFullYear(),
  month = new Date().getMonth()
): number {
  const { salaryType, salaryConfig } = employee;
  const records = (employee.attendanceRecords || []).filter((r) => {
    const d = new Date(r.date);
    return d.getFullYear() === year && d.getMonth() === month;
  });

  const counts = {
    present: 0,
    absent: 0,
    half: 0,
    early: 0,
    late: 0,
  };

  for (const r of records) {
    switch (r.status) {
      case "present":
        counts.present++;
        break;
      case "absent":
        counts.absent++;
        break;
      case "half-day":
        counts.half++;
        break;
      case "early-leave":
        counts.early++;
        break;
      case "late-come":
        counts.late++;
        break;
    }
  }

  const weightedDays =
    counts.present + 0.5 * counts.half + 0.75 * (counts.early + counts.late);
  const expectedWorkingDays =
    salaryConfig?.daily?.workingDays && salaryConfig.daily.workingDays > 0
      ? salaryConfig.daily.workingDays
      : 26; // sensible default for pro-rating

  if (salaryType === "hourly") {
    const rate = salaryConfig.hourly?.rate || 0;
    const hours =
      counts.present * 8 + counts.half * 4 + counts.late * 6 + counts.early * 6; // absent adds 0
    return rate * hours;
  }

  if (salaryType === "daily") {
    const rate = salaryConfig.daily?.rate || 0;
    let gross =
      rate *
      (counts.present +
        0.5 * counts.half +
        0.75 * (counts.early + counts.late));
    // Include per-unit earnings for current month if enabled
    if (salaryConfig.daily?.hasPerUnitWork) {
      const perUnitEarnings =
        (employee.workRecords || [])
          .filter((record) => {
            const recordDate = new Date(record.date);
            return (
              recordDate.getFullYear() === year &&
              recordDate.getMonth() === month
            );
          })
          .reduce((sum, r) => sum + r.totalAmount, 0) || 0;
      gross += perUnitEarnings;
    }
    return gross;
  }

  // For monthly and other derived salary types, use base monthly and pro-rate by attendance
  const baseMonthly = calculateMonthlySalary(employee);
  const ratio = Math.max(
    0,
    Math.min(1, expectedWorkingDays ? weightedDays / expectedWorkingDays : 0)
  );
  return baseMonthly * ratio;
}

/**
 * Returns an average daily earning figure for the current month based on logged work and configured base rate.
 * Used for displaying daily salary information without showing "undefined".
 */
export function getDailyWorkSummary(
  employee: Employee,
  year = new Date().getFullYear(),
  month = new Date().getMonth()
): {
  avgDailyAmount: number | null;
  daysWithWork: number;
  configuredRate: number | null;
  configuredWorkingDays: number | null;
  totalWorkAmount: number;
} {
  const dailyConfig = employee.salaryConfig.daily;
  const configuredRate =
    typeof dailyConfig?.rate === "number" ? dailyConfig.rate : null;
  const configuredWorkingDays =
    typeof dailyConfig?.workingDays === "number" &&
    !Number.isNaN(dailyConfig.workingDays)
      ? dailyConfig.workingDays
      : null;

  const monthlyWorkRecords = (employee.workRecords || []).filter((record) => {
    const recordDate = new Date(record.date);
    return recordDate.getFullYear() === year && recordDate.getMonth() === month;
  });

  const daysWithWorkSet = new Set<string>();
  let totalWorkAmount = 0;

  for (const record of monthlyWorkRecords) {
    if (record.totalAmount > 0) {
      totalWorkAmount += record.totalAmount;
    }
    daysWithWorkSet.add(new Date(record.date).toDateString());
  }

  const daysWithWork = daysWithWorkSet.size;
  const totalBasePay =
    configuredRate && daysWithWork > 0 ? configuredRate * daysWithWork : 0;
  const calculatedAverage =
    daysWithWork > 0
      ? (totalWorkAmount + totalBasePay) / daysWithWork
      : configuredRate ?? null;

  return {
    avgDailyAmount: calculatedAverage ?? null,
    daysWithWork,
    configuredRate,
    configuredWorkingDays,
    totalWorkAmount,
  };
}
