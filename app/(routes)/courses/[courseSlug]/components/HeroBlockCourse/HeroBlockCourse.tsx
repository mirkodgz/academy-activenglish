"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { HeroBlockCourseProps } from "./HeroBlockCourse.types";
import { IconBadge } from "@/components/Shared";
import { Calendar, Timer } from "lucide-react";
// import { ChartNoAxesColumn } from "lucide-react"; // Comentado - no usamos nivel por ahora
// import { formatPrice } from "@/lib/formatPrice"; // Comentado - no usamos precio por ahora
import { Button } from "@/components/ui/button";
import Image from "next/image";
import axios from "axios";
import { toast } from "sonner";

export function HeroBlockCourse(props: HeroBlockCourseProps) {
  const { course, purchaseCourse } = props;
  const {
    title,
    id,
    description,
    // price, // Comentado - no usamos precio por ahora
    // level, // Comentado - no usamos nivel por ahora
    imageUrl,
    updatedAt,
    slug,
    chapters,
  } = course;

  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const enrollCourse = async () => {
    setIsLoading(true);
    // Por ahora todos los cursos son gratuitos
    try {
      await axios.post(`/api/course/${id}/enroll`);
      toast("Iscrizione riuscita 🎉");
      router.push(`/courses/${slug}/${chapters[0].id}`);
    } catch (error) {
      toast.error("Errore nell'iscrizione 😭");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const redirectToCourse = () => {
    router.push(`/courses/${slug}/${chapters[0].id}`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-3xl font-semibold">{title}</h2>
          {/* Por ahora todos los cursos son webinar */}
          <span className="px-3 py-1 bg-primary text-primary-foreground rounded-full text-xs font-medium shadow-md">
            webinar
          </span>
        </div>
        
        {description && (
          <p className="text-balance text-muted-foreground leading-relaxed">{description}</p>
        )}

        <div className="flex flex-col gap-4 text-muted-foreground">
          <IconBadge icon={Timer} text="7h 40min" />

          <IconBadge
            icon={Calendar}
            text={`Ultimo aggiornamento: ${new Date(
              updatedAt
            ).toLocaleDateString("it-IT")}`}
          />

          {/* Nivel comentado - Por ahora no mostramos niveles */}
          {/* <IconBadge icon={ChartNoAxesColumn} text={level || ""} /> */}
        </div>

        {/* Precio comentado - Por ahora no mostramos precios */}
        {/* <h2 className="text-xl font-semibold my-4">{formatPrice(price)}</h2> */}

        <div className="pt-2">
          {purchaseCourse ? (
            <Button
              onClick={redirectToCourse}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              disabled={isLoading}
              size="lg"
            >
              Inizia corso
            </Button>
          ) : (
            <Button
              onClick={enrollCourse}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              disabled={isLoading}
              size="lg"
            >
              Iscriviti ora
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-center">
        <Image
          src={imageUrl || "/default-image-course.webp"}
          alt={title}
          width={500}
          height={400}
          className="rounded-md"
        />
      </div>
    </div>
  );
}
