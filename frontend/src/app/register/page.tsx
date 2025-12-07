"use client"

import { useEffect } from "react"
import { MainLayout } from "@/components/layout"
import RegisterPage from "@/features/auth/RegisterPage"
import { useAuth } from "@/stores/auth.store"

export default function Register() {
  const { checkAuth } = useAuth()

  useEffect(() => {
    checkAuth()
  }, [])

  return (
    <MainLayout showFooter={false} showSidebar={false}>
      <RegisterPage />
    </MainLayout>
  )
}