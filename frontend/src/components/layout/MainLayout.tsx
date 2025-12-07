import { ReactNode } from "react"
import { useAuth } from "@/stores/auth.store"
import { useUI } from "@/stores/ui.store"
import { Header } from "./Header"
import { Sidebar } from "./Sidebar"
import { Footer } from "./Footer"

interface MainLayoutProps {
  children: ReactNode
  showFooter?: boolean
  showSidebar?: boolean
}

export function MainLayout({ 
  children, 
  showFooter = true, 
  showSidebar = true 
}: MainLayoutProps) {
  const { isAuthenticated } = useAuth()

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="flex">
        {/* Sidebar */}
        {isAuthenticated && showSidebar && (
          <Sidebar />
        )}
        
        {/* Main content */}
        <main className="flex-1">
          <div className="py-6">
            {children}
          </div>
          
          {/* Footer */}
          {showFooter && (
            <Footer />
          )}
        </main>
      </div>
    </div>
  )
}