"use client"

import { useEffect } from "react"
import { MainLayout } from "@/components/layout"
import { useAuth } from "@/stores/auth.store"

export default function HomePage() {
  const { checkAuth } = useAuth()

  useEffect(() => {
    checkAuth()
  }, [])

  return (
    <MainLayout showFooter={true} showSidebar={false}>
      <div className="container mx-auto px-4 py-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">
            Bienvenido a ReserveNow
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Tu plataforma de reservas de restaurantes favorita
          </p>
          <div className="flex gap-4 justify-center">
            <a 
              href="/restaurants" 
              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90"
            >
              Explorar Restaurantes
            </a>
            <a 
              href="/login" 
              className="border border-input bg-background hover:bg-accent hover:text-accent-foreground px-4 py-2 rounded-lg"
            >
              Iniciar Sesión
            </a>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}