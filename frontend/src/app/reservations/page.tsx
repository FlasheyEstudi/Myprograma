"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  Star,
  MoreHorizontal,
  X,
  Check,
  AlertCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PageContainer } from "@/components/shared"
import { LoadingSpinner } from "@/components/shared"
import { ErrorState } from "@/components/shared"
import { reservationsApi } from "@/api"
import { Reservation, ReservationStatus } from "@/api/types"
import { useApi } from "@/hooks/use-api"
import { useAuth } from "@/stores/auth.store"
import { useToast } from "@/hooks/use-toast"

const statusConfig = {
  PENDING: {
    label: "Pendiente",
    variant: "secondary" as const,
    icon: AlertCircle,
    color: "text-yellow-600"
  },
  CONFIRMED: {
    label: "Confirmada",
    variant: "default" as const,
    icon: Check,
    color: "text-green-600"
  },
  CANCELLED: {
    label: "Cancelada",
    variant: "destructive" as const,
    icon: X,
    color: "text-red-600"
  },
  COMPLETED: {
    label: "Completada",
    variant: "secondary" as const,
    icon: Check,
    color: "text-blue-600"
  },
  NO_SHOW: {
    label: "No se presentó",
    variant: "destructive" as const,
    icon: X,
    color: "text-red-600"
  }
}

export default function ReservationsPage() {
  const { user } = useAuth()
  const { data: reservations, isLoading, error, execute } = useApi<{ data: Reservation[], meta: any }>()
  const [cancelling, setCancelling] = useState<string | null>(null)
  const toast = useToast()

  const loadReservations = async () => {
    await execute(() => reservationsApi.getUserReservations({ limit: 20 }))
  }

  useEffect(() => {
    if (user) {
      loadReservations()
    }
  }, [user])

  const handleCancelReservation = async (reservationId: string) => {
    setCancelling(reservationId)
    try {
      await reservationsApi.cancelReservation(reservationId)
      toast.success("Reserva Cancelada", "Tu reserva ha sido cancelada exitosamente")
      loadReservations()
    } catch (error) {
      toast.error("Error", "No se pudo cancelar la reserva")
    } finally {
      setCancelling(null)
    }
  }

  if (!user) {
    return (
      <PageContainer>
        <ErrorState
          title="Inicia Sesión"
          description="Debes iniciar sesión para ver tus reservas"
        />
      </PageContainer>
    )
  }

  if (error) {
    return (
      <PageContainer title="Mis Reservas">
        <ErrorState
          title="Error al cargar reservas"
          description="No pudimos cargar tus reservas. Inténtalo de nuevo."
          error={error}
          onRetry={loadReservations}
        />
      </PageContainer>
    )
  }

  return (
    <PageContainer 
      title="Mis Reservas" 
      description="Gestiona tus reservas de restaurantes"
    >
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-6 bg-muted rounded w-1/3 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : reservations?.data && reservations.data.length > 0 ? (
        <div className="space-y-4">
          {reservations.data.map((reservation) => {
            const statusInfo = statusConfig[reservation.status]
            const StatusIcon = statusInfo.icon

            return (
              <Card key={reservation.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex-1 space-y-4">
                      {/* Restaurant Info */}
                      <div>
                        <h3 className="text-lg font-semibold mb-2">
                          {reservation.restaurant?.name}
                        </h3>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {format(new Date(reservation.reservationDate), "dd MMM yyyy", { locale: es })}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{reservation.reservationTime}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{reservation.partySize} personas</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span className="line-clamp-1">{reservation.restaurant?.address}</span>
                          </div>
                        </div>
                      </div>

                      {/* Table Info */}
                      <div className="flex items-center gap-4">
                        <div className="text-sm">
                          <span className="font-medium">Mesa:</span> {reservation.table?.tableNumber}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Capacidad:</span> {reservation.table?.capacity} personas
                        </div>
                      </div>

                      {/* Special Requests */}
                      {reservation.specialRequests && (
                        <div className="text-sm">
                          <span className="font-medium">Solicitudes especiales:</span>
                          <p className="text-muted-foreground mt-1">{reservation.specialRequests}</p>
                        </div>
                      )}
                    </div>

                    {/* Status and Actions */}
                    <div className="flex flex-col items-end gap-3">
                      <Badge variant={statusInfo.variant} className="flex items-center gap-1">
                        <StatusIcon className="h-3 w-3" />
                        {statusInfo.label}
                      </Badge>

                      {reservation.status === 'PENDING' || reservation.status === 'CONFIRMED' ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleCancelReservation(reservation.id)}
                              disabled={cancelling === reservation.id}
                              className="text-destructive"
                            >
                              {cancelling === reservation.id ? (
                                <LoadingSpinner />
                              ) : (
                                <>
                                  <X className="mr-2 h-4 w-4" />
                                  Cancelar Reserva
                                </>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : null}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No tienes reservas</h3>
          <p className="text-muted-foreground mb-4">
            ¡Es hora de hacer tu primera reserva!
          </p>
          <Button asChild>
            <a href="/restaurants">Explorar Restaurantes</a>
          </Button>
        </div>
      )}
    </PageContainer>
  )
}