"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Plus,
  Edit,
  Trash2,
  Table as TableIcon,
  Users,
  Store,
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
import { tablesApi, restaurantsApi } from "@/api"
import { Table, Restaurant } from "@/api/types"
import { useApi } from "@/hooks/use-api"
import { useIsAdmin } from "@/hooks/use-auth"
import { useDebounce } from "@/hooks/use-debounce"
import { useToast } from "@/hooks/use-toast"
import { ColumnDef } from "@tanstack/react-table"

const columns: ColumnDef<Table>[] = [
  {
    accessorKey: "tableNumber",
    header: "Mesa",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <TableIcon className="h-4 w-4 text-primary" />
        </div>
        <span className="font-medium">{row.original.tableNumber}</span>
      </div>
    ),
  },
  {
    accessorKey: "restaurant",
    header: "Restaurante",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Store className="h-4 w-4 text-muted-foreground" />
        <span>{row.original.restaurant?.name}</span>
      </div>
    ),
  },
  {
    accessorKey: "capacity",
    header: "Capacidad",
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <Users className="h-4 w-4 text-muted-foreground" />
        <span>{row.original.capacity} personas</span>
      </div>
    ),
  },
  {
    accessorKey: "isAvailable",
    header: "Disponibilidad",
    cell: ({ row }) => (
      <Badge variant={row.original.isAvailable ? "default" : "secondary"}>
        {row.original.isAvailable ? "Disponible" : "Ocupada"}
      </Badge>
    ),
  },
  {
    accessorKey: "features",
    header: "Características",
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        {row.original.hasWindow && (
          <Badge variant="outline" className="text-xs">Ventana</Badge>
        )}
        {row.original.hasOutdoor && (
          <Badge variant="outline" className="text-xs">Exterior</Badge>
        )}
        {row.original.isPrivate && (
          <Badge variant="outline" className="text-xs">Privada</Badge>
        )}
      </div>
    ),
  },
  {
    accessorKey: "_count.reservations",
    header: "Reservas",
    cell: ({ row }) => (
      <span className="text-sm">
        {row.original._count?.reservations || 0}
      </span>
    ),
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => (
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/admin/tables/${row.original.id}/edit`}>Editar</Link>
        </Button>
        <DeleteTableButton 
          tableId={row.original.id} 
          tableNumber={row.original.tableNumber}
        />
      </div>
    ),
  },
]

function DeleteTableButton({ 
  tableId, 
  tableNumber 
}: { 
  tableId: string
  tableNumber: string 
}) {
  const [isDeleting, setIsDeleting] = useState(false)
  const toast = useToast()

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await tablesApi.deleteTable(tableId)
      toast.success("Mesa Eliminada", "La mesa ha sido eliminada exitosamente")
      window.location.reload()
    } catch (error) {
      toast.error("Error", "No se pudo eliminar la mesa")
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
            Esta acción eliminará permanentemente la mesa "{tableNumber}". Esta acción no se puede deshacer.
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

export default function AdminTablesPage() {
  const { isAdmin, isLoading: adminLoading } = useIsAdmin()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRestaurant, setSelectedRestaurant] = useState("")
  const [selectedAvailability, setSelectedAvailability] = useState("")
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const debouncedSearch = useDebounce(searchTerm, 300)
  
  const { data, isLoading, error, execute } = useApi<{ data: Table[], meta: any }>()
  const toast = useToast()

  const loadTables = async () => {
    const filters: any = { limit: 100 }
    
    if (debouncedSearch) {
      filters.search = debouncedSearch
    }
    if (selectedRestaurant) {
      filters.restaurantId = selectedRestaurant
    }
    if (selectedAvailability) {
      filters.isAvailable = selectedAvailability === "available"
    }
    
    await execute(() => tablesApi.getTables(filters))
  }

  const loadRestaurants = async () => {
    try {
      const response = await restaurantsApi.getRestaurants({ limit: 100 })
      setRestaurants(response.data)
    } catch (error) {
      toast.error("Error", "No se pudieron cargar los restaurantes")
    }
  }

  useEffect(() => {
    if (isAdmin) {
      loadTables()
      loadRestaurants()
    }
  }, [isAdmin, debouncedSearch, selectedRestaurant, selectedAvailability])

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
      <PageContainer title="Mesas">
        <div className="text-center text-destructive py-8">
          Error al cargar mesas: {error}
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer 
      title="Gestionar Mesas" 
      description="Administra todas las mesas del sistema"
      actions={
        <Button asChild>
          <Link href="/admin/tables/new">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Mesa
          </Link>
        </Button>
      }
    >
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar mesas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={selectedRestaurant} onValueChange={setSelectedRestaurant}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Restaurantes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              {restaurants.map((restaurant) => (
                <SelectItem key={restaurant.id} value={restaurant.id}>
                  {restaurant.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedAvailability} onValueChange={setSelectedAvailability}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Disponibilidad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas</SelectItem>
              <SelectItem value="available">Disponibles</SelectItem>
              <SelectItem value="unavailable">Ocupadas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results */}
      {data ? (
        <>
          <div className="mb-4 text-sm text-muted-foreground">
            Mostrando {data.data.length} mesas
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