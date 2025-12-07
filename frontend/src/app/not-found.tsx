import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
            <h1 className="text-4xl font-bold mb-4">404 - Página No Encontrada</h1>
            <p className="text-muted-foreground mb-8">Lo sentimos, la página que buscas no existe.</p>
            <Button asChild>
                <Link href="/">
                    Volver al Inicio
                </Link>
            </Button>
        </div>
    )
}
