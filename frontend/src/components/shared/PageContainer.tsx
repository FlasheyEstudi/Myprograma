import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface PageContainerProps {
  children: ReactNode
  className?: string
  title?: string
  description?: string
  actions?: ReactNode
}

export function PageContainer({ 
  children, 
  className, 
  title, 
  description, 
  actions 
}: PageContainerProps) {
  return (
    <div className={cn("container mx-auto px-4 py-6 space-y-6", className)}>
      {(title || description || actions) && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            {title && (
              <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            )}
            {description && (
              <p className="text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-2">
              {actions}
            </div>
          )}
        </div>
      )}
      {children}
    </div>
  )
}