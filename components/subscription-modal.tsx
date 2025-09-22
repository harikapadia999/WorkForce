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
import { useSubscription } from "@/hooks/useSubscription";
import { SUBSCRIPTION_FEATURES } from "@/types/subscription";
import { Check, X, Crown, Sparkles } from "lucide-react";
import { PaymentGateway } from "./payment-gateway";

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SubscriptionModal({ isOpen, onClose }: SubscriptionModalProps) {
  const { tier, upgradeToPro, downgradeToFree } = useSubscription();
  const [showPayment, setShowPayment] = useState(false);

  const handleUpgrade = () => {
    setShowPayment(true);
  };

  const handlePaymentSuccess = () => {
    upgradeToPro();
    setShowPayment(false);
    onClose();
  };

  const handleDowngrade = () => {
    downgradeToFree();
    onClose();
  };
  // const PRO_MONTHLY_PRICE = 99; // ₹99 per month
  const PRO_PRICE = 999; // ₹999 per month

  return (
    <>
      <Dialog open={isOpen && !showPayment} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto apple-modal">
          <DialogHeader className="text-center pb-6">
            <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
              Choose Your Plan
            </DialogTitle>
            <DialogDescription className="text-lg text-gray-600 dark:text-gray-400 mt-2">
              Select the perfect plan for your business needs
            </DialogDescription>
          </DialogHeader>

          <div className="grid md:grid-cols-2 gap-8 mt-8">
            {/* Free Plan */}
            <div
              className={`apple-card rounded-3xl p-8 border-2 transition-all duration-300 ${
                tier === "free"
                  ? "border-blue-500 dark:border-blue-400 shadow-lg shadow-blue-500/20"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Free
                </h3>
                <div className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                  ₹0
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  Perfect for small teams
                </p>
              </div>

              <div className="space-y-4 mb-8">
                {SUBSCRIPTION_FEATURES.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="text-xl">{feature.icon}</div>
                    <div className="flex-1">
                      <span className="text-gray-900 dark:text-gray-100 font-medium">
                        {feature.name}
                      </span>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {typeof feature.free === "boolean" ? (
                          feature.free ? (
                            <span className="flex items-center text-green-600 dark:text-green-400">
                              <Check className="w-4 h-4 mr-1" />
                              Included
                            </span>
                          ) : (
                            <span className="flex items-center text-gray-400">
                              <X className="w-4 h-4 mr-1" />
                              Not available
                            </span>
                          )
                        ) : (
                          <span className="text-blue-600 dark:text-blue-400">
                            {feature.free}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                onClick={handleDowngrade}
                disabled={tier === "free"}
                className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 ${
                  tier === "free"
                    ? "bg-blue-600 text-white"
                    : "apple-button-outline border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                }`}
              >
                {tier === "free" ? "Current Plan" : "Switch to Free"}
              </Button>
            </div>

            {/* Pro Plan per Month*/}
            {/* <div
              className={`apple-card rounded-3xl p-8 border-2 transition-all duration-300 relative ${
                tier === "pro"
                  ? "border-blue-500 dark:border-blue-400 shadow-lg shadow-blue-500/20"
                  : "border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700"
              }`}
            > */}
            {/* Popular Badge */}
            {/* <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                  Most Popular
                </div>
              </div>

              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Pro
                </h3>
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent mb-1">
                  ₹{PRO_MONTHLY_PRICE.toLocaleString("en-IN")}
                </div>
                <p className="text-gray-600 dark:text-gray-400">per month</p>
              </div> */}

            {/* <div className="space-y-4 mb-8">
                {SUBSCRIPTION_FEATURES.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="text-xl">{feature.icon}</div>
                    <div className="flex-1">
                      <span className="text-gray-900 dark:text-gray-100 font-medium">
                        {feature.name}
                      </span>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {typeof feature.pro === "boolean" ? (
                          feature.pro ? (
                            <span className="flex items-center text-green-600 dark:text-green-400">
                              <Check className="w-4 h-4 mr-1" />
                              Included
                            </span>
                          ) : (
                            <span className="flex items-center text-gray-400">
                              <X className="w-4 h-4 mr-1" />
                              Not available
                            </span>
                          )
                        ) : (
                          <span className="text-blue-600 dark:text-blue-400">
                            {feature.pro}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                onClick={handleUpgrade}
                disabled={tier === "pro"}
                className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 ${
                  tier === "pro"
                    ? "bg-blue-600 text-white"
                    : "apple-button bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
                }`}
              >
                {tier === "pro"
                  ? "Current Plan"
                  : `Upgrade to Pro - ₹${PRO_MONTHLY_PRICE.toLocaleString(
                      "en-IN"
                    )}/month`}
              </Button> */}
            {/* </div> */}

            {/* Pro Plan per Year*/}
            <div
              className={`apple-card rounded-3xl p-8 border-2 transition-all duration-300 relative ${
                tier === "pro"
                  ? "border-blue-500 dark:border-blue-400 shadow-lg shadow-blue-500/20"
                  : "border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700"
              }`}
            >
              {/* Popular Badge */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                  Most Popular
                </div>
              </div>

              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Pro
                </h3>

                {/* Price Section */}
                <div className="mb-1">
                  {/* Original Price with Strike */}
                  <span className="text-lg text-gray-500 line-through mr-2">
                    ₹{(2399).toLocaleString("en-IN")}
                  </span>

                  {/* Discounted Price */}
                  <span className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                    ₹{PRO_PRICE.toLocaleString("en-IN")}
                  </span>
                </div>

                <p className="text-gray-600 dark:text-gray-400">per year</p>
              </div>

              <div className="space-y-4 mb-8">
                {SUBSCRIPTION_FEATURES.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="text-xl">{feature.icon}</div>
                    <div className="flex-1">
                      <span className="text-gray-900 dark:text-gray-100 font-medium">
                        {feature.name}
                      </span>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {typeof feature.pro === "boolean" ? (
                          feature.pro ? (
                            <span className="flex items-center text-green-600 dark:text-green-400">
                              <Check className="w-4 h-4 mr-1" />
                              Included
                            </span>
                          ) : (
                            <span className="flex items-center text-gray-400">
                              <X className="w-4 h-4 mr-1" />
                              Not available
                            </span>
                          )
                        ) : (
                          <span className="text-blue-600 dark:text-blue-400">
                            {feature.pro}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                onClick={handleUpgrade}
                disabled={tier === "pro"}
                className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 ${
                  tier === "pro"
                    ? "bg-blue-600 text-white"
                    : "apple-button bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
                }`}
              >
                {tier === "pro"
                  ? "Current Plan"
                  : `Upgrade to Pro - ₹${PRO_PRICE.toLocaleString(
                      "en-IN"
                    )}/year`}
              </Button>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-500">
              All plans include 24/7 support and regular updates. Secure
              payments powered by Indian payment gateways.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      <PaymentGateway
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        onSuccess={handlePaymentSuccess}
        plan="pro"
        amount={PRO_PRICE}
      />
    </>
  );
}
