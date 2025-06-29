"use client";

import * as React from "react";
import * as z from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

import { CalendarIcon, Mars, Venus } from "lucide-react";
import { ImageCropper } from "../input/imageCropper";

// 🐶 Opções de Raças
const dogBreeds = [
  { label: "Vira-lata (SRD)", value: "vira-lata" },
  { label: "Labrador Retriever", value: "labrador" },
  { label: "Golden Retriever", value: "golden" },
  // ... (rest of the breeds)
];

// 🎯 Schema de validação com Zod (updated)
const formSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres."),
  details: z.string().optional(),
  breed: z.string({ required_error: "Por favor, selecione uma raça." }),
  dateOfBirth: z.date({ required_error: "Por favor, selecione a data de nascimento." }),
  gender: z.enum(["male", "female"]),
});

type FormValues = z.infer<typeof formSchema>;

export default function NewPetForm() {
  const {
    control, // Use control for Controller component
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      details: "",
      breed: "vira-lata",
      gender: "male",
    },
  });

  const onSubmit = (data: FormValues) => {
    const age = new Date().getFullYear() - data.dateOfBirth.getFullYear();
    console.log("Calculated Age:", age);
  };

  return (
    <>
      <ImageCropper
        className="flex flex-col"
        label="Selecione uma imagem do pet"
        aspect={1}
        onChange={(url) => {
          console.log('Imagem cortada:', url);
        }}
      />
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 max-w-md w-full mx-auto">

        {/* Nome */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="name">Nome</Label>
          <Controller
            name="name"
            control={control}
            render={({ field }) => <Input id="name" {...field} placeholder="Nome do pet" />}
          />
          {errors.name && <span className="text-destructive text-sm">{errors.name.message}</span>}
        </div>

        {/* Detalhes */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="details">Detalhes</Label>
           <Controller
            name="details"
            control={control}
            render={({ field }) => (
                <Textarea id="details" {...field} placeholder="Informações adicionais sobre o pet" />
            )}
          />
          {errors.details && <span className="text-destructive text-sm">{errors.details.message}</span>}
        </div>

        {/* Data de Nascimento (Corrected) */}
        <div className="flex flex-col gap-2">
            <Label htmlFor="dateOfBirth">Data de Nascimento</Label>
            <Controller
                name="dateOfBirth"
                control={control}
                render={({ field }) => (
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={`w-full justify-start text-left font-normal ${!field.value && "text-muted-foreground"}`}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value ? (
                                    format(field.value, "PPP", { locale: ptBR })
                                ) : (
                                    <span>Selecione uma data</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                  date > new Date() || date < new Date("1990-01-01")
                                }
                                captionLayout="dropdown"
                            />
                        </PopoverContent>
                    </Popover>
                )}
            />
            {errors.dateOfBirth && <span className="text-destructive text-sm">{errors.dateOfBirth.message}</span>}
        </div>


        {/* Sexo */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="gender">Sexo</Label>
          <Controller
              name="gender"
              control={control}
              render={({ field }) => (
                <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}
                    className="flex gap-6"
                >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="male" id="male" />
                      <Label htmlFor="male" className="flex flex-row items-center gap-1 cursor-pointer">
                        <Mars className="w-4 h-4" /> Macho
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="female" id="female" />
                      <Label htmlFor="female" className="flex flex-row items-center gap-1 cursor-pointer">
                        <Venus className="w-4 h-4" /> Fêmea
                      </Label>
                    </div>
                </RadioGroup>
              )}
          />
          {errors.gender && <span className="text-destructive text-sm">{errors.gender.message}</span>}
        </div>

        {/* Raça */}
        <div className="flex flex-col gap-2">
          <Label>Raça</Label>
            <Controller
                name="breed"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione uma raça" />
                    </SelectTrigger>
                    <SelectContent>
                      {dogBreeds.map((breed) => (
                          <SelectItem key={breed.value} value={breed.value}>
                          {breed.label}
                          </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
            />
          {errors.breed && <span className="text-destructive text-sm">{errors.breed.message}</span>}
        </div>

        {/* Botão */}
        <Button type="submit" className="w-full">Salvar</Button>
      </form>
    </>
  );
}