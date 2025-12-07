import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAuth } from "@/stores/auth.store"
import { useUI } from "@/stores/ui.store"
import {
  Home,
  Utensils,
  Calendar,
  Star,
  Settings,
  Users,
  Store,
  Table,
  LogOut,
  Menu
} from "lucide-react"

const navigation = [
  { name: "Inicio", href: "/", icon: Home },
  { name: "Restaurantes", href: "/restaurants", icon: Utensils },
  { name: "Mis Reservas", href: "/reservations", icon: Calendar },
  { name: "Reseñas", href: "/reviews", icon: Star },
]

const adminNavigation = [
  { name: "Panel Admin", href: "/admin", icon: Settings },
  { name: "Usuarios", href: "/admin/users", icon: Users },
  { name: "Restaurantes", href: "/admin/restaurants", icon: Store },
  { name: "Mesas", href: "/admin/tables", icon: Table },
]

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { sidebarOpen, setSidebarOpen } = useUI()

  const handleLogout = async () => {
    await logout()
    setSidebarOpen(false)
  }

  if (!user) return null

  return (
    <>
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/80 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          className
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center border-b px-6">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Utensils className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl">ReserveNow</span>
            </Link>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 px-4 py-4">
            <div className="space-y-2">
              <div className="px-3 py-2">
                <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                  Menú
                </h2>
                <div className="space-y-1">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                        pathname === item.href
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground"
                      )}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>

              {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && (
                <div className="px-3 py-2">
                  <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                    Administración
                  </h2>
                  <div className="space-y-1">
                    {adminNavigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                          "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                          pathname === item.href
                            ? "bg-accent text-accent-foreground"
                            : "text-muted-foreground"
                        )}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <item.icon className="mr-2 h-4 w-4" />
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* User section */}
          <div className="border-t p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-medium text-primary">
                    {user.name?.charAt(0) || user.email.charAt(0)}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">
                    {user.name || 'Usuario'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {user.role}
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="h-8 w-8"
              >
                <LogOut className="h-4 w-4" />
                <span className="sr-only">Cerrar sesión</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}