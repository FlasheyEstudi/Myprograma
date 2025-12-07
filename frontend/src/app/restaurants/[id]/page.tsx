"use client"

import { useEffect } from "react"
import { MainLayout } from "@/components/layout"
import RestaurantDetailPage from "@/features/restaurants/RestaurantDetailPage"
import { useAuth } from "@/stores/auth.store"

export default function RestaurantDetail() {
  const { checkAuth } = useAuth()

  useEffect(() => {
    checkAuth()
  }, [])

  return (
    <MainLayout showFooter={true} showSidebar={true}>
      <RestaurantDetailPage />
    </MainLayout>
  )
}