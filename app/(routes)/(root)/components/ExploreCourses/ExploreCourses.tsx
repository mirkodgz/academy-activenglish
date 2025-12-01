"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import Image from "next/image";

export function ExploreCourses() {
  const router = useRouter();

  return (
    <div>
      <div className="my-4 mx-6 border rounded-lg bg-white ">
        <div className="grid grid-cols-1 md:grid-cols-[60%_40%] gap-4">
          <div className="p-6 flex flex-col gap-3">
            <h1 className="text-4xl font-semibold">
              Esplora tutti i corsi 👋
            </h1>
            <p className="text-balance max-w-2xl">
              Inizia a imparare a programmare da zero con questi corsi. Non
              hai bisogno di esperienza precedente, non hai bisogno di un computer
              all&apos;ultima tecnologia. Hai solo bisogno di tanta voglia e un buon caffè ☕️
            </p>
            <Button className="w-fit" onClick={() => router.push("/courses")}>
              Inizia ad imparare
            </Button>
          </div>
          <div className="flex items-end">
            <Image
              src="/explore.png"
              alt="Esplora tutti i corsi"
              width={300}
              height={200}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
