"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { Eye, EyeOff, Mail, Lock, User, Building, Chrome, Sparkles } from "lucide-react"

interface SignupFormProps {
  onToggleMode: () => void
}

export function SignupForm({ onToggleMode }: SignupFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const { signUp, signInWithGoogle } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      setLoading(false)
      return
    }

    try {
      await signUp(email, password, displayName, companyName)
    } catch (error: any) {
      setError(error.message || "Failed to create account")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError("")

    try {
      await signInWithGoogle()
    } catch (error: any) {
      setError(error.message || "Failed to sign in with Google")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="apple-card rounded-3xl border-0 shadow-2xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-8">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-sm">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-3xl font-bold">Get Started</CardTitle>
            <CardDescription className="text-green-100 text-lg">Create your WorkForce Pro account</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-8 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="displayName" className="text-gray-700 dark:text-gray-300 font-semibold flex items-center">
                <User className="w-4 h-4 mr-2" />
                Full Name
              </Label>
              <Input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                className="apple-input rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-green-500 dark:focus:border-green-400 bg-white dark:bg-gray-800 px-4 py-3 text-lg"
                placeholder="Enter your full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyName" className="text-gray-700 dark:text-gray-300 font-semibold flex items-center">
                <Building className="w-4 h-4 mr-2" />
                Company Name (Optional)
              </Label>
              <Input
                id="companyName"
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="apple-input rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-green-500 dark:focus:border-green-400 bg-white dark:bg-gray-800 px-4 py-3 text-lg"
                placeholder="Enter company name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-700 dark:text-gray-300 font-semibold flex items-center">
              <Mail className="w-4 h-4 mr-2" />
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="apple-input rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-green-500 dark:focus:border-green-400 bg-white dark:bg-gray-800 px-4 py-3 text-lg"
              placeholder="Enter your email"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 dark:text-gray-300 font-semibold flex items-center">
                <Lock className="w-4 h-4 mr-2" />
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="apple-input rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-green-500 dark:focus:border-green-400 bg-white dark:bg-gray-800 px-4 py-3 pr-12 text-lg"
                  placeholder="Create password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="confirmPassword"
                className="text-gray-700 dark:text-gray-300 font-semibold flex items-center"
              >
                <Lock className="w-4 h-4 mr-2" />
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="apple-input rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-green-500 dark:focus:border-green-400 bg-white dark:bg-gray-800 px-4 py-3 pr-12 text-lg"
                  placeholder="Confirm password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>

          {error && (
            <div className="apple-card-inner rounded-xl p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30">
              <p className="text-red-800 dark:text-red-300 text-sm font-medium">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <Button
              type="submit"
              disabled={loading}
              className="w-full apple-button bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-4 rounded-2xl text-lg font-semibold transition-all duration-300 hover:scale-105 shadow-2xl disabled:hover:scale-100"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-medium">
                  Or continue with
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full apple-button-outline border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 hover:scale-105 bg-white dark:bg-gray-800"
            >
              <Chrome className="w-5 h-5 mr-2" />
              Sign up with Google
            </Button>
          </div>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Already have an account?{" "}
            <button onClick={onToggleMode} className="text-green-600 dark:text-green-400 font-semibold hover:underline">
              Sign in
            </button>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
