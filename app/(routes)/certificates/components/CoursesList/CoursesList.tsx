import Image from "next/image";
import { CoursesListProps } from "./CoursesList.types";
import { CourseProgressDisplay } from "./CourseProgressDisplay";

export function CoursesList(props: CoursesListProps) {
  const { courses, userName } = props;

  return (
    <div className="grid grid-cols-1 gap-5">
      {courses.map((course) => (
        <div
          key={course.id}
          className="border rounded-md p-4 flex gap-4 justify-between shadow-sm bg-card"
        >
          <div className="flex gap-4 ">
            <div>
              <Image
                src={course.imageUrl || "/default-image-course.webp"}
                alt={course.title}
                width={100}
                height={100}
                className="rounded-md"
              />
            </div>
            <div className="flex flex-col">
              <h2 className="text-xl font-semibold text-card-foreground">{course.title}</h2>
              <p className="max-w-sm text-muted-foreground text-xs line-clamp-2">
                {course.description}
              </p>
            </div>
          </div>

          <div>
            <CourseProgressDisplay
              progress={course.progress}
              titleCourse={course.title}
              userName={userName}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
