"use client"

import { useEffect } from "react"
import Link from "next/link"
import {
  Store,
  Table as TableIcon,
  Users,
  Star,
  TrendingUp,
  Calendar
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageContainer } from "@/components/shared"
import { LoadingSpinner } from "@/components/shared"
import { restaurantsApi, tablesApi, reservationsApi } from "@/api"
import { useApi } from "@/hooks/use-api"
import { useIsAdmin } from "@/hooks/use-auth"

interface DashboardStats {
  totalRestaurants: number
  totalTables: number
  totalReservations: number
  averageRating: number
}

export default function AdminDashboardPage() {
  const { isAdmin, isLoading: adminLoading } = useIsAdmin()
  
  const { data: stats, isLoading: statsLoading } = useApi<DashboardStats>()
  const { data: recentReservations, isLoading: reservationsLoading } = useApi<any[]>()
  
  useEffect(() => {
    if (isAdmin) {
      loadDashboardData()
    }
  }, [isAdmin])

  const loadDashboardData = async () => {
    try {
      // Load basic stats
      const restaurantsResponse = await restaurantsApi.getRestaurants({ limit: 1 })
      const tablesResponse = await tablesApi.getTables({ limit: 1 })
      const reservationsResponse = await reservationsApi.getReservations({ limit: 1 })
      
      const dashboardStats: DashboardStats = {
        totalRestaurants: restaurantsResponse.meta.total,
        totalTables: tablesResponse.meta.total,
        totalReservations: reservationsResponse.meta.total,
        averageRating: 0 // Would need to calculate from reviews
      }
      
      // Load recent reservations
      const recentReservationsData = await reservationsApi.getReservations({ 
        limit: 5,
        sortBy: "createdAt",
        sortOrder: "desc"
      })
      
      return {
        stats: dashboardStats,
        recentReservations: recentReservationsData.data
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error)
      return null
    }
  }

  if (adminLoading) {
    return <LoadingSpinner fullScreen />
  }

  if (!isAdmin) {
    return (
      <PageContainer>
        <div className="text-center text-destructive py-8">
          No tienes permisos para acceder a esta página.
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer 
      title="Panel de Administración" 
      description="Resumen del sistema de reservas"
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Restaurantes</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalRestaurants || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Total de restaurantes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mesas</CardTitle>
            <TableIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalTables || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Total de mesas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reservas</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalReservations || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Total de reservas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rating Promedio</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.averageRating.toFixed(1) || "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              Calificación promedio
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link href="/admin/restaurants">
            <CardContent className="p-6 text-center">
              <Store className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h3 className="font-medium">Gestionar Restaurantes</h3>
              <p className="text-sm text-muted-foreground">
                Administra todos los restaurantes
              </p>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link href="/admin/tables">
            <CardContent className="p-6 text-center">
              <TableIcon className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h3 className="font-medium">Gestionar Mesas</h3>
              <p className="text-sm text-muted-foreground">
                Administra todas las mesas
              </p>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link href="/admin/users">
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h3 className="font-medium">Gestionar Usuarios</h3>
              <p className="text-sm text-muted-foreground">
                Administra todos los usuarios
              </p>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link href="/admin/reservations">
            <CardContent className="p-6 text-center">
              <Calendar className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h3 className="font-medium">Ver Reservas</h3>
              <p className="text-sm text-muted-foreground">
                Todas las reservas del sistema
              </p>
            </CardContent>
          </Link>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
        </CardHeader>
        <CardContent>
          {reservationsLoading ? (
            <LoadingSpinner />
          ) : recentReservations && recentReservations.length > 0 ? (
            <div className="space-y-4">
              {recentReservations.map((reservation) => (
                <div key={reservation.id} className="flex items-center justify-between border-b pb-2">
                  <div>
                    <p className="font-medium">{reservation.restaurant?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {reservation.user?.name} - {reservation.partySize} personas
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{reservation.status}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(reservation.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No hay actividad reciente
            </p>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  )
}