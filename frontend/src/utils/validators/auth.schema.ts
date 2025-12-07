import { z } from "zod"

export const loginSchema = z.object({
  email: z.string()
    .email("Email inválido")
    .min(1, "El email es requerido"),
  password: z.string()
    .min(1, "La contraseña es requerida")
})

export const registerSchema = z.object({
  email: z.string()
    .email("Email inválido")
    .min(1, "El email es requerido"),
  password: z.string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
    .regex(/[a-z]/, "Debe contener al menos una minúscula")
    .regex(/[0-9]/, "Debe contener al menos un número")
    .regex(/[^A-Za-z0-9]/, "Debe contener al menos un carácter especial"),
  confirmPassword: z.string()
    .min(1, "Confirmar contraseña es requerida"),
  name: z.string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(50, "El nombre no puede exceder 50 caracteres")
    .optional(),
  phone: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, "Teléfono inválido")
    .optional()
    .or(z.literal('')),
}).refine((data) => {
  if (data.password && data.password !== data.confirmPassword) {
    return false
  }
  return true
}, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
})

export const updateProfileSchema = z.object({
  name: z.string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(50, "El nombre no puede exceder 50 caracteres")
    .optional(),
  phone: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, "Teléfono inválido")
    .optional()
    .or(z.literal('')),
})

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>