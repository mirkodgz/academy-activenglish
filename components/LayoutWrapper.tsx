"use client";

import { usePathname } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/app/(routes)/(root)/components";
import { Footer, Navbar } from "@/components/Shared";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthRoute = pathname?.startsWith("/sign-in") || pathname?.startsWith("/sign-up") || pathname?.startsWith("/set-password");

  if (isAuthRoute) {
    // Para rutas de autenticación, solo mostrar el contenido sin sidebar/navbar
    return <>{children}</>;
  }

  // Para rutas normales, mostrar con sidebar y navbar
  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="w-full bg-background flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </SidebarProvider>
  );
}

