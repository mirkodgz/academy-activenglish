export const dynamic = 'force-dynamic';

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-[#0b3d4d] mb-6">
        Política de Privacidad
      </h1>
      
      <div className="prose prose-slate max-w-none">
        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-[#0b3d4d] mb-4">
            1. Información que Recopilamos
          </h2>
          <p className="text-gray-700 mb-4">
            Recopilamos información que nos proporcionas directamente, incluyendo:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>Nombre y apellidos</li>
            <li>Dirección de correo electrónico</li>
            <li>Información de tu cuenta y perfil</li>
            <li>Datos de progreso en los cursos</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-[#0b3d4d] mb-4">
            2. Uso de la Información
          </h2>
          <p className="text-gray-700 mb-4">
            Utilizamos tu información para:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>Proporcionar y mejorar nuestros servicios educativos</li>
            <li>Gestionar tu cuenta y progreso en los cursos</li>
            <li>Comunicarnos contigo sobre el servicio</li>
            <li>Cumplir con obligaciones legales</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-[#0b3d4d] mb-4">
            3. Protección de Datos
          </h2>
          <p className="text-gray-700 mb-4">
            Implementamos medidas de seguridad técnicas y organizativas para proteger
            tu información personal contra acceso no autorizado, alteración, divulgación o destrucción.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-[#0b3d4d] mb-4">
            4. Compartir Información
          </h2>
          <p className="text-gray-700 mb-4">
            No vendemos, alquilamos ni compartimos tu información personal con terceros,
            excepto cuando sea necesario para proporcionar el servicio o cuando la ley lo requiera.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-[#0b3d4d] mb-4">
            5. Tus Derechos
          </h2>
          <p className="text-gray-700 mb-4">
            Tienes derecho a:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>Acceder a tu información personal</li>
            <li>Rectificar datos inexactos</li>
            <li>Solicitar la eliminación de tus datos</li>
            <li>Oponerte al procesamiento de tus datos</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-[#0b3d4d] mb-4">
            6. Cookies
          </h2>
          <p className="text-gray-700 mb-4">
            Utilizamos cookies y tecnologías similares para mejorar tu experiencia,
            analizar el uso del servicio y personalizar el contenido.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-[#0b3d4d] mb-4">
            7. Cambios a esta Política
          </h2>
          <p className="text-gray-700 mb-4">
            Podemos actualizar esta política de privacidad ocasionalmente.
            Te notificaremos de cualquier cambio significativo publicando la nueva política en esta página.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-[#0b3d4d] mb-4">
            8. Contacto
          </h2>
          <p className="text-gray-700 mb-4">
            Si tienes preguntas sobre esta política de privacidad o sobre cómo manejamos tus datos,
            puedes contactarnos a través de los canales oficiales de la plataforma.
          </p>
        </section>

        <p className="text-sm text-gray-500 mt-8">
          Última actualización: {new Date().toLocaleDateString('es-ES', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>
    </div>
  );
}

