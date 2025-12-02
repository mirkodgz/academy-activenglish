"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import Image from "next/image";

export function ExploreCourses() {
  const router = useRouter();

  return (
    <div>
      <div className="my-4 mx-6 border rounded-lg bg-card">
        <div className="grid grid-cols-1 md:grid-cols-[60%_40%] gap-4">
          <div className="p-6 flex flex-col gap-3">
            <h1 className="text-4xl font-semibold text-card-foreground">
              Benvenuto su activenglish 👋
            </h1>
            <p className="text-balance max-w-2xl text-muted-foreground">
              La tua piattaforma di apprendimento online per migliorare le tue competenze. 
              Esplora contenuti di qualità, impara al tuo ritmo e raggiungi i tuoi obiettivi. 
              Inizia il tuo percorso di crescita oggi stesso! 🚀
            </p>
            <Button className="w-fit" onClick={() => router.push("/courses")}>
              Inizia ad imparare
            </Button>
          </div>
          <div className="flex items-end">
            <Image
              src="/explore.png"
              alt="Benvenuto su activenglish"
              width={300}
              height={200}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
