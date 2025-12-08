"use client";
import { DollarSign } from "lucide-react";

import { TitleBlock } from "../TitleBlock";

import { CoursePriceProps } from "./CoursePrice.types";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { toast } from "sonner";

export function CoursePrice(props: CoursePriceProps) {
  const { idCourse, priceCourse } = props;
  const [price, setPrice] = useState<string | undefined>(
    priceCourse || "Gratuito"
  );

  const onChangePrice = async () => {
    axios.patch(`/api/course/${idCourse}`, {
      price: price,
    });

    toast("Prezzo aggiornato");
  };

  return (
    <div className="p-6 bg-white rounded-md h-fit">
      <TitleBlock title="Prezzo del corso" icon={DollarSign} />

      <Select onValueChange={setPrice} defaultValue={price}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Seleziona un prezzo del corso" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Prezzo del corso</SelectLabel>
            <SelectItem value="Gratuito">Gratuito</SelectItem>
            <SelectItem value="19,99">19,99€</SelectItem>
            <SelectItem value="29,99">29,99€</SelectItem>
            <SelectItem value="39,99">39,99€</SelectItem>
            <SelectItem value="49,99">49,99€</SelectItem>
            <SelectItem value="59,99">59,99€</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>

      <Button onClick={onChangePrice} disabled={!price} className="mt-3">
        Salva prezzo
      </Button>
    </div>
  );
}
