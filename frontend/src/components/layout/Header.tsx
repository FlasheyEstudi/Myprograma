import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useAuth } from "@/stores/auth.store"
import { useUI } from "@/stores/ui.store"
import { 
  Menu, 
  User, 
  Settings, 
  LogOut, 
  Calendar,
  Home,
  Utensils,
  Star
} from "lucide-react"

export function Header() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { setSidebarOpen } = useUI()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navigation = [
    { name: "Inicio", href: "/", icon: Home },
    { name: "Restaurantes", href: "/restaurants", icon: Utensils },
    { name: "Mis Reservas", href: "/reservations", icon: Calendar },
    { name: "Reseñas", href: "/reviews", icon: Star },
  ]

  const adminNavigation = [
    { name: "Panel Admin", href: "/admin", icon: Settings },
  ]

  const handleLogout = async () => {
    await logout()
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Mobile menu trigger */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Abrir menú</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col gap-4">
                <div className="px-3 py-2">
                  <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                    Navegación
                  </h2>
                  <div className="space-y-1">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${
                          pathname === item.href ? "bg-muted text-primary" : ""
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <item.icon className="mr-2 h-4 w-4" />
                        {item.name}
                      </Link>
                    ))}
                    {user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' ? (
                      <>
                        <div className="border-t my-2" />
                        {adminNavigation.map((item) => (
                          <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${
                              pathname === item.href ? "bg-muted text-primary" : ""
                            }`}
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <item.icon className="mr-2 h-4 w-4" />
                            {item.name}
                          </Link>
                        ))}
                      </>
                    ) : null}
                  </div>
                </div>
              </nav>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Utensils className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="hidden font-bold sm:inline-block text-xl">
              ReserveNow
            </span>
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center text-sm font-medium transition-colors hover:text-primary ${
                  pathname === item.href ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.name}
              </Link>
            ))}
            {user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' ? (
              adminNavigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center text-sm font-medium transition-colors hover:text-primary ${
                    pathname === item.href ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.name}
                </Link>
              ))
            ) : null}
          </nav>
        </div>

        {/* User menu */}
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>
                    {user.name?.charAt(0) || user.email.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.name || 'Usuario'}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile" className="flex items-center cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Mi Perfil</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/reservations" className="flex items-center cursor-pointer">
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>Mis Reservas</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Cerrar sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex items-center space-x-2">
            <Button variant="ghost" asChild>
              <Link href="/login">Iniciar sesión</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Registrarse</Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  )
}