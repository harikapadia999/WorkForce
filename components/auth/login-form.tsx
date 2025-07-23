"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { Eye, EyeOff, Mail, Lock, Chrome, Sparkles } from "lucide-react"

interface LoginFormProps {
  onToggleMode: () => void
}

export function LoginForm({ onToggleMode }: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const { signIn, signInWithGoogle } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      await signIn(email, password)
    } catch (error: any) {
      setError(error.message || "Failed to sign in")
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
      <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-8">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-sm">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-3xl font-bold">Welcome Back</CardTitle>
            <CardDescription className="text-blue-100 text-lg">Sign in to your WorkForce Pro account</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-8 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
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
                className="apple-input rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-800 px-4 py-3 text-lg"
                placeholder="Enter your email"
              />
            </div>

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
                  className="apple-input rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-800 px-4 py-3 pr-12 text-lg"
                  placeholder="Enter your password"
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
              className="w-full apple-button bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-4 rounded-2xl text-lg font-semibold transition-all duration-300 hover:scale-105 shadow-2xl disabled:hover:scale-100"
            >
              {loading ? "Signing In..." : "Sign In"}
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
              Sign in with Google
            </Button>
          </div>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Don't have an account?{" "}
            <button onClick={onToggleMode} className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
              Sign up
            </button>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
