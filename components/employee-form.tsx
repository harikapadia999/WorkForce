"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Employee, SalaryType, SalaryConfig } from "@/types/employee";
import { SalaryConfigForm } from "./salary-config-form";
import {
  ArrowLeft,
  User,
  Save,
  Sparkles,
  Building,
  Mail,
  Phone,
  Calendar,
  IndianRupee,
  Banknote,
} from "lucide-react";

interface EmployeeFormProps {
  employee?: Employee;
  onSubmit: (
    employee: Omit<Employee, "id" | "createdAt" | "updatedAt">
  ) => void;
  onCancel: () => void;
}

export function EmployeeForm({
  employee,
  onSubmit,
  onCancel,
}: EmployeeFormProps) {
  const [formData, setFormData] = useState({
    name: employee?.name || "",
    email: employee?.email || "",
    phone: employee?.phone || "",
    position: employee?.position || "",
    department: employee?.department || "",
    hireDate: employee?.hireDate || new Date().toISOString().split("T")[0],
    salaryType: employee?.salaryType || ("monthly" as SalaryType),
    salaryConfig: employee?.salaryConfig || ({} as SalaryConfig),
    advances: employee?.advances || [],
    paymentDetails: employee?.paymentDetails || { preferredMethod: "bank" },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleSalaryConfigChange = (config: SalaryConfig) => {
    setFormData((prev) => ({ ...prev, salaryConfig: config }));
  };

  const handlePaymentDetailsChange = (
    field: string,
    value: string | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      paymentDetails: {
        ...prev.paymentDetails,
        [field]: value,
      },
    }));
  };

  const handleBankAccountChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      paymentDetails: {
        ...prev.paymentDetails,
        bankAccount: {
          ...prev.paymentDetails.bankAccount,
          [field]: value,
        },
      },
    }));
  };

  const handleUpiChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      paymentDetails: {
        ...prev.paymentDetails,
        upi: {
          ...prev.paymentDetails.upi,
          [field]: value,
        },
      },
    }));
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Apple-style Header */}
      <div className="apple-card rounded-3xl overflow-hidden shadow-2xl apple-float">
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 text-white relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16"></div>
            <div className="absolute top-20 right-10 w-24 h-24 bg-white rounded-full"></div>
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-white rounded-full translate-x-20 translate-y-20"></div>
          </div>

          <div className="relative z-10">
            <div className="flex items-center space-x-4 mb-6">
              <Button
                onClick={onCancel}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 rounded-xl px-4 py-2 font-medium transition-all duration-300 hover:scale-105"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </div>

            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-sm">
                <User className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2">
                  {employee ? "Edit Employee" : "Add New Employee"}
                </h1>
                <p className="text-blue-100 text-lg">
                  {employee
                    ? "Update employee information and salary details"
                    : "Enter employee details and configure salary structure"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-8 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information Section */}
            <div className="apple-card-inner rounded-3xl p-8 bg-white dark:bg-gray-800 shadow-lg apple-hover">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    Personal Information
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Basic employee details and contact information
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label
                    htmlFor="name"
                    className="text-gray-700 dark:text-gray-300 font-semibold flex items-center"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    required
                    className="apple-input rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 bg-gray-50 dark:bg-gray-700 px-4 py-3 text-lg transition-all duration-300"
                    placeholder="Enter full name"
                  />
                </div>

                <div className="space-y-3">
                  <Label
                    htmlFor="email"
                    className="text-gray-700 dark:text-gray-300 font-semibold flex items-center"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    required
                    className="apple-input rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 bg-gray-50 dark:bg-gray-700 px-4 py-3 text-lg transition-all duration-300"
                    placeholder="Enter email address"
                  />
                </div>

                <div className="space-y-3">
                  <Label
                    htmlFor="phone"
                    className="text-gray-700 dark:text-gray-300 font-semibold flex items-center"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    required
                    className="apple-input rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 bg-gray-50 dark:bg-gray-700 px-4 py-3 text-lg transition-all duration-300"
                    placeholder="Enter phone number"
                  />
                </div>

                <div className="space-y-3">
                  <Label
                    htmlFor="position"
                    className="text-gray-700 dark:text-gray-300 font-semibold flex items-center"
                  >
                    <Building className="w-4 h-4 mr-2" />
                    Position
                  </Label>
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        position: e.target.value,
                      }))
                    }
                    required
                    className="apple-input rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 bg-gray-50 dark:bg-gray-700 px-4 py-3 text-lg transition-all duration-300"
                    placeholder="Enter job position"
                  />
                </div>

                <div className="space-y-3">
                  <Label
                    htmlFor="department"
                    className="text-gray-700 dark:text-gray-300 font-semibold flex items-center"
                  >
                    <Building className="w-4 h-4 mr-2" />
                    Department
                  </Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        department: e.target.value,
                      }))
                    }
                    required
                    className="apple-input rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 bg-gray-50 dark:bg-gray-700 px-4 py-3 text-lg transition-all duration-300"
                    placeholder="Enter department"
                  />
                </div>

                <div className="space-y-3">
                  <Label
                    htmlFor="hireDate"
                    className="text-gray-700 dark:text-gray-300 font-semibold flex items-center"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Hire Date
                  </Label>
                  <Input
                    id="hireDate"
                    type="date"
                    value={formData.hireDate}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        hireDate: e.target.value,
                      }))
                    }
                    required
                    className="apple-input rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 bg-gray-50 dark:bg-gray-700 px-4 py-3 text-lg transition-all duration-300"
                  />
                </div>
              </div>
            </div>

            {/* Salary Configuration Section */}
            <div className="apple-card-inner rounded-3xl p-8 bg-white dark:bg-gray-800 shadow-lg apple-hover">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center">
                  <IndianRupee className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    Salary Configuration
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Configure salary structure and payment terms
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <Label
                    htmlFor="salaryType"
                    className="text-gray-700 dark:text-gray-300 font-semibold"
                  >
                    Salary Type
                  </Label>
                  <Select
                    value={formData.salaryType}
                    onValueChange={(value: SalaryType) =>
                      setFormData((prev) => ({
                        ...prev,
                        salaryType: value,
                        salaryConfig: {},
                      }))
                    }
                  >
                    <SelectTrigger className="apple-input rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 bg-gray-50 dark:bg-gray-700 px-4 py-3 text-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="apple-card rounded-xl border-0 shadow-2xl">
                      <SelectItem
                        value="hourly"
                        className="py-3 px-4 text-base"
                      >
                        ⏰ Hourly Rate
                      </SelectItem>
                      <SelectItem value="daily" className="py-3 px-4 text-base">
                        📅 Daily Rate
                      </SelectItem>
                      <SelectItem
                        value="monthly"
                        className="py-3 px-4 text-base"
                      >
                        📊 Monthly Salary
                      </SelectItem>
                      <SelectItem
                        value="piece-rate"
                        className="py-3 px-4 text-base"
                      >
                        🔢 Piece Rate
                      </SelectItem>
                      <SelectItem
                        value="weight-based"
                        className="py-3 px-4 text-base"
                      >
                        ⚖️ Weight Based
                      </SelectItem>
                      <SelectItem
                        value="meter-based"
                        className="py-3 px-4 text-base"
                      >
                        📏 Meter Based
                      </SelectItem>
                      <SelectItem
                        value="dynamic-date"
                        className="py-3 px-4 text-base"
                      >
                        📈 Dynamic Date Based
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <SalaryConfigForm
                  salaryType={formData.salaryType}
                  config={formData.salaryConfig}
                  onChange={handleSalaryConfigChange}
                />
              </div>
            </div>

            {/* Payment Details Section */}
            <div className="apple-card-inner rounded-3xl p-8 bg-white dark:bg-gray-800 shadow-lg apple-hover">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center">
                  <Banknote className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    Payment Details
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Configure how payments are made to the employee
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <Label
                    htmlFor="preferredMethod"
                    className="text-gray-700 dark:text-gray-300 font-semibold"
                  >
                    Preferred Payment Method
                  </Label>
                  <Select
                    value={formData.paymentDetails.preferredMethod}
                    onValueChange={(value: "bank" | "upi") =>
                      handlePaymentDetailsChange("preferredMethod", value)
                    }
                  >
                    <SelectTrigger className="apple-input rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-400 bg-gray-50 dark:bg-gray-700 px-4 py-3 text-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="apple-card rounded-xl border-0 shadow-2xl">
                      <SelectItem value="bank" className="py-3 px-4 text-base">
                        🏦 Bank Transfer
                      </SelectItem>
                      <SelectItem value="upi" className="py-3 px-4 text-base">
                        📱 UPI Transfer
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.paymentDetails.preferredMethod === "bank" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label
                        htmlFor="accountHolderName"
                        className="text-gray-700 dark:text-gray-300 font-semibold"
                      >
                        Account Holder Name
                      </Label>
                      <Input
                        id="accountHolderName"
                        value={
                          formData.paymentDetails.bankAccount
                            ?.accountHolderName || ""
                        }
                        onChange={(e) =>
                          handleBankAccountChange(
                            "accountHolderName",
                            e.target.value
                          )
                        }
                        className="apple-input rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-400 bg-gray-50 dark:bg-gray-700 px-4 py-3 text-lg"
                        placeholder="e.g., John Doe"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label
                        htmlFor="bankName"
                        className="text-gray-700 dark:text-gray-300 font-semibold"
                      >
                        Bank Name
                      </Label>
                      <Input
                        id="bankName"
                        value={
                          formData.paymentDetails.bankAccount?.bankName || ""
                        }
                        onChange={(e) =>
                          handleBankAccountChange("bankName", e.target.value)
                        }
                        className="apple-input rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-400 bg-gray-50 dark:bg-gray-700 px-4 py-3 text-lg"
                        placeholder="e.g., State Bank of India"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label
                        htmlFor="accountNumber"
                        className="text-gray-700 dark:text-gray-300 font-semibold"
                      >
                        Account Number
                      </Label>
                      <Input
                        id="accountNumber"
                        value={
                          formData.paymentDetails.bankAccount?.accountNumber ||
                          ""
                        }
                        onChange={(e) =>
                          handleBankAccountChange(
                            "accountNumber",
                            e.target.value
                          )
                        }
                        className="apple-input rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-400 bg-gray-50 dark:bg-gray-700 px-4 py-3 text-lg"
                        placeholder="e.g., 1234567890"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label
                        htmlFor="ifscCode"
                        className="text-gray-700 dark:text-gray-300 font-semibold"
                      >
                        IFSC Code
                      </Label>
                      <Input
                        id="ifscCode"
                        value={
                          formData.paymentDetails.bankAccount?.ifscCode || ""
                        }
                        onChange={(e) =>
                          handleBankAccountChange("ifscCode", e.target.value)
                        }
                        className="apple-input rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-400 bg-gray-50 dark:bg-gray-700 px-4 py-3 text-lg"
                        placeholder="e.g., SBIN0000001"
                      />
                    </div>
                  </div>
                )}

                {formData.paymentDetails.preferredMethod === "upi" && (
                  <div className="space-y-3">
                    <Label
                      htmlFor="upiId"
                      className="text-gray-700 dark:text-gray-300 font-semibold"
                    >
                      UPI ID
                    </Label>
                    <Input
                      id="upiId"
                      value={formData.paymentDetails.upi?.upiId || ""}
                      onChange={(e) => handleUpiChange("upiId", e.target.value)}
                      className="apple-input rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-400 bg-gray-50 dark:bg-gray-700 px-4 py-3 text-lg"
                      placeholder="e.g., employee@bankupi"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6">
              <Button
                type="submit"
                className="flex-1 apple-button bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white py-4 rounded-2xl text-lg font-semibold transition-all duration-300 hover:scale-105 shadow-2xl hover:shadow-blue-500/25"
              >
                <Save className="w-5 h-5 mr-2" />
                {employee ? "Update Employee" : "Add Employee"}
                <Sparkles className="w-5 h-5 ml-2" />
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1 apple-button-outline border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 hover:scale-105 bg-white dark:bg-gray-800"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
