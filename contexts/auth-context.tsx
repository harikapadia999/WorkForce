"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import {
  type User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  type Auth,
} from "firebase/auth"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { db, auth as firebaseAuth } from "@/lib/firebase"

interface UserProfile {
  uid: string
  email: string
  displayName: string
  companyName?: string
  createdAt: string
}

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, displayName: string, companyName?: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth as Auth, async (user) => {
      setUser(user)

      if (user) {
        // Fetch user profile from Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid))
        if (userDoc.exists()) {
          setUserProfile(userDoc.data() as UserProfile)
        }
      } else {
        setUserProfile(null)
      }

      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(firebaseAuth as Auth, email, password)
  }

  const signUp = async (email: string, password: string, displayName: string, companyName?: string) => {
    const { user } = await createUserWithEmailAndPassword(firebaseAuth as Auth, email, password)

    await updateProfile(user, { displayName })

    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email!,
      displayName,
      companyName,
      createdAt: new Date().toISOString(),
    }

    await setDoc(doc(db, "users", user.uid), userProfile)
    setUserProfile(userProfile)
  }

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider()
    const { user } = await signInWithPopup(firebaseAuth as Auth, provider)

    // Check if user profile exists, if not create one
    const userDoc = await getDoc(doc(db, "users", user.uid))
    if (!userDoc.exists()) {
      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email!,
        displayName: user.displayName || user.email!,
        createdAt: new Date().toISOString(),
      }

      await setDoc(doc(db, "users", user.uid), userProfile)
      setUserProfile(userProfile)
    }
  }

  const logout = async () => {
    await signOut(firebaseAuth as Auth)
  }

  const value = {
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
