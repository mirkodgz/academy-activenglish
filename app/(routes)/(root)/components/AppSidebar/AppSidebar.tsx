"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { routes, routesTeacher, routesStudent } from "./AppSidebar.data";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { UserRole } from "@prisma/client";

export function AppSidebar() {
  const { state } = useSidebar();
  const { data: session, status } = useSession();
  
  // Obtener el rol del usuario desde la sesión
  const userRole = session?.user?.role as UserRole | null;

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="bg-white">
        <SidebarHeader>
          <Link href="/" className="flex flex-row items-center justify-center overflow-hidden">
            <Image
              src="/logoactiveenglish.png"
              alt="Logo Active English"
              width={100}
              height={100}
              className="object-contain scale-125"
            />
          </Link>
        </SidebarHeader>
        <SidebarGroup>
          <SidebarGroupLabel>Plataforma</SidebarGroupLabel>
          <SidebarMenu className="space-y-2">
            {routes.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <a href={item.url}>
                    <div className="p-1 rounded-lg text-white bg-[#0b3d4d]">
                      <item.icon className="w-4 h-4" />
                    </div>
                    {state === "expanded" && <span>{item.title}</span>}
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>

          {/* Rutas para Estudiantes */}
          {status === "authenticated" && userRole === "STUDENT" && (
            <SidebarMenu className="mt-4 space-y-2">
              <SidebarGroupLabel>Studente</SidebarGroupLabel>
              {routesStudent.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <div className="p-1 rounded-lg text-white bg-[#0b3d4d]">
                        <item.icon className="w-4 h-4" />
                      </div>
                      {state === "expanded" && <span>{item.title}</span>}
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          )}

          {/* Rutas para Administradores */}
          {status === "authenticated" && userRole === "ADMIN" && (
            <SidebarMenu className="mt-4 space-y-2">
              <SidebarGroupLabel>Admin</SidebarGroupLabel>
              {routesTeacher.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <div className="p-1 rounded-lg text-white bg-[#60CB58]">
                        <item.icon className="w-4 h-4" />
                      </div>
                      {state === "expanded" && <span>{item.title}</span>}
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          )}
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
