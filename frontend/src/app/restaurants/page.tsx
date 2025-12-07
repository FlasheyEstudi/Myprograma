"use client"

import { useEffect } from "react"
import { MainLayout } from "@/components/layout"
import RestaurantListPage from "@/features/restaurants/RestaurantListPage"
import { useAuth } from "@/stores/auth.store"

export default function Restaurants() {
  const { checkAuth } = useAuth()

  useEffect(() => {
    checkAuth()
  }, [])

  return (
    <MainLayout showFooter={true} showSidebar={true}>
      <RestaurantListPage />
    </MainLayout>
  )
}