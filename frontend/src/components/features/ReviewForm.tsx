"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Star } from "lucide-react"
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
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { reviewSchema, type ReviewFormData } from "@/utils/validators"
import { reviewsApi } from "@/api"
import { useAuth } from "@/stores/auth.store"
import { useToast } from "@/hooks/use-toast"

interface ReviewFormProps {
  restaurantId: string
  restaurantName: string
  onSuccess?: () => void
}

export function ReviewForm({ restaurantId, restaurantName, onSuccess }: ReviewFormProps) {
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hoveredRating, setHoveredRating] = useState(0)
  
  const toast = useToast()

  const form = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      restaurantId,
      rating: 0,
      title: "",
      content: "",
    },
  })

  const handleRatingClick = (rating: number) => {
    form.setValue("rating", rating)
  }

  const onSubmit = async (data: ReviewFormData) => {
    if (!user) {
      toast.error("Error", "Debes iniciar sesión para dejar una reseña")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await reviewsApi.createReview(data)
      toast.success("¡Reseña Publicada!", "Tu reseña ha sido publicada exitosamente")
      form.reset()
      onSuccess?.()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error al crear reseña"
      setError(errorMessage)
      toast.error("Error", errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user) {
    return (
      <Alert>
        <AlertDescription>
          Debes <a href="/login" className="text-primary underline">iniciar sesión</a> para dejar una reseña.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Deja tu Reseña</CardTitle>
        <p className="text-sm text-muted-foreground">
          Comparte tu experiencia en {restaurantName}
        </p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Rating */}
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Calificación</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          className="p-1 hover:scale-110 transition-transform"
                          onClick={() => handleRatingClick(star)}
                          onMouseEnter={() => setHoveredRating(star)}
                          onMouseLeave={() => setHoveredRating(0)}
                        >
                          <Star
                            className={`h-6 w-6 ${
                              star <= (hoveredRating || field.value)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        </button>
                      ))}
                      <span className="ml-2 text-sm text-muted-foreground">
                        {field.value > 0 ? `${field.value} de 5 estrellas` : "Selecciona una calificación"}
                      </span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título (Opcional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Resumen de tu experiencia"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Content */}
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tu Reseña</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Cuéntanos sobre tu experiencia en el restaurante..."
                      className="resize-none"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              loading={isSubmitting}
              disabled={form.watch("rating") === 0}
              className="w-full"
            >
              Publicar Reseña
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}