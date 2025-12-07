"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, Star, MapPin, Calendar, Utensils } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MainLayout } from "@/components/layout"
import { LoadingSpinner } from "@/components/shared"
import { restaurantsApi } from "@/api"
import { Restaurant } from "@/api/types"
import { useApi } from "@/hooks/use-api"
import { useAuth } from "@/stores/auth.store"
import { useDebounce } from "@/hooks/use-debounce"

export default function HomePage() {
  const { isAuthenticated, user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const debouncedSearch = useDebounce(searchTerm, 300)
  
  const { data: featuredRestaurants, isLoading, execute } = useApi<Restaurant[]>()

  const loadFeaturedRestaurants = async () => {
    await execute(() => 
      restaurantsApi.getRestaurants({ 
        limit: 6, 
        sortBy: "averageRating", 
        sortOrder: "desc",
        search: debouncedSearch || undefined
      }).then(response => response.data)
    )
  }

  useEffect(() => {
    loadFeaturedRestaurants()
  }, [debouncedSearch])

  return (
    <MainLayout showFooter={true} showSidebar={false}>
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 to-secondary/10 py-20">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Descubre los Mejores
                <span className="text-primary"> Restaurantes</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Reserva tu mesa en los mejores restaurantes con solo unos clics. 
                Sin filas, sin esperas, solo buena comida.
              </p>
              
              {!isAuthenticated && (
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                  <Button size="lg" asChild>
                    <Link href="/register">Registrarse</Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link href="/restaurants">Explorar Restaurantes</Link>
                  </Button>
                </div>
              )}

              {/* Search Bar */}
              <div className="max-w-md mx-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar restaurantes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-12 text-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Restaurants */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Restaurantes Destacados</h2>
              <p className="text-muted-foreground text-lg">
                Los restaurantes mejor valorados por nuestra comunidad
              </p>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-muted rounded w-full"></div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : featuredRestaurants && featuredRestaurants.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredRestaurants.map((restaurant) => (
                  <Card key={restaurant.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-1">{restaurant.name}</CardTitle>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {restaurant.description}
                          </p>
                        </div>
                        <Badge variant="secondary" className="ml-2">
                          {restaurant.cuisine}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">
                            {restaurant.averageRating?.toFixed(1) || "N/A"}
                          </span>
                          {restaurant.reviewCount && (
                            <span className="text-muted-foreground">
                              ({restaurant.reviewCount})
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="line-clamp-1">{restaurant.address}</span>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" size="sm" className="flex-1" asChild>
                          <Link href={`/restaurants/${restaurant.id}`}>Ver detalles</Link>
                        </Button>
                        <Button size="sm" className="flex-1" asChild>
                          <Link href={`/restaurants/${restaurant.id}/reserve`}>Reservar</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Utensils className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No se encontraron restaurantes</h3>
                <p className="text-muted-foreground mb-4">
                  Intenta con otros términos de búsqueda
                </p>
                <Button asChild>
                  <Link href="/restaurants">Ver todos los restaurantes</Link>
                </Button>
              </div>
            )}

            <div className="text-center mt-12">
              <Button size="lg" asChild>
                <Link href="/restaurants">
                  Ver Todos los Restaurantes
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        {!isAuthenticated && (
          <section className="py-16 bg-primary text-primary-foreground">
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-3xl font-bold mb-4">
                ¿Listo para empezar a reservar?
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Únete a miles de comensales que ya disfrutan de nuestras reservas convenientes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/register">Crear Cuenta Gratuita</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/restaurants">Explorar sin Registro</Link>
                </Button>
              </div>
            </div>
          </section>
        )}
      </div>
    </MainLayout>
  )
}