import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full h-screen relative overflow-hidden">
      {/* Fondo con gradiente y patrones decorativos */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0b3d4d]/5 via-white to-[#60CB58]/5" />
      
      {/* Círculos decorativos de fondo */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-[#0b3d4d]/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#60CB58]/5 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#0b3d4d]/3 rounded-full blur-3xl" />

      {/* Contenedor principal centrado */}
      <div className="relative z-10 flex h-full w-full items-center justify-center p-4">
        {children}
      </div>

      {/* Patrón de fondo sutil */}
      <div 
        className="absolute inset-0 opacity-[0.02] z-0"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, #0b3d4d 1px, transparent 0)`,
          backgroundSize: "40px 40px"
        }}
      />
    </div>
  );
}
