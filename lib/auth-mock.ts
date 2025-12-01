// Funciones mock para desarrollo - Reemplazar con el sistema de autenticación real
// TODO: Implementar sistema de autenticación real cuando se decida

export type UserRole = "ADMIN" | "STUDENT";

export interface MockUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  emailAddresses: Array<{ emailAddress: string }>;
  role?: UserRole; // Agregado para roles
}

// Función helper para obtener el rol desde localStorage (solo en cliente)
function getRoleFromStorage(): UserRole {
  if (typeof window === "undefined") {
    return "ADMIN"; // Default en servidor
  }
  const stored = localStorage.getItem("mock-user-role");
  return (stored === "ADMIN" || stored === "STUDENT") ? stored : "ADMIN";
}

// Función para establecer el rol (solo en cliente)
export function setMockUserRole(role: UserRole) {
  if (typeof window !== "undefined") {
    localStorage.setItem("mock-user-role", role);
    // Disparar evento para que los componentes se actualicen
    window.dispatchEvent(new Event("role-changed"));
  }
}

// Usuario mock base
const getMockUser = (): MockUser => {
  const role = getRoleFromStorage();
  return {
    id: "mock-user-id-123",
    firstName: role === "ADMIN" ? "Admin" : "Estudiante",
    lastName: "Demo",
    emailAddresses: [{ 
      emailAddress: role === "ADMIN" 
        ? "admin@activeenglish.com" 
        : "estudiante@activeenglish.com" 
    }],
    role: role,
  };
};

/**
 * Mock de currentUser - Retorna un usuario mock para desarrollo
 */
export async function getCurrentUser(): Promise<MockUser | null> {
  // En desarrollo, siempre retorna el usuario mock con el rol actual
  // En producción, esto se reemplazará con el sistema real
  return getMockUser();
}

/**
 * Mock de auth - Retorna userId mock
 */
export async function getAuth(): Promise<{ userId: string | null }> {
  return { userId: getMockUser().id };
}

/**
 * Helper para obtener userId
 */
export async function getUserId(): Promise<string | null> {
  return getMockUser().id;
}

/**
 * Obtiene el rol del usuario actual
 */
export async function getUserRole(): Promise<UserRole | null> {
  // En cliente, leer directamente del storage para respuesta inmediata
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("mock-user-role");
    return (stored === "ADMIN" || stored === "STUDENT") ? stored : "ADMIN";
  }
  // En servidor, usar el usuario mock
  const user = await getCurrentUser();
  return user?.role || "ADMIN";
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

