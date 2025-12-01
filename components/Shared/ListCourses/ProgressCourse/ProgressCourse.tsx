"use client";

import { useUser } from "@clerk/nextjs";

import { formatPrice } from "@/lib/formatPrice";

import { Progress } from "@/components/ui/progress";

import { ProgressCourseProps } from "./ProgressCourse.types";
import { useEffect, useState } from "react";
import axios from "axios";

export function ProgressCourse(props: ProgressCourseProps) {
  const { courseId, totalChapters, price } = props;

  const { user } = useUser();

  const [progressCourse, setProgressCourse] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchProgress = async () => {
      if (!user?.id) return setLoading(false);

      try {
        const { data } = await axios.post("/api/get-user-progress", {
          courseId,
          userId: user.id,
        });

        setProgressCourse(data.progress);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [courseId, user?.id]);

  if (!user) {
    return <p className="text-xs mt-2">Non autenticato</p>;
  }

  if (loading) return <p className="textxs mt-2">Caricamento progresso...</p>;

  return (
    <div className="mt-4">
      {totalChapters > 0 && progressCourse > 0 ? (
        <div>
          <Progress value={progressCourse} className="[&>*]:bg-[#60CB58]" />
          <p className="text-xs mt-1">{progressCourse}% Completato</p>
        </div>
      ) : (
        <h4>{formatPrice(price)}</h4>
      )}
    </div>
  );
}
