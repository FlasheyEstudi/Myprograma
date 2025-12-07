"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
  Star,
  MapPin,
  Clock,
  Users,
  DollarSign,
  Phone,
  Mail,
  ArrowLeft,
  Calendar,
  Edit
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageContainer } from "@/components/shared"
import { LoadingSpinner } from "@/components/shared"
import { ErrorState } from "@/components/shared"
import { restaurantsApi, reviewsApi, tablesApi } from "@/api"
import { RestaurantWithDetails, Review, Table } from "@/api/types"
import { useApi } from "@/hooks/use-api"
import { useAuth } from "@/stores/auth.store"
import { useIsAdmin } from "@/hooks/use-auth"

export default function RestaurantDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { isAdmin } = useIsAdmin()
  
  const [activeTab, setActiveTab] = useState("info")
  
  const { data: restaurant, isLoading: restaurantLoading, error: restaurantError } = useApi<RestaurantWithDetails>()
  const { data: reviews, isLoading: reviewsLoading, execute: loadReviews } = useApi<{ data: Review[], meta: any }>()
  const { data: tables, isLoading: tablesLoading, execute: loadTables } = useApi<{ data: Table[], meta: any }>()

  const loadRestaurant = async () => {
    if (!id) return
    await restaurant.execute(() => restaurantsApi.getRestaurantById(id as string))
  }

  const loadRestaurantReviews = async () => {
    if (!id) return
    await loadReviews(() => reviewsApi.getReviews({ restaurantId: id as string, limit: 10 }))
  }

  const loadRestaurantTables = async () => {
    if (!id) return
    await loadTables(() => tablesApi.getTables({ restaurantId: id as string }))
  }

  useEffect(() => {
    loadRestaurant()
  }, [id])

  useEffect(() => {
    if (restaurant && activeTab === "reviews") {
      loadRestaurantReviews()
    }
    if (restaurant && activeTab === "tables") {
      loadRestaurantTables()
    }
  }, [activeTab, restaurant])

  if (restaurantLoading) {
    return (
      <PageContainer>
        <LoadingSpinner fullScreen />
      </PageContainer>
    )
  }

  if (restaurantError || !restaurant) {
    return (
      <PageContainer>
        <ErrorState
          title="Restaurante no encontrado"
          description="No pudimos encontrar el restaurante que buscas."
          error={restaurantError}
          onRetry={loadRestaurant}
        />
      </PageContainer>
    )
  }

  const priceLabels = {
    LOW: "$",
    MEDIUM: "$$",
    HIGH: "$$$",
    PREMIUM: "$$$$"
  }

  return (
    <PageContainer>
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          className="mb-4"
          leftIcon={<ArrowLeft className="h-4 w-4" />}
          onClick={() => router.back()}
        >
          Volver
        </Button>
        
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-start gap-4 mb-4">
              <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-bold text-2xl">
                  {restaurant.name.charAt(0)}
                </span>
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">{restaurant.name}</h1>
                <p className="text-muted-foreground text-lg mb-3">
                  {restaurant.description}
                </p>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <Badge variant="secondary">{restaurant.cuisine}</Badge>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">
                      {restaurant.averageRating?.toFixed(1) || "N/A"}
                    </span>
                    {restaurant.reviewCount && (
                      <span className="text-muted-foreground">
                        ({restaurant.reviewCount} reseñas)
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span>{priceLabels[restaurant.priceRange]}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 lg:w-auto">
            <Button size="lg" className="w-full" asChild>
              <Link href={`/restaurants/${restaurant.id}/reserve`}>
                <Calendar className="mr-2 h-4 w-4" />
                Hacer Reserva
              </Link>
            </Button>
            {isAdmin && (
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/admin/restaurants/${restaurant.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar Restaurante
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Dirección</p>
                <p className="text-sm text-muted-foreground">{restaurant.address}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Horario</p>
                <p className="text-sm text-muted-foreground">
                  {restaurant.openingTime} - {restaurant.closingTime}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Capacidad</p>
                <p className="text-sm text-muted-foreground">{restaurant.maxCapacity} personas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Contacto</p>
                <p className="text-sm text-muted-foreground">
                  {restaurant.phone || "No disponible"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="info">Información</TabsTrigger>
          <TabsTrigger value="reviews">Reseñas</TabsTrigger>
          <TabsTrigger value="tables">Mesas</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Información del Restaurante</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Descripción</h4>
                <p className="text-muted-foreground">
                  {restaurant.description || "No hay descripción disponible."}
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Servicios</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">Reservas en línea</Badge>
                  <Badge variant="outline">Pago con tarjeta</Badge>
                  <Badge variant="outline">Estacionamiento</Badge>
                </div>
              </div>

              {restaurant.email && (
                <div>
                  <h4 className="font-medium mb-2">Email</h4>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{restaurant.email}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Reseñas</CardTitle>
            </CardHeader>
            <CardContent>
              {reviewsLoading ? (
                <LoadingSpinner />
              ) : reviews?.data && reviews.data.length > 0 ? (
                <div className="space-y-4">
                  {reviews.data.map((review) => (
                    <div key={review.id} className="border-b pb-4 last:border-b-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{review.user?.name || "Anónimo"}</span>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          {review.title && (
                            <h4 className="font-medium mt-1">{review.title}</h4>
                          )}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(review.createdAt), "dd MMM yyyy", { locale: es })}
                        </span>
                      </div>
                      {review.content && (
                        <p className="text-muted-foreground">{review.content}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No hay reseñas aún. ¡Sé el primero en opinar!
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tables" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Mesas Disponibles</CardTitle>
            </CardHeader>
            <CardContent>
              {tablesLoading ? (
                <LoadingSpinner />
              ) : tables?.data && tables.data.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tables.data.map((table) => (
                    <Card key={table.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">Mesa {table.tableNumber}</h4>
                          <Badge variant={table.isAvailable ? "default" : "secondary"}>
                            {table.isAvailable ? "Disponible" : "Ocupada"}
                          </Badge>
                        </div>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>Capacidad: {table.capacity} personas</span>
                          </div>
                          {table.hasWindow && (
                            <div>• Con ventana</div>
                          )}
                          {table.hasOutdoor && (
                            <div>• Exterior</div>
                          )}
                          {table.isPrivate && (
                            <div>• Privada</div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No hay mesas configuradas para este restaurante.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  )
}