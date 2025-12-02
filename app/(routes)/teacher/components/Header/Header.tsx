import { Plus, GraduationCap } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import { FormCreateCourse } from "./FormCreateCourse";

export function Header() {
  return (
    <div className="my-4 mx-6 border rounded-lg bg-card shadow-sm">
      <div className="flex justify-between items-center py-4 px-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary">
            <GraduationCap className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-card-foreground">
              Modalità insegnante
            </h1>
            <p className="text-sm text-muted-foreground">
              Gestisci i tuoi corsi e crea nuovi contenuti
            </p>
          </div>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
              <Plus className="w-4 h-4 mr-2" />
              Crea corso
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-2xl text-foreground">
                Crea il tuo corso
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Inizia creando un nuovo corso. Potrai aggiungere capitoli,
                immagini e configurazioni dopo.
              </DialogDescription>
            </DialogHeader>

            <FormCreateCourse />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
