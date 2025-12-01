import { getPurchasedCourses } from "@/actions/getPurchasedCourses";
import { ListCourses } from "@/components/Shared";

export default async function MyCoursesPage() {
  const courses = await getPurchasedCourses();

  return (
    <div>
      <ListCourses title="I miei corsi" courses={courses} />
    </div>
  );
}
