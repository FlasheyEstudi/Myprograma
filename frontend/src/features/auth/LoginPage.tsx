"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { LoginForm, RegisterForm } from "@/components/forms"
import { useAuth } from "@/stores/auth.store"
import { LoadingSpinner } from "@/components/shared"

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  // Redirect if already authenticated
  if (isAuthenticated) {
    router.push("/")
    return <LoadingSpinner fullScreen />
  }

  if (isLoading) {
    return <LoadingSpinner fullScreen />
  }

  const handleSuccess = () => {
    router.push("/")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
      <div className="w-full max-w-md">
        {isLogin ? (
          <LoginForm
            onSuccess={handleSuccess}
            onSwitchToRegister={() => setIsLogin(false)}
          />
        ) : (
          <RegisterForm
            onSuccess={handleSuccess}
            onSwitchToLogin={() => setIsLogin(true)}
          />
        )}
      </div>
    </div>
  )
}