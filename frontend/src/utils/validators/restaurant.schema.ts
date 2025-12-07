import { z } from "zod"

export const restaurantSchema = z.object({
  name: z.string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres"),
  description: z.string()
    .max(500, "La descripción no puede exceder 500 caracteres")
    .optional(),
  cuisine: z.string()
    .max(50, "El tipo de cocina no puede exceder 50 caracteres")
    .optional(),
  address: z.string()
    .min(5, "La dirección debe tener al menos 5 caracteres")
    .max(200, "La dirección no puede exceder 200 caracteres"),
  phone: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, "Teléfono inválido")
    .optional()
    .or(z.literal('')),
  email: z.string()
    .email("Email inválido")
    .optional()
    .or(z.literal('')),
  openingTime: z.string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido (HH:MM)"),
  closingTime: z.string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido (HH:MM)"),
  maxCapacity: z.number()
    .min(1, "La capacidad máxima debe ser al menos 1")
    .max(1000, "La capacidad máxima no puede exceder 1000"),
  priceRange: z.enum(["LOW", "MEDIUM", "HIGH", "PREMIUM"], {
    errorMap: () => ({ message: "Selecciona un rango de precios válido" })
  }),
})

export const tableSchema = z.object({
  restaurantId: z.string()
    .min(1, "Selecciona un restaurante"),
  tableNumber: z.string()
    .min(1, "El número de mesa es requerido")
    .max(10, "El número de mesa no puede exceder 10 caracteres"),
  capacity: z.number()
    .min(1, "La capacidad debe ser al menos 1")
    .max(20, "La capacidad no puede exceder 20 personas"),
  minCapacity: z.number()
    .min(1, "La capacidad mínima debe ser al menos 1")
    .max(20, "La capacidad mínima no puede exceder 20 personas")
    .optional(),
  hasWindow: z.boolean().optional(),
  hasOutdoor: z.boolean().optional(),
  isPrivate: z.boolean().optional(),
})

export const reservationSchema = z.object({
  restaurantId: z.string()
    .min(1, "Selecciona un restaurante"),
  tableId: z.string()
    .min(1, "Selecciona una mesa"),
  reservationDate: z.string()
    .min(1, "La fecha es requerida"),
  reservationTime: z.string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido (HH:MM)"),
  partySize: z.number()
    .min(1, "El número de personas debe ser al menos 1")
    .max(20, "El número de personas no puede exceder 20"),
  specialRequests: z.string()
    .max(500, "Las solicitudes especiales no pueden exceder 500 caracteres")
    .optional(),
})

export const reviewSchema = z.object({
  restaurantId: z.string()
    .min(1, "Selecciona un restaurante"),
  rating: z.number()
    .min(1, "La calificación debe ser al menos 1")
    .max(5, "La calificación no puede exceder 5"),
  title: z.string()
    .max(100, "El título no puede exceder 100 caracteres")
    .optional(),
  content: z.string()
    .max(1000, "El contenido no puede exceder 1000 caracteres")
    .optional(),
})

export type RestaurantFormData = z.infer<typeof restaurantSchema>
export type TableFormData = z.infer<typeof tableSchema>
export type ReservationFormData = z.infer<typeof reservationSchema>
export type ReviewFormData = z.infer<typeof reviewSchema>