"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { User, Mail, Phone, Calendar, MapPin, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageContainer } from "@/components/shared"
import { LoadingSpinner } from "@/components/shared"
import { updateProfileSchema, type UpdateProfileFormData } from "@/utils/validators"
import { useAuth } from "@/stores/auth.store"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export default function ProfilePage() {
  const { user, updateProfile, isLoading } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const toast = useToast()

  const form = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: user?.name || "",
      phone: user?.phone || "",
    },
  })

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name || "",
        phone: user.phone || "",
      })
    }
  }, [user])

  const onSubmit = async (data: UpdateProfileFormData) => {
    setError(null)
    setSuccess(false)

    try {
      await updateProfile(data)
      setSuccess(true)
      toast.success("Perfil Actualizado", "Tu perfil ha sido actualizado exitosamente")
      setIsEditing(false)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error al actualizar perfil"
      setError(errorMessage)
      toast.error("Error", errorMessage)
    }
  }

  const handleCancel = () => {
    form.reset({
      name: user?.name || "",
      phone: user?.phone || "",
    })
    setIsEditing(false)
    setError(null)
    setSuccess(false)
  }

  if (!user) {
    return (
      <PageContainer>
        <LoadingSpinner fullScreen />
      </PageContainer>
    )
  }

  const roleLabels = {
    USER: "Usuario",
    ADMIN: "Administrador",
    SUPER_ADMIN: "Super Administrador"
  }

  const roleColors = {
    USER: "default",
    ADMIN: "secondary",
    SUPER_ADMIN: "destructive"
  }

  return (
    <PageContainer 
      title="Mi Perfil" 
      description="Gestiona tu información personal"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* User Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Información Personal
              {!isEditing && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {success && (
              <Alert className="mb-4">
                <AlertDescription>
                  ¡Tu perfil ha sido actualizado exitosamente!
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {isEditing ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre completo</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Tu nombre completo"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teléfono</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="+1 555 123 4567"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-4">
                    <Button
                      type="submit"
                      loading={isLoading}
                      className="flex-1"
                    >
                      Guardar Cambios
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </Form>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold text-2xl">
                      {user.name?.charAt(0) || user.email.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">
                      {user.name || "Usuario"}
                    </h3>
                    <Badge variant={roleColors[user.role] as any} className="mt-1">
                      {roleLabels[user.role]}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{user.email}</p>
                      </div>
                    </div>

                    {user.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Teléfono</p>
                          <p className="font-medium">{user.phone}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Miembro desde</p>
                        <p className="font-medium">
                          {format(new Date(user.createdAt), "dd MMM yyyy", { locale: es })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Estado</p>
                        <Badge variant={user.isActive ? "default" : "secondary"}>
                          {user.isActive ? "Activo" : "Inactivo"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Account Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Estadísticas de la Cuenta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-2">
                  {/* This would come from an API call */}
                  0
                </div>
                <p className="text-sm text-muted-foreground">
                  Reservas realizadas
                </p>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-2">
                  {/* This would come from an API call */}
                  0
                </div>
                <p className="text-sm text-muted-foreground">
                  Reseñas escritas
                </p>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-2">
                  {/* This would come from an API call */}
                  0
                </div>
                <p className="text-sm text-muted-foreground">
                  Restaurantes favoritos
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  )
}