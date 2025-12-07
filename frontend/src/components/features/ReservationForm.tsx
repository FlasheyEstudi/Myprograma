"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { AvailabilityChecker } from "./AvailabilityChecker"
import { reservationSchema, type ReservationFormData } from "@/utils/validators"
import { reservationsApi } from "@/api"
import { Table } from "@/api/types"
import { useAuth } from "@/stores/auth.store"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Calendar, Users, MapPin } from "lucide-react"

interface ReservationFormProps {
  restaurantId: string
  restaurantName: string
}

export function ReservationForm({ restaurantId, restaurantName }: ReservationFormProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [selectedTable, setSelectedTable] = useState<Table | null>(null)
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const toast = useToast()

  const form = useForm<ReservationFormData>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      restaurantId,
      tableId: "",
      reservationDate: "",
      reservationTime: "",
      partySize: 2,
      specialRequests: "",
    },
  })

  const handleTableSelect = (table: Table, time: string) => {
    setSelectedTable(table)
    setSelectedTime(time)
    form.setValue("tableId", table.id)
    form.setValue("reservationTime", time)
    
    if (selectedDate) {
      form.setValue("reservationDate", selectedDate.toISOString().split('T')[0])
    }
  }

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date || null)
    if (date) {
      form.setValue("reservationDate", date.toISOString().split('T')[0])
    }
  }

  const onSubmit = async (data: ReservationFormData) => {
    if (!user) {
      toast.error("Error", "Debes iniciar sesión para hacer una reserva")
      router.push("/login")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const reservation = await reservationsApi.createReservation(data)
      toast.success("¡Reserva Confirmada!", "Tu reserva ha sido creada exitosamente")
      router.push("/reservations")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error al crear reserva"
      setError(errorMessage)
      toast.error("Error de Reserva", errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Hacer Reserva</h1>
          <p className="text-muted-foreground">{restaurantName}</p>
        </div>
      </div>

      {/* Selected Table Info */}
      {selectedTable && (
        <Card className="border-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Mesa Seleccionada</h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                  <span>Mesa {selectedTable.tableNumber}</span>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{selectedTable.capacity} personas</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{selectedTime}</span>
                  </div>
                </div>
              </div>
              <Badge variant="default">Seleccionada</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Availability Checker */}
      <AvailabilityChecker
        restaurantId={restaurantId}
        onTableSelect={handleTableSelect}
        selectedDate={selectedDate || undefined}
        selectedTime={selectedTime}
        selectedPartySize={form.watch("partySize")}
      />

      {/* Reservation Form */}
      {selectedTable && (
        <Card>
          <CardHeader>
            <CardTitle>Detalles de la Reserva</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="partySize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número de personas</FormLabel>
                      <FormControl>
                        <input
                          type="number"
                          min="1"
                          max="20"
                          className="w-full p-2 border rounded-md"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="specialRequests"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Solicitudes Especiales (Opcional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Alguna solicitud especial para tu reserva..."
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setSelectedTable(null)
                      setSelectedTime("")
                      form.reset()
                    }}
                    className="flex-1"
                  >
                    Cambiar Mesa
                  </Button>
                  <Button
                    type="submit"
                    loading={isSubmitting}
                    className="flex-1"
                  >
                    Confirmar Reserva
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}