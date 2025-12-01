import { UserRole } from "@prisma/client";
import prisma from "@/lib/prisma";
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth-config";

const { auth } = NextAuth(authOptions);

// Export auth for use in server components
export { auth };

export interface SessionUser {
  id: string;
  email: string;
  name?: string | null;
  role: UserRole;
}

/**
 * Obtiene la sesión del usuario actual
 */
export async function getCurrentUser() {
  const session = await auth();
  
  if (!session?.user) {
    return null;
  }

  // Obtener datos completos del usuario desde la BD
  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      image: true,
    },
  });

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    emailAddresses: [{ emailAddress: user.email }],
    role: user.role,
    image: user.image,
  };
}

/**
 * Obtiene el userId del usuario actual
 */
export async function getAuth() {
  const session = await auth();
  return { userId: session?.user?.id || null };
}

/**
 * Obtiene el userId
 */
export async function getUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id || null;
}

/**
 * Obtiene el rol del usuario actual
 */
export async function getUserRole(): Promise<UserRole | null> {
  const session = await auth();
  return (session?.user as { role?: UserRole })?.role || null;
}

/**
 * Verifica si el usuario es ADMIN
 */
export async function isAdmin(): Promise<boolean> {
  const role = await getUserRole();
  return role === "ADMIN";
}

/**
 * @deprecated Usar isAdmin() en su lugar
 */
export async function isTeacher(): Promise<boolean> {
  return isAdmin();
}

/**
 * Verifica si el usuario es STUDENT
 */
export async function isStudent(): Promise<boolean> {
  const role = await getUserRole();
  return role === "STUDENT";
}

/**
 * Verifica si el usuario tiene un rol específico
 */
export async function hasRole(role: UserRole): Promise<boolean> {
  const userRole = await getUserRole();
  return userRole === role;
}

