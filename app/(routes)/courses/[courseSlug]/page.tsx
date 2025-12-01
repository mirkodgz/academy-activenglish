import { redirect } from "next/navigation";

import { getCourseBySlug } from "@/actions/getCourseBySlug";
import { getPurchaseCourseById } from "@/actions/getPurchaseCourseById";

import { BreadCrumbCourse, CourseContent, HeroBlockCourse } from "./components";
import { currentUser } from "@clerk/nextjs/server";

export default async function CoursePage({
  params,
}: {
  params: Promise<{ courseSlug: string }>;
}) {
  const { courseSlug } = await params;

  const infoCourse = await getCourseBySlug(courseSlug);

  if (!infoCourse) {
    redirect("/");
  }

  const { title, id } = infoCourse;

  const user = await currentUser();

  if (!user) {
    redirect("/");
  }

  const purchaseCourse = await getPurchaseCourseById(user.id, id);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="my-4 mx-6 border rounded-lg bg-white p-6">
        <p>{title}</p>
        <BreadCrumbCourse title={title} />

        <HeroBlockCourse course={infoCourse} purchaseCourse={purchaseCourse} />
      </div>

      <div className="my-4 mx-6 border rounded-lg bg-white p-6">
        <CourseContent chapters={infoCourse.chapters} />
      </div>
    </div>
  );
}
