"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
  Star,
  MapPin,
  Clock,
  Users,
  DollarSign,
  Search,
  Filter,
  Plus
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PageContainer } from "@/components/shared"
import { DataTable } from "@/components/ui/data-table"
import { restaurantsApi } from "@/api"
import { Restaurant, RestaurantFilters, PriceRange } from "@/api/types"
import { useApi } from "@/hooks/use-api"
import { useDebounce } from "@/hooks/use-debounce"
import { useToast } from "@/hooks/use-toast"
import { ColumnDef } from "@tanstack/react-table"

const columns: ColumnDef<Restaurant>[] = [
  {
    accessorKey: "name",
    header: "Restaurante",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
          <span className="text-primary font-bold text-lg">
            {row.original.name.charAt(0)}
          </span>
        </div>
        <div>
          <p className="font-medium">{row.original.name}</p>
          <p className="text-sm text-muted-foreground line-clamp-1">
            {row.original.description}
          </p>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "cuisine",
    header: "Cocina",
    cell: ({ row }) => (
      <Badge variant="secondary">
        {row.original.cuisine || "No especificado"}
      </Badge>
    ),
  },
  {
    accessorKey: "priceRange",
    header: "Precio",
    cell: ({ row }) => {
      const priceRange = row.original.priceRange
      const priceLabels = {
        LOW: "$",
        MEDIUM: "$$",
        HIGH: "$$$",
        PREMIUM: "$$$$"
      }
      return (
        <div className="flex items-center gap-1">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">
            {priceLabels[priceRange]}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "address",
    header: "Ubicación",
    cell: ({ row }) => (
      <div className="flex items-center gap-1 text-sm text-muted-foreground">
        <MapPin className="h-4 w-4" />
        <span className="line-clamp-1">{row.original.address}</span>
      </div>
    ),
  },
  {
    accessorKey: "averageRating",
    header: "Rating",
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        <span className="font-medium">
          {row.original.averageRating?.toFixed(1) || "N/A"}
        </span>
        {row.original.reviewCount && (
          <span className="text-sm text-muted-foreground">
            ({row.original.reviewCount})
          </span>
        )}
      </div>
    ),
  },
  {
    accessorKey: "maxCapacity",
    header: "Capacidad",
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <Users className="h-4 w-4 text-muted-foreground" />
        <span>{row.original.maxCapacity} personas</span>
      </div>
    ),
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => (
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/restaurants/${row.original.id}`}>Ver</Link>
        </Button>
        <Button size="sm" asChild>
          <Link href={`/restaurants/${row.original.id}/reserve`}>Reservar</Link>
        </Button>
      </div>
    ),
  },
]

export default function RestaurantsPage() {
  const [filters, setFilters] = useState<RestaurantFilters>({
    page: 1,
    limit: 12,
  })
  const [searchTerm, setSearchTerm] = useState("")
  const debouncedSearch = useDebounce(searchTerm, 300)
  const toast = useToast()

  const { data, isLoading, error, execute } = useApi<PaginatedResponse<Restaurant>>()

  const loadRestaurants = async () => {
    await execute(() => restaurantsApi.getRestaurants({
      ...filters,
      search: debouncedSearch || undefined,
    }))
  }

  useEffect(() => {
    loadRestaurants()
  }, [filters, debouncedSearch])

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setFilters(prev => ({ ...prev, page: 1 }))
  }

  const handleFilterChange = (key: keyof RestaurantFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
  }

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
  }

  if (error) {
    return (
      <PageContainer 
        title="Restaurantes" 
        description="Descubre los mejores restaurantes"
      >
        <div className="text-center text-destructive py-8">
          Error al cargar restaurantes: {error}
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer 
      title="Restaurantes" 
      description="Descubre los mejores restaurantes y reserva tu mesa"
    >
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar restaurantes..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <div className="flex gap-2">
          <Select
            value={filters.cuisine || ""}
            onValueChange={(value) => handleFilterChange("cuisine", value || undefined)}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Cocina" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas</SelectItem>
              <SelectItem value="Italiana">Italiana</SelectItem>
              <SelectItem value="Japonesa">Japonesa</SelectItem>
              <SelectItem value="Mexicana">Mexicana</SelectItem>
              <SelectItem value="Americana">Americana</SelectItem>
              <SelectItem value="China">China</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.priceRange || ""}
            onValueChange={(value) => handleFilterChange("priceRange", value || undefined)}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Precio" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              <SelectItem value={PriceRange.LOW}>$</SelectItem>
              <SelectItem value={PriceRange.MEDIUM}>$$</SelectItem>
              <SelectItem value={PriceRange.HIGH}>$$$</SelectItem>
              <SelectItem value={PriceRange.PREMIUM}>$$$$</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.sortBy || ""}
            onValueChange={(value) => handleFilterChange("sortBy", value || undefined)}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Ordenar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Relevancia</SelectItem>
              <SelectItem value="name">Nombre</SelectItem>
              <SelectItem value="averageRating">Rating</SelectItem>
              <SelectItem value="reviewCount">Reseñas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results */}
      {data ? (
        <>
          <div className="mb-4 text-sm text-muted-foreground">
            Mostrando {data.data.length} de {data.meta.total} restaurantes
          </div>

          {/* Grid View */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {data.data.map((restaurant) => (
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
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {restaurant.priceRange === PriceRange.LOW && "$"}
                        {restaurant.priceRange === PriceRange.MEDIUM && "$$"}
                        {restaurant.priceRange === PriceRange.HIGH && "$$$"}
                        {restaurant.priceRange === PriceRange.PREMIUM && "$$$$"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span className="line-clamp-1">{restaurant.address}</span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{restaurant.maxCapacity} personas</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{restaurant.openingTime} - {restaurant.closingTime}</span>
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

          {/* Table View */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Vista de tabla</h3>
            <DataTable
              columns={columns}
              data={data.data}
              loading={isLoading}
              pagination={{
                page: data.meta.page,
                limit: data.meta.limit,
                total: data.meta.total,
                totalPages: data.meta.totalPages,
                onPageChange: handlePageChange,
                onLimitChange: (limit) => setFilters(prev => ({ ...prev, limit, page: 1 })),
              }}
            />
          </div>
        </>
      ) : (
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
                <div className="h-4 bg-muted rounded w-1/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PageContainer>
  )
}