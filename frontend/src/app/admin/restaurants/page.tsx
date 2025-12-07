"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
  Plus,
  Edit,
  Trash2,
  Store,
  MapPin,
  Clock,
  Users,
  Star,
  Search,
  Filter
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { PageContainer } from "@/components/shared"
import { LoadingSpinner } from "@/components/shared"
import { DataTable } from "@/components/ui/data-table"
import { restaurantsApi } from "@/api"
import { Restaurant, PriceRange } from "@/api/types"
import { useApi } from "@/hooks/use-api"
import { useIsAdmin } from "@/hooks/use-auth"
import { useDebounce } from "@/hooks/use-debounce"
import { useToast } from "@/hooks/use-toast"
import { ColumnDef } from "@tanstack/react-table"

const columns: ColumnDef<Restaurant>[] = [
  {
    accessorKey: "name",
    header: "Restaurante",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <span className="text-primary font-bold">
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
    accessorKey: "address",
    header: "Dirección",
    cell: ({ row }) => (
      <div className="flex items-center gap-1 text-sm text-muted-foreground">
        <MapPin className="h-4 w-4" />
        <span className="line-clamp-1">{row.original.address}</span>
      </div>
    ),
  },
  {
    accessorKey: "priceRange",
    header: "Precio",
    cell: ({ row }) => {
      const priceLabels = {
        LOW: "$",
        MEDIUM: "$$",
        HIGH: "$$$",
        PREMIUM: "$$$$"
      }
      return (
        <Badge variant="outline">
          {priceLabels[row.original.priceRange]}
        </Badge>
      )
    },
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
    accessorKey: "isActive",
    header: "Estado",
    cell: ({ row }) => (
      <Badge variant={row.original.isActive ? "default" : "secondary"}>
        {row.original.isActive ? "Activo" : "Inactivo"}
      </Badge>
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
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => (
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/restaurants/${row.original.id}`}>Ver</Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/admin/restaurants/${row.original.id}/edit`}>Editar</Link>
        </Button>
        <DeleteRestaurantButton 
          restaurantId={row.original.id} 
          restaurantName={row.original.name}
        />
      </div>
    ),
  },
]

function DeleteRestaurantButton({ 
  restaurantId, 
  restaurantName 
}: { 
  restaurantId: string
  restaurantName: string 
}) {
  const [isDeleting, setIsDeleting] = useState(false)
  const toast = useToast()

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await restaurantsApi.deleteRestaurant(restaurantId)
      toast.success("Restaurante Eliminado", "El restaurante ha sido eliminado exitosamente")
      window.location.reload()
    } catch (error) {
      toast.error("Error", "No se pudo eliminar el restaurante")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción eliminará permanentemente el restaurante "{restaurantName}" y todas sus mesas y reservas asociadas. Esta acción no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? <LoadingSpinner /> : "Eliminar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default function AdminRestaurantsPage() {
  const { isAdmin, isLoading: adminLoading } = useIsAdmin()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCuisine, setSelectedCuisine] = useState("")
  const [selectedPriceRange, setSelectedPriceRange] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("")
  const debouncedSearch = useDebounce(searchTerm, 300)
  
  const { data, isLoading, error, execute } = useApi<{ data: Restaurant[], meta: any }>()
  const toast = useToast()

  const loadRestaurants = async () => {
    const filters: any = { limit: 50 }
    
    if (debouncedSearch) {
      filters.search = debouncedSearch
    }
    if (selectedCuisine) {
      filters.cuisine = selectedCuisine
    }
    if (selectedPriceRange) {
      filters.priceRange = selectedPriceRange
    }
    if (selectedStatus) {
      filters.isActive = selectedStatus === "active"
    }
    
    await execute(() => restaurantsApi.getRestaurants(filters))
  }

  useEffect(() => {
    if (isAdmin) {
      loadRestaurants()
    }
  }, [isAdmin, debouncedSearch, selectedCuisine, selectedPriceRange, selectedStatus])

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

  if (error) {
    return (
      <PageContainer title="Restaurantes">
        <div className="text-center text-destructive py-8">
          Error al cargar restaurantes: {error}
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer 
      title="Gestionar Restaurantes" 
      description="Administra todos los restaurantes del sistema"
      actions={
        <Button asChild>
          <Link href="/admin/restaurants/new">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Restaurante
          </Link>
        </Button>
      }
    >
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar restaurantes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={selectedCuisine} onValueChange={setSelectedCuisine}>
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

          <Select value={selectedPriceRange} onValueChange={setSelectedPriceRange}>
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

          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              <SelectItem value="active">Activos</SelectItem>
              <SelectItem value="inactive">Inactivos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results */}
      {data ? (
        <>
          <div className="mb-4 text-sm text-muted-foreground">
            Mostrando {data.data.length} restaurantes
          </div>

          <DataTable
            columns={columns}
            data={data.data}
            loading={isLoading}
          />
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
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PageContainer>
  )
}