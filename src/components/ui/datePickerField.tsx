"use client";
import React, { useState } from "react";
import { format, parseISO } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Controller, Control } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import { Label } from "@radix-ui/react-label";

type DatePickerFieldProps = {
  control: Control;
  name: string;
  label: string;
  defaultValue?: string;
};

export function DatePickerField({ control, name, label, defaultValue }: DatePickerFieldProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-3 w-full">
      <Label htmlFor={name} className="px-1 font-semibold text-sm font-semibold">
        {label}
      </Label>
      <Controller
        control={control}
        name={name}
        defaultValue={defaultValue || new Date().toISOString()}
        render={({ field: { value, onChange } }) => {
          const selectedDate = value ? parseISO(value) : undefined;

          return (
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  id={name}
                  className="justify-between font-normal text-md font-se"
                >
                  {selectedDate ? (
                    <span>{format(selectedDate, "dd/MM/yyyy")}</span>
                  ) : (
                    <span>Selecione...</span>
                  )}
                  <CalendarIcon className="size-4 opacity-70 z-0" />
                </Button>
              </PopoverTrigger>

              <PopoverContent
                className="w-auto overflow-hidden p-0 z-40"
                align="start"
                sideOffset={4}
              >
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(d) => {
                    if (d) {
                      onChange(d.toISOString());
                      setOpen(false);
                    }
                  }}
                />
              </PopoverContent>
            </Popover>
          );
        }}
      />
    </div>
  );
}
