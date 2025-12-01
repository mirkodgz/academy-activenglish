export const dynamic = 'force-dynamic';

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-[#0b3d4d] mb-6">
        Términos de Uso
      </h1>
      
      <div className="prose prose-slate max-w-none">
        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-[#0b3d4d] mb-4">
            1. Aceptación de los Términos
          </h2>
          <p className="text-gray-700 mb-4">
            Al acceder y utilizar esta plataforma, aceptas cumplir con estos términos de uso.
            Si no estás de acuerdo con alguna parte de estos términos, no debes utilizar el servicio.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-[#0b3d4d] mb-4">
            2. Uso del Servicio
          </h2>
          <p className="text-gray-700 mb-4">
            Esta plataforma está destinada a fines educativos. Te comprometes a:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>Proporcionar información precisa y actualizada</li>
            <li>Mantener la confidencialidad de tu cuenta</li>
            <li>No compartir tu cuenta con terceros</li>
            <li>Utilizar el servicio de manera legal y ética</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-[#0b3d4d] mb-4">
            3. Contenido del Usuario
          </h2>
          <p className="text-gray-700 mb-4">
            Eres responsable del contenido que publiques en la plataforma. No debes publicar
            contenido que sea ilegal, ofensivo, difamatorio o que viole los derechos de terceros.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-[#0b3d4d] mb-4">
            4. Propiedad Intelectual
          </h2>
          <p className="text-gray-700 mb-4">
            Todo el contenido de esta plataforma, incluyendo textos, gráficos, logos y software,
            es propiedad de Active English y está protegido por leyes de propiedad intelectual.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-[#0b3d4d] mb-4">
            5. Modificaciones
          </h2>
          <p className="text-gray-700 mb-4">
            Nos reservamos el derecho de modificar estos términos en cualquier momento.
            Los cambios entrarán en vigor al publicarse en esta página.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-[#0b3d4d] mb-4">
            6. Contacto
          </h2>
          <p className="text-gray-700 mb-4">
            Si tienes preguntas sobre estos términos, puedes contactarnos a través de
            los canales oficiales de la plataforma.
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

