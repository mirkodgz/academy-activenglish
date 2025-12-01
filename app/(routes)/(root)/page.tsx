import { getHomeCourses } from "@/actions/getHomeCourses";
import { ExploreCourses } from "./components";
import { ListCourses } from "@/components/Shared";

export default async function Home() {
  const listCourses = await getHomeCourses();

  return (
    <div>
      <ExploreCourses />

      <ListCourses title="Corsi Top" courses={listCourses} />
    </div>
  );
}
