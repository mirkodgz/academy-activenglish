import { CourseCard } from "./CourseCard";
import { ListCoursesProps } from "./ListCourses.types";
import { BookOpen } from "lucide-react";

export function ListCourses(props: ListCoursesProps) {
  const { courses } = props;

  if (courses.length === 0) {
    return (
      <div className="my-4 mx-6 border rounded-lg bg-card p-12">
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <div className="p-4 rounded-full bg-primary/10">
            <BookOpen className="w-12 h-12 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-medium text-card-foreground mb-2">
              Nessun corso creato
            </h3>
            <p className="text-muted-foreground max-w-md">
              Inizia creando il tuo primo corso! Clicca su &quot;Crea corso&quot; per
              iniziare.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col my-4 mx-6 border rounded-lg bg-card p-6 gap-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-medium text-card-foreground">
          Tutti i corsi ({courses.length})
        </h2>
      </div>

      <div className="space-y-6">
        {courses.map((course, index) => (
          <div key={course.id}>
            <CourseCard course={course} />
            {index < courses.length - 1 && (
              <div className="border-t border-border w-full mt-6" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
