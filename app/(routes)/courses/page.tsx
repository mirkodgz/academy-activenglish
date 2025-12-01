import { getHomeCourses } from "@/actions/getHomeCourses";
import { ListCourses } from "@/components/Shared";

export default async function CoursePage() {
  const listCourses = await getHomeCourses();

  return (
    <div>
      <ListCourses title="Tutti i corsi" courses={listCourses} />
    </div>
  );
}
