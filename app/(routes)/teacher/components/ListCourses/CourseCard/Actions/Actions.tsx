"use client";

import { useRouter } from "next/navigation";
import { Edit, Trash } from "lucide-react";

import { ActionsProps } from "./Actions.types";

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
import axios from "axios";
import { toast } from "sonner";

export function Actions(props: ActionsProps) {
  const { courseId } = props;

  const router = useRouter();

  const onEdit = () => {
    router.push(`/teacher/${courseId}`);
  };

  const deleteCourse = () => {
    axios.delete(`/api/course/${courseId}`);
    toast("Curso eliminado correctamente 🎉");

    router.refresh();
  };
  return (
    <div className="flex flex-col gap-2 items-center w-full lg:max-w-42">
      <Button className="w-full" onClick={onEdit}>
        Editar <Edit className="w-4 h-4" />
      </Button>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="outline"
            className="w-full text-red-500 border-red-500 hover:bg-red-100 hover:text-red-500"
          >
            Eliminar <Trash className="w-4 h-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esto borrará el curso y todos sus datos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteCourse}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
