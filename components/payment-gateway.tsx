"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CreditCard,
  Smartphone,
  Building,
  Shield,
  CheckCircle,
  AlertCircle,
  Loader2,
  Crown,
  Sparkles,
} from "lucide-react";

interface PaymentGatewayProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  plan: "pro";
  amount: number;
}

type PaymentMethod = "card" | "upi" | "netbanking" | "wallet";

interface PaymentDetails {
  method: PaymentMethod;
  cardNumber?: string;
  expiryMonth?: string;
  expiryYear?: string;
  cvv?: string;
  cardholderName?: string;
  upiId?: string;
  bank?: string;
  walletType?: string;
}

export function PaymentGateway({
  isOpen,
  onClose,
  onSuccess,
  plan,
  amount,
}: PaymentGatewayProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({
    method: "card",
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "processing" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handlePaymentSubmit = async () => {
    setIsProcessing(true);
    setPaymentStatus("processing");
    setErrorMessage("");

    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Simulate payment success (90% success rate)
      if (Math.random() > 0.1) {
        setPaymentStatus("success");
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
      } else {
        throw new Error("Payment failed. Please try again.");
      }
    } catch (error) {
      setPaymentStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Payment failed"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const updatePaymentDetails = (updates: Partial<PaymentDetails>) => {
    setPaymentDetails((prev) => ({ ...prev, ...updates }));
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(" ");
    } else {
      return v;
    }
  };

  const getPaymentMethodIcon = (method: PaymentMethod) => {
    switch (method) {
      case "card":
        return <CreditCard className="w-5 h-5" />;
      case "upi":
        return <Smartphone className="w-5 h-5" />;
      case "netbanking":
        return <Building className="w-5 h-5" />;
      case "wallet":
        return <Smartphone className="w-5 h-5" />;
    }
  };

  if (paymentStatus === "success") {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md apple-modal">
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Payment Successful!
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Welcome to WorkForce Pro! Your subscription is now active.
            </p>
            <div className="apple-card-inner rounded-xl p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
              <div className="flex items-center justify-center space-x-2">
                <Crown className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="font-semibold text-green-800 dark:text-green-300">
                  Pro Plan Activated
                </span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto apple-modal">
        <DialogHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 -mx-6 -mt-6 mb-6 rounded-t-lg">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold">
                Upgrade to Pro
              </DialogTitle>
              <DialogDescription className="text-blue-100">
                Secure payment powered by Indian payment gateways
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Summary */}
          <Card className="apple-card-inner rounded-2xl border-0 shadow-lg apple-hover">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-t-2xl">
              <CardTitle className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span>Order Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                    WorkForce Pro
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Unlimited employees & advanced features
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                    ₹{amount.toLocaleString("en-IN")}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    per year
                  </p>
                </div>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Total Amount</span>
                  <span className="text-xl font-bold">
                    ₹{amount.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method Selection */}
          <Card className="apple-card-inner rounded-2xl border-0 shadow-lg apple-hover">
            <CardHeader>
              <CardTitle>Select Payment Method</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  {
                    method: "card" as PaymentMethod,
                    label: "Card",
                    icon: "💳",
                  },
                  { method: "upi" as PaymentMethod, label: "UPI", icon: "📱" },
                  {
                    method: "netbanking" as PaymentMethod,
                    label: "Net Banking",
                    icon: "🏦",
                  },
                  {
                    method: "wallet" as PaymentMethod,
                    label: "Wallet",
                    icon: "👛",
                  },
                ].map(({ method, label, icon }) => (
                  <Button
                    key={method}
                    variant={paymentMethod === method ? "default" : "outline"}
                    onClick={() => {
                      setPaymentMethod(method);
                      updatePaymentDetails({ method });
                    }}
                    className={`apple-button h-16 flex-col space-y-1 ${
                      paymentMethod === method
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                        : "apple-button-outline"
                    }`}
                  >
                    <span className="text-2xl">{icon}</span>
                    <span className="text-sm font-medium">{label}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Payment Details Form */}
          <Card className="apple-card-inner rounded-2xl border-0 shadow-lg apple-hover">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {getPaymentMethodIcon(paymentMethod)}
                <span>Payment Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {paymentMethod === "card" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={paymentDetails.cardNumber || ""}
                      onChange={(e) =>
                        updatePaymentDetails({
                          cardNumber: formatCardNumber(e.target.value),
                        })
                      }
                      maxLength={19}
                      className="apple-input rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 px-4 py-3"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiryMonth">Month</Label>
                      <Select
                        value={paymentDetails.expiryMonth || ""}
                        onValueChange={(value) =>
                          updatePaymentDetails({ expiryMonth: value })
                        }
                      >
                        <SelectTrigger className="apple-input rounded-xl border-2 border-gray-200 dark:border-gray-700">
                          <SelectValue placeholder="MM" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 12 }, (_, i) => (
                            <SelectItem
                              key={i + 1}
                              value={String(i + 1).padStart(2, "0")}
                            >
                              {String(i + 1).padStart(2, "0")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="expiryYear">Year</Label>
                      <Select
                        value={paymentDetails.expiryYear || ""}
                        onValueChange={(value) =>
                          updatePaymentDetails({ expiryYear: value })
                        }
                      >
                        <SelectTrigger className="apple-input rounded-xl border-2 border-gray-200 dark:border-gray-700">
                          <SelectValue placeholder="YY" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 10 }, (_, i) => (
                            <SelectItem
                              key={i}
                              value={String(new Date().getFullYear() + i).slice(
                                -2
                              )}
                            >
                              {String(new Date().getFullYear() + i).slice(-2)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        placeholder="123"
                        value={paymentDetails.cvv || ""}
                        onChange={(e) =>
                          updatePaymentDetails({
                            cvv: e.target.value.replace(/\D/g, "").slice(0, 4),
                          })
                        }
                        className="apple-input rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 px-4 py-3"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cardholderName">Cardholder Name</Label>
                    <Input
                      id="cardholderName"
                      placeholder="John Doe"
                      value={paymentDetails.cardholderName || ""}
                      onChange={(e) =>
                        updatePaymentDetails({ cardholderName: e.target.value })
                      }
                      className="apple-input rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 px-4 py-3"
                    />
                  </div>
                </div>
              )}

              {paymentMethod === "upi" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="upiId">UPI ID</Label>
                    <Input
                      id="upiId"
                      placeholder="yourname@paytm"
                      value={paymentDetails.upiId || ""}
                      onChange={(e) =>
                        updatePaymentDetails({ upiId: e.target.value })
                      }
                      className="apple-input rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 px-4 py-3"
                    />
                  </div>
                  <div className="apple-card-inner rounded-xl p-4 bg-blue-50 dark:bg-blue-900/20">
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                      💡 You can also scan QR code or use popular UPI apps like
                      PhonePe, Google Pay, Paytm
                    </p>
                  </div>
                </div>
              )}

              {paymentMethod === "netbanking" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bank">Select Bank</Label>
                    <Select
                      value={paymentDetails.bank || ""}
                      onValueChange={(value) =>
                        updatePaymentDetails({ bank: value })
                      }
                    >
                      <SelectTrigger className="apple-input rounded-xl border-2 border-gray-200 dark:border-gray-700">
                        <SelectValue placeholder="Choose your bank" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sbi">State Bank of India</SelectItem>
                        <SelectItem value="hdfc">HDFC Bank</SelectItem>
                        <SelectItem value="icici">ICICI Bank</SelectItem>
                        <SelectItem value="axis">Axis Bank</SelectItem>
                        <SelectItem value="kotak">
                          Kotak Mahindra Bank
                        </SelectItem>
                        <SelectItem value="pnb">
                          Punjab National Bank
                        </SelectItem>
                        <SelectItem value="bob">Bank of Baroda</SelectItem>
                        <SelectItem value="canara">Canara Bank</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {paymentMethod === "wallet" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="walletType">Select Wallet</Label>
                    <Select
                      value={paymentDetails.walletType || ""}
                      onValueChange={(value) =>
                        updatePaymentDetails({ walletType: value })
                      }
                    >
                      <SelectTrigger className="apple-input rounded-xl border-2 border-gray-200 dark:border-gray-700">
                        <SelectValue placeholder="Choose wallet" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="paytm">Paytm Wallet</SelectItem>
                        <SelectItem value="phonepe">PhonePe Wallet</SelectItem>
                        <SelectItem value="googlepay">Google Pay</SelectItem>
                        <SelectItem value="amazonpay">Amazon Pay</SelectItem>
                        <SelectItem value="mobikwik">MobiKwik</SelectItem>
                        <SelectItem value="freecharge">FreeCharge</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Security Badge */}
          <div className="apple-card-inner rounded-xl p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30 apple-hover">
            <div className="flex items-center space-x-3">
              <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
              <div>
                <p className="font-semibold text-green-800 dark:text-green-300">
                  Secure Payment
                </p>
                <p className="text-sm text-green-600 dark:text-green-400">
                  Your payment is protected by 256-bit SSL encryption
                </p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {paymentStatus === "error" && (
            <div className="apple-card-inner rounded-xl p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 apple-hover">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                <div>
                  <p className="font-semibold text-red-800 dark:text-red-300">
                    Payment Failed
                  </p>
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {errorMessage}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Payment Button */}
          <div className="flex gap-4">
            <Button
              onClick={handlePaymentSubmit}
              disabled={isProcessing || paymentStatus === "processing"}
              className="flex-1 apple-button bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-4 rounded-2xl text-lg font-semibold transition-all duration-300 hover:scale-105 shadow-2xl disabled:hover:scale-100"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing Payment...
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5 mr-2" />
                  Pay ₹{amount.toLocaleString("en-IN")} Securely
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isProcessing}
              className="apple-button-outline px-8 py-4 border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 rounded-2xl font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-50 bg-transparent"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
