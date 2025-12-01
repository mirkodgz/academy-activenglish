"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { HeroBlockCourseProps } from "./HeroBlockCourse.types";
import { IconBadge } from "@/components/Shared";
import { Calendar, ChartNoAxesColumn, Timer } from "lucide-react";
import { formatPrice } from "@/lib/formatPrice";
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
    price,
    level,
    imageUrl,
    updatedAt,
    slug,
    chapters,
  } = course;

  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const enrollCourse = async () => {
    setIsLoading(true);
    if (price === "Gratuito") {
      try {
        await axios.post(`/api/course/${id}/enroll`);

        toast("Iscrizione riuscita 🎉");
        router.push(`/courses/${slug}/${chapters[0].id}`);
      } catch (error) {
        toast.error("Errore nell'iscrizione 😭");
        console.error(error);
      } finally {
        setIsLoading(true);
      }
    } else {
      try {
        const response = await axios.post(`/api/course/${id}/checkout`);

        // Validar que la URL sea de Stripe antes de redirigir
        const stripeUrl = response.data.url;
        if (stripeUrl && typeof stripeUrl === "string" && stripeUrl.startsWith("https://checkout.stripe.com")) {
          window.location.assign(stripeUrl);
        } else {
          toast.error("URL di checkout non valida");
          console.error("Invalid checkout URL:", stripeUrl);
        }
      } catch {
        toast.error("Errore nell'iscrizione");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const redirectToCourse = () => {
    router.push(`/courses/${slug}/${chapters[0].id}`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
      <div>
        <h2 className="text-3xl font-semibold">{title}</h2>
        <p className="text-balance mt-2">{description}</p>

        <div className="flex flex-col gap-3 mt-5 text-gray-600">
          <IconBadge icon={Timer} text="7h 40min" />

          <IconBadge
            icon={Calendar}
            text={`Ultimo aggiornamento: ${new Date(
              updatedAt
            ).toLocaleDateString("it-IT")}`}
          />

          <IconBadge icon={ChartNoAxesColumn} text={level || ""} />
        </div>

        <h2 className="text-xl font-semibold my-4">{formatPrice(price)}</h2>

        {purchaseCourse ? (
          <Button
            onClick={redirectToCourse}
            className="hover:bg-[#0b3d4d] text-white font-semibold"
            disabled={isLoading}
          >
            Vedi corso
          </Button>
        ) : (
          <Button
            onClick={enrollCourse}
            className="hover:bg-[#0b3d4d] text-white font-semibold"
            disabled={isLoading}
          >
            Iscriviti ora
          </Button>
        )}
      </div>

      <Image
        src={imageUrl || "/default-image-course.webp"}
        alt={title}
        width={500}
        height={400}
        className="rounded-md"
      />
    </div>
  );
}
