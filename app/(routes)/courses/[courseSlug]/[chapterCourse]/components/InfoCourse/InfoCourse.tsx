import { Lock } from "lucide-react";
import { InfoCourseProps } from "./InfoCourse.types";
import { VideoCourse } from "./VideoCourse";
import { ProgressCourse } from "./ProgressCourse";

export function InfoCourse(props: InfoCourseProps) {
  const {
    chapterCourseId,
    infoCourse,
    purchaseCourse,
    userProgress,
    videoUrl,
  } = props;

  const { title, description } = infoCourse;
  // const { category } = infoCourse; // Comentado - no se usa por ahora

  return (
    <div className="w-full relative space-y-6">
      {!purchaseCourse && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center
        backdrop-blur-md gap-y-2 h-full z-30 rounded-md text-secondary
        "
        >
          <Lock className="w-8 h-8" />
          <p className="text-sm">
            Modulo bloccato. Paga il corso per sbloccarlo
          </p>
        </div>
      )}

      {videoUrl && (
        <div className="bg-card rounded-md p-4 shadow-md">
          <VideoCourse videoUrl={videoUrl} />
        </div>
      )}

      <div className="bg-card rounded-md p-6 shadow-md">
        <ProgressCourse
          userProgress={userProgress}
          chapterCourseId={chapterCourseId}
          infoCourse={infoCourse}
        />
      </div>

      <div className="bg-card rounded-md p-6 shadow-md space-y-4">
        <div>
          <h2 className="text-2xl font-semibold text-card-foreground mb-3">{title}</h2>
          {/* Por ahora todos los cursos son webinar */}
          <div className="w-fit mb-4 px-2 py-1 bg-primary text-primary-foreground rounded-full text-xs shadow-md">
            webinar
          </div>
        </div>
        {description && (
          <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
        )}
      </div>
    </div>
  );
}
