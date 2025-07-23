"use client"

import { Button } from "@/components/ui/button"
import { useSubscription } from "@/hooks/useSubscription"
import { Crown, Sparkles, ArrowRight } from "lucide-react"

interface SubscriptionBannerProps {
  onUpgrade: () => void
}

export function SubscriptionBanner({ onUpgrade }: SubscriptionBannerProps) {
  const { isFree } = useSubscription()

  if (!isFree) return null

  return (
    <div className="apple-card bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800/30 rounded-2xl p-6 mb-8 apple-hover apple-float">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <Crown className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">Unlock Premium Features</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Get unlimited employees, work tracking, and advanced reports
            </p>
          </div>
        </div>
        <Button
          onClick={onUpgrade}
          className="apple-button bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 shadow-lg"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Upgrade to Pro
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}
