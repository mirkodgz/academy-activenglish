"use client";

import { BellRing, Search, GraduationCap, BookOpen, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { setMockUserRole, type UserRole } from "@/lib/auth-mock";

export function Navbar() {
  const router = useRouter();
  const { data: session } = useSession();
  const [currentRole, setCurrentRole] = useState<UserRole>("ADMIN");
  const [userName, setUserName] = useState("Admin Demo");

  useEffect(() => {
    // Si hay sesión real, usar datos de la sesión
    if (session?.user) {
      setUserName(session.user.name || session.user.email || "Usuario");
      setCurrentRole((session.user.role as UserRole) || "STUDENT");
      return;
    }

    // Si no hay sesión, usar mock para desarrollo
    const stored = localStorage.getItem("mock-user-role");
    const role = (stored === "ADMIN" || stored === "STUDENT") ? stored : "ADMIN";
    setCurrentRole(role);
    setUserName(role === "ADMIN" ? "Admin Demo" : "Estudiante Demo");

    // Escuchar cambios de rol
    const handleRoleChange = () => {
      const newRole = localStorage.getItem("mock-user-role") as UserRole;
      if (newRole === "ADMIN" || newRole === "STUDENT") {
        setCurrentRole(newRole);
        setUserName(newRole === "ADMIN" ? "Admin Demo" : "Estudiante Demo");
        router.refresh();
      }
    };

    window.addEventListener("role-changed", handleRoleChange);
    return () => window.removeEventListener("role-changed", handleRoleChange);
  }, [router, session]);

  const handleRoleChange = (newRole: UserRole) => {
    setMockUserRole(newRole);
    setCurrentRole(newRole);
    setUserName(newRole === "ADMIN" ? "Admin Demo" : "Estudiante Demo");
    router.refresh();
  };

  const handleSignOut = async () => {
    try {
      const result = await signOut({ 
        callbackUrl: "/sign-in",
        redirect: false 
      });
      
      // Si signOut no redirige automáticamente, hacerlo manualmente
      if (result) {
        router.push("/sign-in");
        router.refresh();
      }
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      // Forzar redirección manual si signOut falla
      router.push("/sign-in");
      router.refresh();
    }
  };

  return (
    <div className="flex justify-between p-4 border-b bg-white h-16">
      <SidebarTrigger />

      <div className="flex gap-4 items-center">
        <div
          className="flex w-full max-w-sm items-center 
      border-gray-300 rounded-lg px-2.5 py-0.5"
        >
          <Search className="h-4 w-4 mr-2.5" />
          <Input
            type="search"
            placeholder="Cerca..."
            className="w-full border-0"
          />
        </div>

        <Button variant="outline">
          <BellRing />
        </Button>

        {/* Selector de rol para desarrollo */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#0b3d4d]/20 bg-[#0b3d4d]/5">
          <Select value={currentRole} onValueChange={handleRoleChange}>
            <SelectTrigger className="w-[140px] h-8 border-0 bg-transparent focus:ring-0">
              <SelectValue>
                <div className="flex items-center gap-2">
                  {currentRole === "ADMIN" ? (
                    <GraduationCap className="h-3.5 w-3.5 text-[#60CB58]" />
                  ) : (
                    <BookOpen className="h-3.5 w-3.5 text-[#0b3d4d]" />
                  )}
                  <span className="text-xs font-semibold text-[#0b3d4d]">
                    {currentRole === "ADMIN" ? "Admin" : "Estudiante"}
                  </span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ADMIN">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-[#60CB58]" />
                  <span>Admin</span>
                </div>
              </SelectItem>
              <SelectItem value="STUDENT">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-[#0b3d4d]" />
                  <span>Estudiante</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Dropdown de perfil de usuario */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#0b3d4d]/10 text-[#0b3d4d]"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#0b3d4d] text-white text-sm font-semibold">
                {userName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </div>
              <span className="text-sm font-medium hidden sm:inline">
                {userName}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{userName}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {session?.user?.email || "demo@activeenglish.com"}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                handleSignOut();
              }}
              className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Cerrar sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
