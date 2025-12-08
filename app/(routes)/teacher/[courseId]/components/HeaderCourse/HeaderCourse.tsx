"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { HeaderCourseProps } from "./HeaderCourse.types";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, MoveLeft, Trash } from "lucide-react";

import axios from "axios";
import { toast } from "sonner";

export function HeaderCourse(props: HeaderCourseProps) {
  const { idCourse, isPublished } = props;
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const onPublish = async (state: boolean) => {
    setIsLoading(true);
    try {
      axios.patch(`/api/course/${idCourse}`, {
        isPublished: state,
      });

      toast(state ? "Corso pubblicato" : "Corso nascosto");
      router.refresh();
    } catch {
      toast("Ops, qualcosa è andato storto");
    }

    setIsLoading(false);
  };

  const removeCourse = async () => {
    axios.delete(`/api/course/${idCourse}`);
    toast("Corso eliminato correttamente");

    router.push("/teacher");
  };

  return (
    <div>
      <div className="mb-4 ">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <Button onClick={() => router.push("/teacher")}>
            <MoveLeft />
            Torna a tutti i corsi
          </Button>

          <div className="gap-2 flex items-center">
            {isPublished ? (
              <Button
                variant="outline"
                onClick={() => onPublish(false)}
                disabled={isLoading}
              >
                Nascondi
                <EyeOff />
              </Button>
            ) : (
              <Button disabled={isLoading} onClick={() => onPublish(true)}>
                Pubblica
                <Eye />
              </Button>
            )}

            <Button variant="destructive" onClick={removeCourse}>
              <Trash />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
