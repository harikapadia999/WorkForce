export interface PaymentMethod {
  id: string;
  name: string;
  type: "card" | "upi" | "netbanking" | "wallet";
  icon: string;
  enabled: boolean;
}

export interface PaymentTransaction {
  id: string;
  amount: number;
  currency: "INR";
  status: "pending" | "processing" | "success" | "failed" | "cancelled";
  method: PaymentMethod;
  createdAt: string;
  completedAt?: string;
  failureReason?: string;
  gatewayTransactionId?: string;
}

export interface PaymentGatewayConfig {
  merchantId: string;
  apiKey: string;
  environment: "sandbox" | "production";
  supportedMethods: PaymentMethod[];
  webhookUrl: string;
}

export const INDIAN_PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "card",
    name: "Credit/Debit Card",
    type: "card",
    icon: "💳",
    enabled: true,
  },
  {
    id: "upi",
    name: "UPI",
    type: "upi",
    icon: "📱",
    enabled: true,
  },
  {
    id: "netbanking",
    name: "Net Banking",
    type: "netbanking",
    icon: "🏦",
    enabled: true,
  },
  {
    id: "wallet",
    name: "Digital Wallet",
    type: "wallet",
    icon: "👛",
    enabled: true,
  },
];

export const SUPPORTED_BANKS = [
  { id: "sbi", name: "State Bank of India", logo: "🏦" },
  { id: "hdfc", name: "HDFC Bank", logo: "🏦" },
  { id: "icici", name: "ICICI Bank", logo: "🏦" },
  { id: "axis", name: "Axis Bank", logo: "🏦" },
  { id: "kotak", name: "Kotak Mahindra Bank", logo: "🏦" },
  { id: "pnb", name: "Punjab National Bank", logo: "🏦" },
  { id: "bob", name: "Bank of Baroda", logo: "🏦" },
  { id: "canara", name: "Canara Bank", logo: "🏦" },
];

export const SUPPORTED_WALLETS = [
  { id: "paytm", name: "Paytm Wallet", logo: "💳" },
  { id: "phonepe", name: "PhonePe Wallet", logo: "📱" },
  { id: "googlepay", name: "Google Pay", logo: "📱" },
  { id: "amazonpay", name: "Amazon Pay", logo: "🛒" },
  { id: "mobikwik", name: "MobiKwik", logo: "💳" },
  { id: "freecharge", name: "FreeCharge", logo: "⚡" },
];
