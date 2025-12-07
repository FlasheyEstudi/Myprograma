"use client"

import { useEffect } from "react"
import { MainLayout } from "@/components/layout"
import LoginPage from "@/features/auth/LoginPage"
import { useAuth } from "@/stores/auth.store"

export default function Login() {
  const { checkAuth } = useAuth()

  useEffect(() => {
    checkAuth()
  }, [])

  return (
    <MainLayout showFooter={false} showSidebar={false}>
      <LoginPage />
    </MainLayout>
  )
}