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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { routes, routesTeacher } from "./AppSidebar.data";
import Image from "next/image";

export function AppSidebar() {
  const { state } = useSidebar();

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="bg-white">
        <SidebarHeader>
          <Link href="/" className="flex flex-row items-center">
            <Image
              src="/logoactiveenglish.png"
              alt="Logo Active English"
              width={35}
              height={35}
            />
            {state === "expanded" && (
              <span className="text-xl font-semibold text-gray-800 tracking-wide">
                Active English
              </span>
            )}
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
          <SidebarMenu className="mt-4">
            <SidebarGroupLabel>Profesor</SidebarGroupLabel>
            <SidebarMenuItem>
              <SidebarMenuSub>
                {routesTeacher.map((item) => (
                  <SidebarMenuSubItem key={item.title}>
                    <SidebarMenuSubButton
                      href={item.url}
                      className="hover:bg-muted transition"
                    >
                      <div className="p-1 rounded-lg text-white bg-[#60CB58]">
                        <item.icon className="w-4 h-4" />
                      </div>
                      {item.title}
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                ))}
              </SidebarMenuSub>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
