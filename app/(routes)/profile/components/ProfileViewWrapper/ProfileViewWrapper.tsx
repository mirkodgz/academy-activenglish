"use client";

import dynamic from "next/dynamic";

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

// Importar dinámicamente ProfileView sin SSR para evitar problemas de hidratación
const ProfileView = dynamic(
  () => import("../ProfileView").then((mod) => ({ default: mod.ProfileView })),
  { 
    ssr: false,
    loading: () => (
      <div className="border rounded-lg bg-white shadow-sm p-6">
        <div className="space-y-4">
          <div className="h-8 bg-gray-100 animate-pulse rounded w-1/3" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-20 bg-gray-100 animate-pulse rounded" />
            <div className="h-20 bg-gray-100 animate-pulse rounded" />
            <div className="h-20 bg-gray-100 animate-pulse rounded" />
          </div>
        </div>
      </div>
    ),
  }
);

export function ProfileViewWrapper(props: ProfileViewProps) {
  return <ProfileView {...props} />;
}

