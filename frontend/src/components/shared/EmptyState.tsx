import { FileX, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface EmptyStateProps {
  title?: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  icon?: React.ReactNode
}

export function EmptyState({ 
  title = "No hay datos",
  description = "No se encontraron elementos para mostrar.",
  action,
  icon = <FileX className="h-12 w-12 text-muted-foreground" />
}: EmptyStateProps) {
  return (
    <Card className="border-dashed">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4">{icon}</div>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      {action && (
        <CardContent className="text-center">
          <Button onClick={action.onClick} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            {action.label}
          </Button>
        </CardContent>
      )}
    </Card>
  )
}