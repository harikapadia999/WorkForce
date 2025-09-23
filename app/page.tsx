"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { LoginForm } from "@/components/auth/login-form";
import { SignupForm } from "@/components/auth/signup-form";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmployeeForm } from "@/components/employee-form";
import { EmployeeList } from "@/components/employee-list";
import { useEmployees } from "@/hooks/useEmployees";
import { useSubscription } from "@/hooks/useSubscription";
import type { Employee, DirectPayment } from "@/types/employee";
import {
  Plus,
  Users,
  Sparkles,
  Crown,
  AlertCircle,
  LogOut,
  User,
} from "lucide-react";
import { AttendanceTracker } from "@/components/attendance-tracker";
import { ThemeToggle } from "@/components/theme-toggle";
import { SubscriptionBanner } from "@/components/subscription-banner";
import { SubscriptionModal } from "@/components/subscription-modal";
import { DirectPaymentDialog } from "@/components/direct-payment-dialog";
import { ItemsManager } from "@/components/items/items-manager";

// Import utility functions
import {
  calculateMonthlySalary,
  formatCurrency,
} from "@/utils/salary-calculator";

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen apple-bg flex items-center justify-center p-6">
      <div className="w-full max-w-md apple-float">
        {isLogin ? (
          <LoginForm onToggleMode={() => setIsLogin(false)} />
        ) : (
          <SignupForm onToggleMode={() => setIsLogin(true)} />
        )}
      </div>
    </div>
  );
}

function MainApp() {
  const { employees, loading, addEmployee, updateEmployee, deleteEmployee } =
    useEmployees();
  const { tier, limits, canAddEmployee, isPro } = useSubscription();
  const { user, userProfile, logout } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [selectedPaymentEmployee, setSelectedPaymentEmployee] =
    useState<Employee | null>(null);

  const handleSubmit = (
    employeeData: Omit<Employee, "id" | "createdAt" | "updatedAt">
  ) => {
    if (editingEmployee) {
      updateEmployee(editingEmployee.id, employeeData);
    } else {
      addEmployee(employeeData);
    }
    setShowForm(false);
    setEditingEmployee(null);
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingEmployee(null);
  };

  const handleAddEmployee = () => {
    if (!canAddEmployee(employees.length)) {
      setShowSubscriptionModal(true);
      return;
    }
    setShowForm(true);
  };

  const handlePaymentInitiated = (payment: DirectPayment) => {
    // Here you would typically save the payment to your backend
    console.log("Payment initiated:", payment);
    setSelectedPaymentEmployee(null);
  };

  const getTotalSalaryBudget = () => {
    return employees.reduce((total, employee) => {
      return total + calculateMonthlySalary(employee);
    }, 0);
  };

  const getTotalAdvances = () => {
    return employees.reduce((total, employee) => {
      return (
        total +
        employee.advances
          .filter((advance) => advance.status !== "deducted")
          .reduce((empTotal, advance) => empTotal + advance.amount, 0)
      );
    }, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen apple-bg flex items-center justify-center">
        <div className="apple-card p-8 rounded-3xl">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
            <p className="text-slate-700 dark:text-slate-300 font-medium">
              Loading your workspace...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="min-h-screen apple-bg p-6">
        <div className="apple-float">
          <EmployeeForm
            employee={editingEmployee || undefined}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen apple-bg">
      {/* Apple-style Navigation */}
      <nav className="apple-nav sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-gray-200/50 dark:border-gray-800/50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8  rounded-lg flex items-center justify-center">
                <img
                  src="/logo.png"
                  alt="WorkForce Pro Logo"
                  width={32}
                  height={32}
                />
              </div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                WorkForce Pro
              </h1>
              {isPro && (
                <div className="flex items-center space-x-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                  <Crown className="w-3 h-3" />
                  <span>Pro</span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <User className="w-4 h-4" />
                <span>{userProfile?.displayName || user?.email}</span>
              </div>
              <Button
                onClick={() => setShowSubscriptionModal(true)}
                className="apple-button-outline text-sm px-4 py-2 rounded-xl"
              >
                {isPro ? "Manage Plan" : "Upgrade"}
              </Button>
              <ThemeToggle />
              <Button
                onClick={logout}
                variant="ghost"
                size="sm"
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="apple-float-bg absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-xl"></div>
        <div className="apple-float-bg-delayed absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-pink-400/10 to-orange-400/10 rounded-full blur-xl"></div>
        <div className="apple-float-bg absolute bottom-20 left-1/4 w-40 h-40 bg-gradient-to-br from-green-400/10 to-blue-400/10 rounded-full blur-xl"></div>
      </div>

      <div className="relative z-10 container mx-auto p-6 space-y-8">
        {/* Subscription Banner */}
        <SubscriptionBanner onUpgrade={() => setShowSubscriptionModal(true)} />

        {/* Hero Section */}
        <div className="text-center space-y-6 py-16">
          <div className="apple-float">
            <div className="inline-flex items-center space-x-2 apple-card px-4 py-2 rounded-full text-sm font-medium text-blue-700 dark:text-blue-300 mb-6">
              <Sparkles className="w-4 h-4" />
              <span>Modern Employee Management</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-bold apple-text-gradient leading-tight mb-6">
              Workforce
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                Excellence
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed mb-8">
              Streamline your team management with intelligent salary tracking,
              advance payments, direct employee payments, and comprehensive
              analytics.
            </p>
          </div>

          <div className="apple-float-delayed">
            <Button
              onClick={handleAddEmployee}
              className="apple-button bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-2xl text-lg font-semibold shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add New Employee
            </Button>
            {!canAddEmployee(employees.length) && (
              <p className="text-sm text-orange-600 dark:text-orange-400 mt-2 flex items-center justify-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                Upgrade to Pro for unlimited employees
              </p>
            )}
          </div>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="apple-card p-8 rounded-3xl apple-hover apple-float">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 font-medium mb-2">
                  Total Employees
                </p>
                <p className="text-4xl font-bold apple-text-gradient">
                  {employees.length}
                  {!isPro && (
                    <span className="text-lg text-gray-500 dark:text-gray-500">
                      /{limits.maxEmployees}
                    </span>
                  )}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                  Active in system
                </p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          <div className="apple-card p-8 rounded-3xl apple-hover apple-float-delayed">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 font-medium mb-2">
                  Salary Budget
                </p>
                <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">
                  {formatCurrency(getTotalSalaryBudget() - getTotalAdvances())}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                  After advances
                </p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-2xl text-white font-bold">₹</span>
              </div>
            </div>
          </div>

          <div className="apple-card p-8 rounded-3xl apple-hover apple-float">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 font-medium mb-2">
                  Outstanding
                </p>
                <p className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 dark:from-orange-400 dark:to-red-400 bg-clip-text text-transparent">
                  {formatCurrency(getTotalAdvances())}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                  Pending deductions
                </p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-2xl text-white font-bold">₹</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="apple-card rounded-3xl p-8 apple-float-delayed">
          <Tabs defaultValue="employees" className="space-y-6">
            <TabsList className="apple-tabs grid w-full grid-cols-3 p-2 rounded-2xl">
              <TabsTrigger
                value="employees"
                className="apple-tab-trigger rounded-xl py-3 px-6 font-semibold transition-all duration-300"
              >
                All Employees
              </TabsTrigger>
              <TabsTrigger
                value="attendance"
                className="apple-tab-trigger rounded-xl py-3 px-6 font-semibold transition-all duration-300"
              >
                Attendance
              </TabsTrigger>
              <TabsTrigger
                value="items"
                className="apple-tab-trigger rounded-xl py-3 px-6 font-semibold transition-all duration-300"
              >
                Items
              </TabsTrigger>
            </TabsList>

            <TabsContent value="employees" className="space-y-6">
              <EmployeeList
                employees={employees}
                onEdit={handleEdit}
                onDelete={deleteEmployee}
                onUpdateEmployee={updateEmployee}
                onDirectPayment={setSelectedPaymentEmployee}
              />
            </TabsContent>

            <TabsContent value="attendance" className="space-y-6">
              <AttendanceTracker
                employees={employees}
                updateEmployee={updateEmployee}
              />
            </TabsContent>
            <TabsContent value="items" className="space-y-6">
              <ItemsManager />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Modals */}
      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
      />

      {selectedPaymentEmployee && (
        <DirectPaymentDialog
          employee={selectedPaymentEmployee}
          onClose={() => setSelectedPaymentEmployee(null)}
          onPaymentInitiated={handlePaymentInitiated}
        />
      )}
    </div>
  );
}

export default function EmployeeManagement() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen apple-bg flex items-center justify-center">
        <div className="apple-card p-8 rounded-3xl">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
            <p className="text-slate-700 dark:text-slate-300 font-medium">
              Loading...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return user ? <MainApp /> : <AuthPage />;
}
