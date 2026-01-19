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
import { useUploadThing } from "@/app/api/uploadthing/utils";
import { createAnimal } from "@/app/actions/pet";

export const dogBreeds = [
  { label: "Vira-lata (SRD)", value: "vira-lata" },
  { label: "Labrador Retriever", value: "labrador" },
  { label: "Golden Retriever", value: "golden" },
  { label: "Pastor Alemão", value: "pastor-alemao" },
  { label: "Bulldog Inglês", value: "bulldog-ingles" },
  { label: "Bulldog Francês", value: "bulldog-frances" },
  { label: "Poodle", value: "poodle" },
  { label: "Shih Tzu", value: "shih-tzu" },
  { label: "Yorkshire Terrier", value: "yorkshire" },
  { label: "Beagle", value: "beagle" },
  { label: "Rottweiler", value: "rottweiler" },
  { label: "Pit Bull", value: "pitbull" },
  { label: "Dachshund (Salsicha)", value: "dachshund" },
  { label: "Boxer", value: "boxer" },
  { label: "Chihuahua", value: "chihuahua" },
  { label: "Maltês", value: "maltes" },
  { label: "Cocker Spaniel", value: "cocker-spaniel" },
  { label: "Husky Siberiano", value: "husky" },
  { label: "Border Collie", value: "border-collie" },
  { label: "Pug", value: "pug" },
];

export const catBreeds = [
  { label: "Sem Raça Definida (SRD)", value: "srd" },
  { label: "Persa", value: "persa" },
  { label: "Siamês", value: "siames" },
  { label: "Maine Coon", value: "maine-coon" },
  { label: "Sphynx (Gato sem pelo)", value: "sphynx" },
  { label: "Angorá", value: "angora" },
  { label: "Ragdoll", value: "ragdoll" },
  { label: "British Shorthair", value: "british-shorthair" },
  { label: "American Shorthair", value: "american-shorthair" },
  { label: "Bengal", value: "bengal" },
  { label: "Norueguês da Floresta", value: "noruegues" },
  { label: "Abissínio", value: "abissinio" },
  { label: "Exótico de Pelo Curto", value: "exotico" },
  { label: "Himalaio", value: "himalaio" },
  { label: "Oriental", value: "oriental" },
  { label: "Birmanês", value: "birmanes" },
  { label: "Savannah", value: "savannah" },
];

// 🎯 Schema de validação com Zod (updated)
const formSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres."),
  details: z.string().optional(),
  breed: z.string({ error: "Por favor, selecione uma raça." }),
  age: z.date({ error: "Por favor, selecione uma data de nascimento." }),
  lastBath: z.date().optional(),
  blob: z.instanceof(File).optional(),
  weightKg: z.string().optional(),
  gender: z.enum(["male", "female"]),
  animalType: z.enum(["dog", "cat", "other"]),
});

type FormValues = z.infer<typeof formSchema>;

export default function NewPetForm() {
  const { startUpload } = useUploadThing("imageUploader");
  const [loading, setLoading] = React.useState(false);
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      details: "",
      breed: "vira-lata",
      blob: undefined,
      gender: "male",
      weightKg: "",
      animalType: "dog",
    },
  });

  const uploadFile = async (file: File) => {
    const uploaded = await startUpload([file]);
    if (!uploaded || uploaded.length === 0) {
      throw new Error("Nenhum arquivo foi enviado.");
    }
    return uploaded[0].ufsUrl;
  };

  const onSubmit = async ({ name, details, breed, age, gender, blob, lastBath, weightKg }: FormValues) => {
    setLoading(true);
    try {
      if (!blob) throw new Error("Nenhum arquivo selecionado.");
      const fileUrl = await uploadFile(blob);

      const result = await createAnimal({
        name,
        details,
        breed,
        gender,
        weightKg,
        age: new Date(age),
        lastBath: new Date(lastBath || new Date()),
        imageUrl: fileUrl,
      });

      if (result.error) {
        throw new Error(result.error);
      }
      if (result.data) {
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Erro ao criar o pet:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ImageCropper
        className="flex flex-col"
        label="Selecione uma imagem do pet"
        aspect={1}
        onChange={(file) => {
          setValue("blob", file ?? undefined);
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

        {/* Data de Nascimento */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="age">Data de Nascimento</Label>
          <Controller
            name="age"
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
                    disabled={(date) => date > new Date() || date < new Date("1990-01-01")}
                    captionLayout="dropdown"
                  />
                </PopoverContent>
              </Popover>
            )}
          />
          {errors.age && <span className="text-destructive text-sm">{errors.age.message}</span>}
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

        {/* Tipo de Animal */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="animalType">Tipo de Animal</Label>
          <Controller
            name="animalType"
            control={control}
            defaultValue="dog"
            render={({ field }) => (
              <RadioGroup
                onValueChange={(value) => {
                  field.onChange(value);
                  setValue("breed", value === "other" ? "undefined" : value === "dog" ? dogBreeds[0].value : catBreeds[0].value);
                }}
                value={field.value}
                className="flex gap-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="dog" id="dog" />
                  <Label htmlFor="dog" className="cursor-pointer">Cachorro</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cat" id="cat" />
                  <Label htmlFor="cat" className="cursor-pointer">Gato</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="other" id="other" />
                  <Label htmlFor="other" className="cursor-pointer">Outro</Label>
                </div>
              </RadioGroup>
            )}
          />
          {errors.animalType && <span className="text-destructive text-sm">{errors.animalType.message}</span>}
        </div>

        {/* Peso */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="weightKg">Peso (kg)</Label>
          <Controller
            name="weightKg"
            control={control}
            render={({ field }) => <Input type="number" id="weightKg" {...field} placeholder="Peso em kg" />} 
          />
          {errors.weightKg && <span className="text-destructive text-sm">{errors.weightKg.message}</span>}
        </div>

        {/* Raça */}
        {watch("animalType") !== "other" && (
          <div className="flex flex-col gap-2">
            <Label htmlFor="breed">Raça</Label>
            <Controller
              name="breed"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione uma raça" />
                  </SelectTrigger>
                  <SelectContent>
                    {(watch("animalType") === "dog" ? dogBreeds : catBreeds).map((breed) => (
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
        )}

        {/* Último Banho */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="lastBath">Último Banho</Label>
          <Controller
            name="lastBath"
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
                    disabled={(date) => date > new Date() || date < new Date("1990-01-01")}
                    captionLayout="dropdown"
                  />
                </PopoverContent>
              </Popover>
            )}
          />
          {errors.lastBath && <span className="text-destructive text-sm">{errors.lastBath.message}</span>}
        </div>

        {/* Botão */}
        <Button loading={loading} type="submit" className="w-full">
          ADICIONAR
        </Button>
      </form>
    </>
  );
 }
