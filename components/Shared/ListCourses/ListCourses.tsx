import Link from "next/link";
import { ListCoursesProps } from "./ListCourses.types";
import Image from "next/image";
import { IconBadge } from "../IconBadge";
import { Book } from "lucide-react";
// import { ChartNoAxesColumn } from "lucide-react"; // Comentado - no usamos nivel por ahora
import { ProgressCourse } from "./ProgressCourse";

export function ListCourses(props: ListCoursesProps) {
  const { title, courses } = props;

  return (
    <div>
      <div className="my-4 mx-6 border rounded-lg bg-card p-6">
        <h2 className="text-2xl font-normal text-card-foreground">{title}</h2>

        <div className="border-b-[1px] border-border py-2" />

        {courses && courses.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-3 mt-4">
            {courses.map(
              ({
                id,
                imageUrl,
                title,
                slug,
                chapters,
              }) => (
                // const { level, price, category } = course; // Comentado - no se usan por ahora
                <Link
                  key={id}
                  href={`/courses/${slug}`}
                  className="border rounded-lg relative transition-shadow hover:shadow-lg shadow-[#0b3d4d]/20 shadow-md overflow-hidden"
                >
                  {/* Por ahora todos los cursos son webinar */}
                  <span
                    className="absolute top-2 right-2 z-30 px-2.5 py-1 bg-[#0b3d4d] text-white
                  font-semibold rounded-full text-xs shadow-lg"
                  >
                    webinar
                  </span>
                  <div className="w-full h-[180px] relative">
                    <Image
                      src={imageUrl || "/default-image-course.webp"}
                      alt={title}
                      fill
                      className="object-cover object-center rounded-t-lg"
                      sizes="(max-width: 500px) 100vw, 1200px"
                    />
                  </div>
                  <div className="p-2">
                    <h3 className="text-lg font-semibold text-foreground truncate">
                      {title}
                    </h3>

                    <div className="flex items-center gap-2 justify-between mt-2">
                      <IconBadge
                        icon={Book}
                        text={`${chapters.length} Capitoli`}
                      />

                      {/* Nivel comentado - Por ahora no mostramos niveles */}
                      {/* <IconBadge icon={ChartNoAxesColumn} text={level || ""} /> */}
                    </div>

                    <ProgressCourse
                      courseId={id}
                      totalChapters={chapters.length}
                    />
                  </div>
                </Link>
              )
            )}
          </div>
        ) : (
          <p className="text-muted-foreground text-center mt-4">
            Non ci sono corsi disponibili al momento.
          </p>
        )}
      </div>
    </div>
  );
}
