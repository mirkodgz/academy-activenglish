"use client";

import { formatPrice } from "@/lib/formatPrice";

import { Progress } from "@/components/ui/progress";

import { ProgressCourseProps } from "./ProgressCourse.types";
import { useEffect, useState } from "react";
import axios from "axios";

export function ProgressCourse(props: ProgressCourseProps) {
  const { courseId, totalChapters, price } = props;

  // Mock: Usuario siempre disponible para desarrollo
  const mockUserId = "mock-user-id-123";

  const [progressCourse, setProgressCourse] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const { data } = await axios.post("/api/get-user-progress", {
          courseId,
          userId: mockUserId,
        });

        setProgressCourse(data.progress);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [courseId]);

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
