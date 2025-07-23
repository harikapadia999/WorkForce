"use client"

import { useState, useEffect } from "react"
import type { SubscriptionTier, SubscriptionLimits } from "@/types/subscription"
import { SUBSCRIPTION_LIMITS } from "@/types/subscription"

export function useSubscription() {
  const [tier, setTier] = useState<SubscriptionTier>("free")
  const [limits, setLimits] = useState<SubscriptionLimits>(SUBSCRIPTION_LIMITS.free)

  useEffect(() => {
    const savedTier = localStorage.getItem("subscriptionTier") as SubscriptionTier
    if (savedTier && (savedTier === "free" || savedTier === "pro")) {
      setTier(savedTier)
      setLimits(SUBSCRIPTION_LIMITS[savedTier])
    }
  }, [])

  const upgradeToPro = () => {
    setTier("pro")
    setLimits(SUBSCRIPTION_LIMITS.pro)
    localStorage.setItem("subscriptionTier", "pro")
  }

  const downgradeToFree = () => {
    setTier("free")
    setLimits(SUBSCRIPTION_LIMITS.free)
    localStorage.setItem("subscriptionTier", "free")
  }

  const canAddEmployee = (currentCount: number) => {
    return currentCount < limits.maxEmployees
  }

  const canAddAdvance = (currentCount: number) => {
    return currentCount < limits.maxAdvances
  }

  const canUseWorkRecords = () => {
    return limits.workRecordsEnabled
  }

  const canExportData = () => {
    return limits.exportEnabled
  }

  return {
    tier,
    limits,
    upgradeToPro,
    downgradeToFree,
    canAddEmployee,
    canAddAdvance,
    canUseWorkRecords,
    canExportData,
    isPro: tier === "pro",
    isFree: tier === "free",
  }
}
