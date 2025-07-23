import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  addDoc,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Subscription, SubscriptionPayment, SubscriptionTier } from "@/types/subscription"

export class SubscriptionService {
  static async createSubscription(userId: string, tier: SubscriptionTier, priceId: string): Promise<Subscription> {
    const now = new Date()
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate())

    const subscription: Subscription = {
      id: crypto.randomUUID(),
      userId,
      tier,
      status: "active",
      currentPeriodStart: now.toISOString(),
      currentPeriodEnd: nextMonth.toISOString(),
      cancelAtPeriodEnd: false,
      priceId,
      customerId: `cust_${userId}`,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    }

    await setDoc(doc(db, "subscriptions", subscription.id), subscription)
    return subscription
  }

  static async getUserSubscription(userId: string): Promise<Subscription | null> {
    const q = query(
      collection(db, "subscriptions"),
      where("userId", "==", userId),
      where("status", "in", ["active", "past_due"]),
      orderBy("createdAt", "desc"),
      limit(1),
    )

    const snapshot = await getDocs(q)
    if (snapshot.empty) return null

    return snapshot.docs[0].data() as Subscription
  }

  static async recordPayment(
    subscriptionId: string,
    amount: number,
    paymentMethod: string,
    transactionId?: string,
  ): Promise<SubscriptionPayment> {
    const payment: SubscriptionPayment = {
      id: crypto.randomUUID(),
      subscriptionId,
      amount,
      currency: "INR",
      status: "paid",
      paymentMethod,
      transactionId,
      paidAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    }

    await addDoc(collection(db, "subscription_payments"), payment)

    // Update subscription period
    const subscription = await getDoc(doc(db, "subscriptions", subscriptionId))
    if (subscription.exists()) {
      const data = subscription.data() as Subscription
      const currentEnd = new Date(data.currentPeriodEnd)
      const newEnd = new Date(currentEnd.getFullYear(), currentEnd.getMonth() + 1, currentEnd.getDate())

      await updateDoc(doc(db, "subscriptions", subscriptionId), {
        currentPeriodEnd: newEnd.toISOString(),
        status: "active",
        updatedAt: new Date().toISOString(),
      })
    }

    return payment
  }

  static async cancelSubscription(subscriptionId: string): Promise<void> {
    await updateDoc(doc(db, "subscriptions", subscriptionId), {
      cancelAtPeriodEnd: true,
      updatedAt: new Date().toISOString(),
    })
  }

  static async reactivateSubscription(subscriptionId: string): Promise<void> {
    await updateDoc(doc(db, "subscriptions", subscriptionId), {
      cancelAtPeriodEnd: false,
      status: "active",
      updatedAt: new Date().toISOString(),
    })
  }

  static async checkAndUpdateExpiredSubscriptions(): Promise<void> {
    const now = new Date()
    const q = query(
      collection(db, "subscriptions"),
      where("status", "==", "active"),
      where("currentPeriodEnd", "<=", now.toISOString()),
    )

    const snapshot = await getDocs(q)

    for (const docSnapshot of snapshot.docs) {
      const subscription = docSnapshot.data() as Subscription

      if (subscription.cancelAtPeriodEnd) {
        await updateDoc(doc(db, "subscriptions", subscription.id), {
          status: "cancelled",
          updatedAt: now.toISOString(),
        })
      } else {
        await updateDoc(doc(db, "subscriptions", subscription.id), {
          status: "past_due",
          updatedAt: now.toISOString(),
        })
      }
    }
  }
}
