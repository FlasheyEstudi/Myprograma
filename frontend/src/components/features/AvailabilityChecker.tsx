"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
  CalendarIcon,
  Clock,
  Users,
  CheckCircle,
  XCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/shared"
import { reservationsApi, restaurantsApi } from "@/api"
import { AvailabilityData, Restaurant, Table } from "@/api/types"
import { useApi } from "@/hooks/use-api"
import { useToast } from "@/hooks/use-toast"

interface AvailabilityCheckerProps {
  restaurantId: string
  onTableSelect?: (table: Table, time: string) => void
  selectedDate?: Date
  selectedTime?: string
  selectedPartySize?: number
}

export function AvailabilityChecker({
  restaurantId,
  onTableSelect,
  selectedDate: initialDate,
  selectedTime: initialTime,
  selectedPartySize: initialPartySize,
}: AvailabilityCheckerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(initialDate)
  const [selectedTime, setSelectedTime] = useState<string>(initialTime || "")
  const [partySize, setPartySize] = useState<number>(initialPartySize || 2)
  const [availability, setAvailability] = useState<AvailabilityData | null>(null)
  const [loading, setLoading] = useState(false)
  
  const { data: restaurant } = useApi<Restaurant>()
  const toast = useToast()

  // Load restaurant info
  useEffect(() => {
    if (restaurantId) {
      restaurantsApi.getRestaurantById(restaurantId).then(setAvailability)
    }
  }, [restaurantId])

  // Generate time slots from opening to closing time
  const generateTimeSlots = () => {
    if (!restaurant) return []
    
    const [openHour, openMin] = restaurant.openingTime.split(':').map(Number)
    const [closeHour, closeMin] = restaurant.closingTime.split(':').map(Number)
    
    const slots = []
    for (let hour = openHour; hour < closeHour; hour++) {
      for (let min = 0; min < 60; min += 30) {
        if (hour === closeHour && min >= closeMin) break
        const timeStr = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`
        slots.push(timeStr)
      }
    }
    
    return slots
  }

  const checkAvailability = async () => {
    if (!selectedDate || !selectedTime || !partySize) {
      toast.error("Error", "Por favor completa todos los campos")
      return
    }

    setLoading(true)
    try {
      const result = await reservationsApi.checkAvailability({
        restaurantId,
        date: format(selectedDate, 'yyyy-MM-dd'),
        partySize,
        timeFrom: selectedTime,
        timeTo: selectedTime,
      })
      setAvailability(result)
    } catch (error) {
      toast.error("Error", "No se pudo verificar la disponibilidad")
    } finally {
      setLoading(false)
    }
  }

  const handleTableSelect = (table: Table, time: string) => {
    onTableSelect?.(table, time)
  }

  const timeSlots = generateTimeSlots()

  return (
    <div className="space-y-6">
      {/* Date and Time Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Selecciona Fecha y Hora
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">Fecha</Label>
              <Input
                type="date"
                value={selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''}
                onChange={(e) => {
                  const date = e.target.value ? new Date(e.target.value) : undefined
                  setSelectedDate(date)
                }}
                min={format(new Date(), 'yyyy-MM-dd')}
                className="w-full"
              />
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="time">Hora</Label>
                <Select value={selectedTime} onValueChange={setSelectedTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una hora" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="partySize">Número de personas</Label>
                <Select value={partySize.toString()} onValueChange={(value) => setPartySize(Number(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} {num === 1 ? 'persona' : 'personas'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                onClick={checkAvailability} 
                disabled={!selectedDate || !selectedTime || !partySize || loading}
                className="w-full"
              >
                {loading ? <LoadingSpinner /> : "Ver Disponibilidad"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Availability Results */}
      {availability && (
        <Card>
          <CardHeader>
            <CardTitle>Disponibilidad para {format(selectedDate!, 'dd MMM yyyy', { locale: es })}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {availability.availability.map((slot) => (
                <div key={slot.time} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span className="font-medium">{slot.time}</span>
                      <Badge variant={slot.available ? "default" : "secondary"}>
                        {slot.available ? "Disponible" : "No disponible"}
                      </Badge>
                    </div>
                  </div>
                  
                  {slot.available && slot.tables.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {slot.tables.map((table) => (
                        <Card key={table.id} className="cursor-pointer hover:shadow-md transition-shadow">
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">Mesa {table.tableNumber}</span>
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{table.capacity} personas</span>
                              </div>
                            </div>
                            
                            <div className="space-y-1 text-xs text-muted-foreground mb-3">
                              {table.hasWindow && <div>• Con ventana</div>}
                              {table.hasOutdoor && <div>• Exterior</div>}
                              {table.isPrivate && <div>• Privada</div>}
                            </div>
                            
                            <Button 
                              size="sm" 
                              className="w-full"
                              onClick={() => handleTableSelect(table, slot.time)}
                            >
                              Seleccionar Mesa
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <XCircle className="h-4 w-4" />
                      <span>No hay mesas disponibles para esta hora</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}