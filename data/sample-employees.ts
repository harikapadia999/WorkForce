// import type { Employee } from "@/types/employee"

// export const sampleEmployees: Employee[] = [
//   {
//     id: "emp-001",
//     name: "Rajesh Kumar",
//     email: "rajesh.kumar@company.com",
//     phone: "+91 98765 43210",
//     position: "Software Developer",
//     department: "IT",
//     hireDate: "2023-01-15",
//     salaryType: "monthly",
//     salaryConfig: {
//       monthly: {
//         amount: 75000,
//       },
//     },
//     advances: [
//       {
//         id: "adv-001",
//         amount: 10000,
//         date: "2024-01-10",
//         reason: "Medical emergency",
//         status: "approved",
//         carryForward: true,
//         originalAmount: 10000,
//       },
//     ],
//     workRecords: [],
//     createdAt: "2023-01-15T00:00:00.000Z",
//     updatedAt: "2024-01-10T00:00:00.000Z",
//     attendanceRecords: [
//       {
//         id: "att-001",
//         employeeId: "emp-001",
//         date: "2024-01-15",
//         status: "present",
//         createdAt: "2024-01-15T09:00:00.000Z",
//       },
//       {
//         id: "att-002",
//         employeeId: "emp-001",
//         date: "2024-01-16",
//         status: "late-come",
//         notes: "Traffic jam",
//         createdAt: "2024-01-16T09:30:00.000Z",
//       },
//     ],
//     lastAdvanceProcessedMonth: "2024-01", // Example: last processed in January 2024
//   },
//   {
//     id: "emp-002",
//     name: "Priya Sharma",
//     email: "priya.sharma@company.com",
//     phone: "+91 87654 32109",
//     position: "Graphic Designer",
//     department: "Design",
//     hireDate: "2023-03-20",
//     salaryType: "hourly",
//     salaryConfig: {
//       hourly: {
//         rate: 500,
//         hoursPerWeek: 40,
//       },
//     },
//     advances: [],
//     workRecords: [],
//     createdAt: "2023-03-20T00:00:00.000Z",
//     updatedAt: "2023-03-20T00:00:00.000Z",
//     attendanceRecords: [
//       {
//         id: "att-003",
//         employeeId: "emp-002",
//         date: "2024-01-15",
//         status: "present",
//         createdAt: "2024-01-15T09:00:00.000Z",
//       },
//       {
//         id: "att-004",
//         employeeId: "emp-002",
//         date: "2024-01-16",
//         status: "absent",
//         notes: "Sick leave",
//         createdAt: "2024-01-16T09:30:00.000Z",
//       },
//     ],
//     lastAdvanceProcessedMonth: "2024-01",
//   },
//   {
//     id: "emp-003",
//     name: "Amit Patel",
//     email: "amit.patel@company.com",
//     phone: "+91 76543 21098",
//     position: "Production Worker",
//     department: "Manufacturing",
//     hireDate: "2023-02-10",
//     salaryType: "piece-rate",
//     salaryConfig: {
//       pieceRate: {
//         ratePerPiece: 25,
//         targetPieces: 800,
//       },
//     },
//     advances: [
//       {
//         id: "adv-002",
//         amount: 5000,
//         date: "2024-01-05",
//         reason: "Festival advance",
//         status: "approved",
//       },
//       {
//         id: "adv-003",
//         amount: 3000,
//         date: "2023-12-20",
//         reason: "Personal loan",
//         status: "deducted",
//       },
//     ],
//     workRecords: [],
//     createdAt: "2023-02-10T00:00:00.000Z",
//     updatedAt: "2024-01-05T00:00:00.000Z",
//     attendanceRecords: [
//       {
//         id: "att-005",
//         employeeId: "emp-003",
//         date: "2024-01-15",
//         status: "present",
//         createdAt: "2024-01-15T09:00:00.000Z",
//       },
//       {
//         id: "att-006",
//         employeeId: "emp-003",
//         date: "2024-01-16",
//         status: "present",
//         createdAt: "2024-01-16T09:30:00.000Z",
//       },
//     ],
//     lastAdvanceProcessedMonth: "2024-01",
//   },
//   {
//     id: "emp-004",
//     name: "Sunita Devi",
//     email: "sunita.devi@company.com",
//     phone: "+91 65432 10987",
//     position: "Quality Inspector",
//     department: "Quality Control",
//     hireDate: "2023-04-01",
//     salaryType: "daily",
//     salaryConfig: {
//       daily: {
//         rate: 800,
//         workingDays: 26,
//         hasPerUnitWork: true,
//         perUnitRates: {
//           kg: 5,
//           meter: 3,
//           piece: 2,
//         },
//       },
//     },
//     advances: [],
//     workRecords: [
//       {
//         id: "work-001",
//         employeeId: "emp-004",
//         date: "2024-01-15",
//         quantity: 50,
//         unit: "kg",
//         rate: 5,
//         totalAmount: 250,
//         notes: "Quality inspection of raw materials",
//         createdAt: "2024-01-15T10:00:00.000Z",
//       },
//       {
//         id: "work-002",
//         employeeId: "emp-004",
//         date: "2024-01-16",
//         quantity: 100,
//         unit: "piece",
//         rate: 2,
//         totalAmount: 200,
//         notes: "Finished goods inspection",
//         createdAt: "2024-01-16T10:00:00.000Z",
//       },
//     ],
//     createdAt: "2023-04-01T00:00:00.000Z",
//     updatedAt: "2023-04-01T00:00:00.000Z",
//     attendanceRecords: [
//       {
//         id: "att-007",
//         employeeId: "emp-004",
//         date: "2024-01-15",
//         status: "present",
//         createdAt: "2024-01-15T09:00:00.000Z",
//       },
//       {
//         id: "att-008",
//         employeeId: "emp-004",
//         date: "2024-01-16",
//         status: "present",
//         createdAt: "2024-01-16T09:30:00.000Z",
//       },
//     ],
//     lastAdvanceProcessedMonth: "2024-01",
//   },
//   {
//     id: "emp-005",
//     name: "Vikram Singh",
//     email: "vikram.singh@company.com",
//     phone: "+91 54321 09876",
//     position: "Warehouse Manager",
//     department: "Logistics",
//     hireDate: "2023-05-15",
//     salaryType: "weight-based",
//     salaryConfig: {
//       weightBased: {
//         ratePerKg: 5,
//         targetWeight: 5000,
//       },
//     },
//     advances: [
//       {
//         id: "adv-004",
//         amount: 8000,
//         date: "2024-01-08",
//         reason: "Home renovation",
//         status: "approved",
//       },
//     ],
//     workRecords: [],
//     createdAt: "2023-05-15T00:00:00.000Z",
//     updatedAt: "2024-01-08T00:00:00.000Z",
//     attendanceRecords: [
//       {
//         id: "att-009",
//         employeeId: "emp-005",
//         date: "2024-01-15",
//         status: "present",
//         createdAt: "2024-01-15T09:00:00.000Z",
//       },
//       {
//         id: "att-010",
//         employeeId: "emp-005",
//         date: "2024-01-16",
//         status: "present",
//         createdAt: "2024-01-16T09:30:00.000Z",
//       },
//     ],
//     lastAdvanceProcessedMonth: "2024-01",
//   },
//   {
//     id: "emp-006",
//     name: "Meera Joshi",
//     email: "meera.joshi@company.com",
//     phone: "+91 43210 98765",
//     position: "Textile Worker",
//     department: "Production",
//     hireDate: "2023-06-01",
//     salaryType: "meter-based",
//     salaryConfig: {
//       meterBased: {
//         ratePerMeter: 15,
//         targetMeters: 2000,
//       },
//     },
//     advances: [],
//     workRecords: [],
//     createdAt: "2023-06-01T00:00:00.000Z",
//     updatedAt: "2023-06-01T00:00:00.000Z",
//     attendanceRecords: [
//       {
//         id: "att-011",
//         employeeId: "emp-006",
//         date: "2024-01-15",
//         status: "present",
//         createdAt: "2024-01-15T09:00:00.000Z",
//       },
//       {
//         id: "att-012",
//         employeeId: "emp-006",
//         date: "2024-01-16",
//         status: "present",
//         createdAt: "2024-01-16T09:30:00.000Z",
//       },
//     ],
//     lastAdvanceProcessedMonth: "2024-01",
//   },
//   {
//     id: "emp-007",
//     name: "Arjun Reddy",
//     email: "arjun.reddy@company.com",
//     phone: "+91 32109 87654",
//     position: "Project Coordinator",
//     department: "Operations",
//     hireDate: "2023-07-10",
//     salaryType: "dynamic-date",
//     salaryConfig: {
//       dynamicDate: {
//         baseAmount: 45000,
//         bonusRate: 15,
//         startDate: "2024-01-01",
//         endDate: "2024-12-31",
//         paymentFrequency: "monthly",
//       },
//     },
//     advances: [
//       {
//         id: "adv-005",
//         amount: 12000,
//         date: "2024-01-12",
//         reason: "Education fees",
//         status: "approved",
//       },
//     ],
//     workRecords: [],
//     createdAt: "2023-07-10T00:00:00.000Z",
//     updatedAt: "2024-01-12T00:00:00.000Z",
//     attendanceRecords: [
//       {
//         id: "att-013",
//         employeeId: "emp-007",
//         date: "2024-01-15",
//         status: "present",
//         createdAt: "2024-01-15T09:00:00.000Z",
//       },
//       {
//         id: "att-014",
//         employeeId: "emp-007",
//         date: "2024-01-16",
//         status: "present",
//         createdAt: "2024-01-16T09:30:00:00.000Z",
//       },
//     ],
//     lastAdvanceProcessedMonth: "2024-01",
//   },
// ]

// # Activity Logs Testing

// This section verifies Comprehensive User Action Tracking, Enhanced DB Structure, Advanced Testing, and Detailed Log Data Structure.

// 1) Login/Logout Tracking
// - Steps:
//   - Sign in via email/password.
//   - Sign out.
//   - Sign in via Google (if configured).
// - Verify:
//   - Visit /logs and filter Action = Login. You should see entries with metadata.method "password" or "google".
//   - Filter Action = Logout. Confirm logout entries.
//   - Check userId, userEmail, userName are populated. Timestamp displays both ISO and ms.

// 2) Create/Update/Delete Employee
// - Steps:
//   - Create a new employee.
//   - Update the same employee (e.g., change department).
//   - Delete the employee.
// - Verify:
//   - In /logs, filter by Resource ID using the employee id.
//   - Ensure "Create", "Update", and "Delete" actions exist.
//   - Open "View changes" to inspect diff entries (path, before, after).
//   - Confirm before/after fields reflect the change accurately.

// 3) View Actions (Dialogs)
// - Steps:
//   - Open Advance dialog for an employee.
//   - Open Work Record dialog for an employee.
// - Verify:
//   - In /logs, filter Action = View. Entries should show activityName "AdvanceDialog" or "WorkRecordDialog" and include employee context in metadata.
//   - Validate sessionId presence and that it remains the same across multiple dialog opens in the same session.

// 4) Cross-Session Tracking
// - Steps:
//   - Open the app in a private/incognito window and repeat a couple of actions.
//   - Compare sessionId values in logs between regular and incognito sessions.
// - Verify:
//   - sessionId differs across sessions and remains stable within a session.

// 5) Filtering and Export
// - Steps:
//   - Use From/To date filters and Action filter to narrow results.
//   - Use the Session ID input to further refine.
//   - Click Export CSV and open the downloaded file.
// - Verify:
//   - Export includes id, timestamps, action, resource info, user fields, sessionId, and diff JSON.
//   - Filtering on the UI is reflected in which records are exported.

// 6) Firestore Structure
// - Verify:
//   - There is a "activity_logs" collection.
//   - Each document contains: action, resourceType, resourceId (optional), timestampIso, timestampMs, user fields (id/email/name), sessionId, before/after (optional), and diff array (optional).
