import Image from "next/image";

import { CourseCardProps } from "./CourseCard.types";
// import { ChartNoAxesColumn, DollarSign } from "lucide-react"; // Comentado - no usamos nivel ni precio por ahora
import { Actions } from "./Actions";

export function CourseCard(props: CourseCardProps) {
  const { course } = props;
  const { id, title, imageUrl, description, isPublished } =
    course;
  // const { price, level } = course; // Comentado - no usamos precio ni nivel por ahora
  // const { user } = course; // TODO: Descomentar después de migración

  return (
    <div className="relative">
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col lg:flex-row gap-4 items-start">
          <Image
            src={imageUrl || "/default-image-course.webp"}
            alt="Corso"
            width={150}
            height={150}
            className="rounded-md max-w-52"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-medium">{title}</h2>

              {isPublished ? (
                <span
                  className="inline-block bg-[#60CB58]/20
                 text-[#0b3d4d] text-xs font-medium px-2 py-1 rounded-md mt-1"
                >
                  Pubblicato
                </span>
              ) : (
                <span className="inline-block bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1 rounded-md mt-1">
                  Non pubblicato
                </span>
              )}
            </div>

            {description && (
              <p className="text-gray-400 w-full max-w-lg line-clamp-1 text-sm">
                {description}
              </p>
            )}

            <div className="flex flex-col md:flex-row gap-4 items-center">
              {/* Precio comentado - Por ahora no mostramos precios */}
              {/* <div className="flex gap-1 items-center text-sm mt-2">
                <DollarSign className="w-4 h-4 text-gray-400" />
                <span className="text-gray-400">Prezzo:</span>
                <span className="font-semibold">{price || 0}</span>
              </div> */}

              {/* Nivel comentado - Por ahora no mostramos niveles */}
              {/* <div className="flex gap-1 items-center text-sm mt-2">
                <ChartNoAxesColumn className="w-4 h-4 text-gray-400" />
                <span className="text-gray-400">Livello:</span>
                <span className="font-semibold">{level || "Principiante"}</span>
              </div> */}

              {/* TODO: Mostrar creador después de ejecutar migración de Prisma */}
              {/* {user && (
                <div className="flex gap-1 items-center text-sm mt-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-400">Creato da:</span>
                  <span className="font-semibold">
                    {user.firstName || ""} {user.lastName || ""}
                  </span>
                </div>
              )} */}
            </div>
          </div>
        </div>

        <Actions courseId={id} />
      </div>
    </div>
  );
}
