import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface ErrorStateProps {
  title?: string
  description?: string
  error?: string
  onRetry?: () => void
}

export function ErrorState({ 
  title = "Ha ocurrido un error",
  description = "No se pudo cargar la información. Por favor, inténtalo de nuevo.",
  error,
  onRetry
}: ErrorStateProps) {
  return (
    <Card className="border-destructive/20 bg-destructive/5">
      <CardHeader className="text-center">
        <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <CardTitle className="text-lg text-destructive">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        {error && (
          <CardDescription className="text-xs text-muted-foreground mt-2 font-mono">
            {error}
          </CardDescription>
        )}
      </CardHeader>
      {onRetry && (
        <CardContent className="text-center">
          <Button onClick={onRetry} variant="outline">
            Reintentar
          </Button>
        </CardContent>
      )}
    </Card>
  )
}