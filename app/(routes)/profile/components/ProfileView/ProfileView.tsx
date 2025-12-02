"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { User, Mail, Calendar, Edit } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Importar dinámicamente el formulario sin SSR para evitar problemas de hidratación
const EditProfileForm = dynamic(
  () => import("../EditProfileForm").then((mod) => ({ default: mod.EditProfileForm })),
  { 
    ssr: false,
    loading: () => (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-20 bg-gray-100 animate-pulse rounded" />
          <div className="h-20 bg-gray-100 animate-pulse rounded" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-20 bg-gray-100 animate-pulse rounded" />
          <div className="h-20 bg-gray-100 animate-pulse rounded" />
        </div>
      </div>
    ),
  }
);

interface ProfileViewProps {
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    role: "ADMIN" | "STUDENT";
  };
  userIsAdmin: boolean;
}

export function ProfileView({ user, userIsAdmin }: ProfileViewProps) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <Card className="border rounded-lg bg-white shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-full ${
              isEditing ? "bg-[#0b3d4d]" : (userIsAdmin ? "bg-[#60CB58]" : "bg-[#0b3d4d]")
            }`}>
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className={`text-2xl ${
                isEditing ? "text-[#0b3d4d]" : (userIsAdmin ? "text-[#60CB58]" : "text-[#0b3d4d]")
              }`}>
                {isEditing ? "Modifica profilo" : "Il mio profilo"}
              </CardTitle>
              <CardDescription>
                {isEditing ? "Aggiorna le tue informazioni personali" : "Le tue informazioni personali"}
              </CardDescription>
            </div>
          </div>
          {isEditing ? (
            <Button
              variant="outline"
              onClick={() => setIsEditing(false)}
              className="min-w-[100px]"
            >
              Annulla
            </Button>
          ) : (
            <Button
              onClick={() => setIsEditing(true)}
              className="min-w-[100px] bg-[#0b3d4d] hover:bg-[#0b3d4d]/90"
            >
              <Edit className="w-4 h-4 mr-2" />
              Modifica
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {isEditing ? (
          <EditProfileForm 
            key={`edit-${user.id}`}
            user={{
              id: user.id,
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName,
            }}
            onSuccess={() => setIsEditing(false)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-600">
                <User className="w-4 h-4" />
                <span className="text-sm font-medium">Nome completo</span>
              </div>
              <p className="text-lg font-semibold text-gray-800">
                {user.firstName || ""} {user.lastName || ""}
                {!user.firstName && !user.lastName && (
                  <span className="text-gray-400 italic"> Non specificato</span>
                )}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="w-4 h-4" />
                <span className="text-sm font-medium">Email</span>
              </div>
              <p className="text-lg font-semibold text-gray-800">
                {user.email}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span className="text-sm font-medium">Ruolo</span>
              </div>
              <span className={`inline-block px-3 py-1 rounded-md font-semibold text-sm ${
                userIsAdmin 
                  ? "bg-[#60CB58]/10 text-[#60CB58]" 
                  : "bg-[#0b3d4d]/10 text-[#0b3d4d]"
              }`}>
                {userIsAdmin ? "Admin" : "Studente"}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

