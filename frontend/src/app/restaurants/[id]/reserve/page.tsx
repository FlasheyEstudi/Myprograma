"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { MainLayout } from "@/components/layout"
import { ReservationForm } from "@/components/features"
import { restaurantsApi } from "@/api"
import { Restaurant } from "@/api/types"
import { useApi } from "@/hooks/use-api"
import { LoadingSpinner } from "@/components/shared"
import { ErrorState } from "@/components/shared"

export default function ReserveRestaurantPage() {
  const params = useParams()
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadRestaurant = async () => {
      try {
        const data = await restaurantsApi.getRestaurantById(params.id as string)
        setRestaurant(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar restaurante")
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      loadRestaurant()
    }
  }, [params.id])

  if (loading) {
    return (
      <MainLayout>
        <LoadingSpinner fullScreen />
      </MainLayout>
    )
  }

  if (error || !restaurant) {
    return (
      <MainLayout>
        <ErrorState
          title="Restaurante no encontrado"
          description="No pudimos encontrar el restaurante para hacer la reserva."
          error={error}
        />
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <ReservationForm
          restaurantId={restaurant.id}
          restaurantName={restaurant.name}
        />
      </div>
    </MainLayout>
  )
}