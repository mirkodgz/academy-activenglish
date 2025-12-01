"use client";

import Image from "next/image";
import { DownloadCertificate } from "./CoursesList/CourseProgressDisplay/DownloadCertificate";

type CertificateData = {
  courseId: string;
  courseTitle: string;
  courseImage: string | null;
  studentId: string;
  studentName: string;
  studentEmail: string;
  completedAt: Date;
};

type TeacherCertificatesListProps = {
  certificates: CertificateData[];
};

export function TeacherCertificatesList({ certificates }: TeacherCertificatesListProps) {
  return (
    <div className="space-y-4">
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Totale certificati emessi: <span className="font-semibold text-[#60CB58]">{certificates.length}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {certificates.map((cert, index) => (
          <div
            key={`${cert.courseId}-${cert.studentId}-${index}`}
            className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow bg-white"
          >
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="flex gap-4 flex-1">
                <div className="relative w-20 h-20 flex-shrink-0">
                  <Image
                    src={cert.courseImage || "/default-image-course.webp"}
                    alt={cert.courseTitle}
                    fill
                    className="rounded-md object-cover"
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="text-lg font-semibold text-gray-800 mb-1">
                    {cert.courseTitle}
                  </h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>
                      <span className="font-medium">Studente:</span> {cert.studentName}
                    </p>
                    <p>
                      <span className="font-medium">Email:</span> {cert.studentEmail}
                    </p>
                    <p>
                      <span className="font-medium">Completato il:</span>{" "}
                      {cert.completedAt.toLocaleDateString("it-IT", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex-shrink-0">
                <DownloadCertificate
                  titleCourse={cert.courseTitle}
                  userName={cert.studentName}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

