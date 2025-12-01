"use client";

import html2canvas from "html2canvas-pro";
import { useRef } from "react";
import { Download } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

import { DownloadCertificateProps } from "./DownloadCertificate.types";
import { Certificate } from "./Certificate";

export function DownloadCertificate(props: DownloadCertificateProps) {
  const { userName, titleCourse } = props;

  const certRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!certRef.current) return;

    const canvas = await html2canvas(certRef.current, {
      scale: 1,
    });
    const link = document.createElement("a");
    link.download = `certificado-${titleCourse}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline">
          Scarica certificato
          <Download className="w-4 h-4 ml-2" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="w-full !max-w-[900px]">
        <AlertDialogHeader>
          <AlertDialogTitle>Scarica il tuo certificato</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <Certificate
              certRef={certRef}
              userName={userName}
              titleCourse={titleCourse}
            />
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annulla</AlertDialogCancel>
          <AlertDialogAction onClick={handleDownload}>
            Scarica
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
