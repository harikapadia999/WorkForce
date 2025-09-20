"use client";

import { useState } from "react";
import type { PaymentTransaction, PaymentMethod } from "@/types/payment";

export function usePayment() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentTransaction, setCurrentTransaction] =
    useState<PaymentTransaction | null>(null);

  const initiatePayment = async (
    amount: number,
    method: PaymentMethod,
    details: Record<string, any>
  ): Promise<PaymentTransaction> => {
    setIsProcessing(true);

    const transaction: PaymentTransaction = {
      id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount,
      currency: "INR",
      status: "pending",
      method,
      createdAt: new Date().toISOString(),
    };

    setCurrentTransaction(transaction);

    try {
      // Simulate payment gateway API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Simulate different payment outcomes based on method
      const successRate = getSuccessRateByMethod(method.type);
      const isSuccess = Math.random() < successRate;

      if (isSuccess) {
        const completedTransaction = {
          ...transaction,
          status: "success" as const,
          completedAt: new Date().toISOString(),
          gatewayTransactionId: `gw_${Math.random()
            .toString(36)
            .substr(2, 12)}`,
        };
        setCurrentTransaction(completedTransaction);
        return completedTransaction;
      } else {
        const failedTransaction = {
          ...transaction,
          status: "failed" as const,
          completedAt: new Date().toISOString(),
          failureReason: getRandomFailureReason(method.type),
        };
        setCurrentTransaction(failedTransaction);
        return failedTransaction;
      }
    } catch (error) {
      const failedTransaction = {
        ...transaction,
        status: "failed" as const,
        completedAt: new Date().toISOString(),
        failureReason: "Network error occurred",
      };
      setCurrentTransaction(failedTransaction);
      return failedTransaction;
    } finally {
      setIsProcessing(false);
    }
  };

  const getSuccessRateByMethod = (methodType: string): number => {
    switch (methodType) {
      case "upi":
        return 0.95; // UPI has highest success rate
      case "card":
        return 0.9;
      case "netbanking":
        return 0.85;
      case "wallet":
        return 0.92;
      default:
        return 0.85;
    }
  };

  const getRandomFailureReason = (methodType: string): string => {
    const commonReasons = [
      "Insufficient funds",
      "Transaction declined by bank",
      "Network timeout",
      "Invalid credentials",
    ];

    const methodSpecificReasons = {
      card: ["Card expired", "CVV mismatch", "Card blocked"],
      upi: [
        "UPI ID not found",
        "UPI app not responding",
        "Daily limit exceeded",
      ],
      netbanking: ["Bank server down", "Session expired", "Invalid login"],
      wallet: ["Wallet balance insufficient", "Wallet temporarily blocked"],
    };

    const reasons = [
      ...commonReasons,
      ...(methodSpecificReasons[
        methodType as keyof typeof methodSpecificReasons
      ] || []),
    ];
    return reasons[Math.floor(Math.random() * reasons.length)];
  };

  const retryPayment = async (): Promise<PaymentTransaction | null> => {
    if (!currentTransaction) return null;

    return initiatePayment(
      currentTransaction.amount,
      currentTransaction.method,
      {}
    );
  };

  const cancelPayment = () => {
    if (currentTransaction) {
      setCurrentTransaction({
        ...currentTransaction,
        status: "cancelled",
        completedAt: new Date().toISOString(),
      });
    }
    setIsProcessing(false);
  };

  return {
    isProcessing,
    currentTransaction,
    initiatePayment,
    retryPayment,
    cancelPayment,
  };
}
