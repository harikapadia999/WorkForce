"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Employee } from "@/types/employee";
import {
  Search,
  Edit,
  Trash2,
  IndianRupee,
  Calendar,
  User,
  Package,
  Mail,
  Phone,
  Users,
  Crown,
  AlertCircle,
  Send,
} from "lucide-react";
import { AdvanceDialog } from "./advance-dialog";
import { calculateNetSalary, formatCurrency } from "@/utils/salary-calculator";
import { EmployeeProfile } from "./employee-profile";
import { WorkRecordDialog } from "./work-record-dialog";
import { useSubscription } from "@/hooks/useSubscription";

interface EmployeeListProps {
  employees: Employee[];
  onEdit: (employee: Employee) => void;
  onDelete: (id: string) => void;
  onUpdateEmployee: (id: string, updates: Partial<Employee>) => void;
  onDirectPayment?: (employee: Employee) => void;
}

export function EmployeeList({
  employees,
  onEdit,
  onDelete,
  onUpdateEmployee,
  onDirectPayment,
}: EmployeeListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [selectedProfile, setSelectedProfile] = useState<Employee | null>(null);
  const [selectedWorkEmployee, setSelectedWorkEmployee] =
    useState<Employee | null>(null);
  const { canUseWorkRecords, canAddAdvance, isPro } = useSubscription();

  const filteredEmployees = employees.filter(
    (employee) =>
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSalaryDisplay = (employee: Employee) => {
    const { salaryType, salaryConfig } = employee;
    switch (salaryType) {
      case "hourly":
        return `₹${salaryConfig.hourly?.rate}/hr (${salaryConfig.hourly?.hoursPerWeek}h/week)`;
      case "daily":
        return `₹${salaryConfig.daily?.rate}/day (${salaryConfig.daily?.workingDays} days/month)`;
      case "monthly":
        return `₹${salaryConfig.monthly?.amount?.toLocaleString(
          "en-IN"
        )}/month`;
      case "piece-rate":
        return `₹${salaryConfig.pieceRate?.ratePerPiece}/piece (target: ${salaryConfig.pieceRate?.targetPieces})`;
      case "weight-based":
        return `₹${salaryConfig.weightBased?.ratePerKg}/kg (target: ${salaryConfig.weightBased?.targetWeight}kg)`;
      case "meter-based":
        return `₹${salaryConfig.meterBased?.ratePerMeter}/m (target: ${salaryConfig.meterBased?.targetMeters}m)`;
      case "dynamic-date":
        const startDate = salaryConfig.dynamicDate?.startDate
          ? new Date(salaryConfig.dynamicDate.startDate).toLocaleDateString()
          : "Not set";
        const endDate = salaryConfig.dynamicDate?.endDate
          ? new Date(salaryConfig.dynamicDate.endDate).toLocaleDateString()
          : "Not set";
        return `₹${salaryConfig.dynamicDate?.baseAmount} + ${salaryConfig.dynamicDate?.bonusRate}% bonus (${startDate} - ${endDate})`;
      default:
        return "Not configured";
    }
  };

  const getTotalAdvances = (employee: Employee) => {
    return employee.advances
      .filter((advance) => advance.status !== "deducted")
      .reduce((total, advance) => total + advance.amount, 0);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const handleAdvanceClick = (employee: Employee) => {
    const currentAdvances = employee.advances.filter(
      (a) => a.status !== "deducted"
    ).length;
    if (!canAddAdvance(currentAdvances)) {
      // Show upgrade prompt
      return;
    }
    setSelectedEmployee(employee);
  };

  const handleWorkClick = (employee: Employee) => {
    if (!canUseWorkRecords()) {
      // Show upgrade prompt
      return;
    }
    setSelectedWorkEmployee(employee);
  };

  return (
    <div className="space-y-8">
      {/* Apple-style Search Bar */}
      <div className="apple-float">
        <div className="apple-card rounded-2xl p-1 shadow-lg">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
            <Input
              placeholder="Search employees by name, email, department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="apple-input pl-12 pr-4 py-4 bg-transparent border-0 text-gray-700 dark:text-gray-300 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-0 text-lg"
            />
          </div>
        </div>
      </div>

      {/* Employee Cards Grid */}
      <div className="grid gap-8">
        {filteredEmployees.map((employee, index) => (
          <div
            key={employee.id}
            className="apple-card rounded-3xl p-8 apple-hover apple-float shadow-xl"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {/* Employee Header */}
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-6 lg:space-y-0 mb-8">
              <div className="flex items-start space-x-6">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-blue-400 dark:to-indigo-500 rounded-3xl flex items-center justify-center text-white font-bold text-xl shadow-lg apple-hover">
                    {getInitials(employee.name)}
                  </div>
                  {isPro && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                      <Crown className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>

                {/* Employee Info */}
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 apple-text">
                    {employee.name}
                  </h3>
                  <p className="text-lg text-gray-600 dark:text-gray-400 font-medium mb-4">
                    {employee.position} • {employee.department}
                  </p>

                  {/* Contact Info */}
                  {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-500">
                      <Mail className="w-4 h-4" />
                      <span>{employee.email}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-500">
                      <Phone className="w-4 h-4" />
                      <span>{employee.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Joined{" "}
                        {new Date(employee.hireDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div> */}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <Button
                  size="sm"
                  onClick={() => setSelectedProfile(employee)}
                  className="apple-button bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl px-4 py-2 font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </Button>

                {employee.salaryType === "daily" &&
                  employee.salaryConfig.daily?.hasPerUnitWork && (
                    <Button
                      size="sm"
                      onClick={() => handleWorkClick(employee)}
                      disabled={!canUseWorkRecords()}
                      className="apple-button bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl px-4 py-2 font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:hover:scale-100"
                    >
                      <Package className="w-4 h-4 mr-2" />
                      Work
                      {!canUseWorkRecords() && (
                        <AlertCircle className="w-3 h-3 ml-1" />
                      )}
                    </Button>
                  )}

                {/* {isPro && onDirectPayment && (
                  <Button
                    size="sm"
                    onClick={() => onDirectPayment(employee)}
                    className="apple-button bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl px-4 py-2 font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Pay
                  </Button>
                )} */}

                <Button
                  size="sm"
                  onClick={() => handleAdvanceClick(employee)}
                  className="apple-button bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl px-4 py-2 font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <IndianRupee className="w-4 h-4 mr-2" />
                  Advance
                </Button>

                <Button
                  size="sm"
                  onClick={() => onEdit(employee)}
                  className="apple-button bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white rounded-xl px-4 py-2 font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <Edit className="w-4 h-4" />
                </Button>

                <Button
                  size="sm"
                  onClick={() => onDelete(employee.id)}
                  className="apple-button bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-xl px-4 py-2 font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Salary & Financial Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Salary Configuration */}
              <div className="apple-card-inner rounded-2xl p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200/50 dark:border-blue-800/30 apple-hover">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-lg">₹</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                      Salary Configuration
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 capitalize">
                      {employee.salaryType.replace("-", " ")}
                    </p>
                  </div>
                </div>
                <p className="text-gray-800 dark:text-gray-200 font-semibold text-sm leading-relaxed">
                  {getSalaryDisplay(employee)}
                </p>
              </div>

              {/* Net Salary */}
              <div className="apple-card-inner rounded-2xl p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200/50 dark:border-green-800/30 apple-hover">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                    <IndianRupee className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-700 dark:text-green-300">
                      Net Salary
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400">
                      After deductions
                    </p>
                  </div>
                </div>
                <p className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">
                  {formatCurrency(calculateNetSalary(employee))}
                </p>
              </div>
            </div>

            {/* Outstanding Advances Alert */}
            {getTotalAdvances(employee) > 0 && (
              <div className="mt-6 apple-card-inner rounded-2xl p-6 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200/50 dark:border-yellow-800/30 apple-hover">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                      <IndianRupee className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300 mb-1">
                        Outstanding Advances
                      </p>
                      <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-200">
                        {formatCurrency(getTotalAdvances(employee))}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-yellow-700 dark:text-yellow-400">
                      {
                        employee.advances.filter((a) => a.status !== "deducted")
                          .length
                      }{" "}
                      pending
                    </p>
                    <p className="text-xs text-yellow-600 dark:text-yellow-500">
                      Will be deducted from salary
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredEmployees.length === 0 && (
        <div className="apple-card rounded-3xl p-16 text-center apple-float">
          <div className="w-32 h-32 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <Users className="w-16 h-16 text-gray-500 dark:text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-4">
            No employees found
          </h3>
          <p className="text-gray-500 dark:text-gray-500 text-lg">
            Try adjusting your search criteria or add a new employee.
          </p>
        </div>
      )}

      {/* Dialogs */}
      {selectedEmployee && (
        <AdvanceDialog
          employee={selectedEmployee}
          onClose={() => setSelectedEmployee(null)}
          onUpdate={(updates) => {
            onUpdateEmployee(selectedEmployee.id, updates);
            setSelectedEmployee(null);
          }}
        />
      )}

      {selectedProfile && (
        <EmployeeProfile
          employee={selectedProfile}
          onClose={() => setSelectedProfile(null)}
        />
      )}

      {selectedWorkEmployee && (
        <WorkRecordDialog
          employee={selectedWorkEmployee}
          onClose={() => setSelectedWorkEmployee(null)}
          onUpdate={(updates) => {
            onUpdateEmployee(selectedWorkEmployee.id, updates);
            setSelectedWorkEmployee(null);
          }}
        />
      )}
    </div>
  );
}
