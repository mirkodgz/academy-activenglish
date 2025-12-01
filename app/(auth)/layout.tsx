// Este layout se anida dentro del layout raíz
// Solo proporciona el diseño específico para auth (sin sidebar/navbar)
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Este layout solo envuelve el contenido, el diseño visual está en sign-in/layout.tsx
  return <>{children}</>;
}

