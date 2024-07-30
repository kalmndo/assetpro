"use client"
import { type UseFormReturn } from "react-hook-form";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

type Data = {
  label: string
  value: string
  [key: string]: string | number;
}

type TextInputProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>;
  name: string;
  label: string;
  placeholder: string;
  className?: string
  data?: Data[]
  disabled?: boolean
};

const SearchSelect = (props: TextInputProps) => {
  const [open, setOpen] = useState(false)

  return (
    <FormField
      control={props.form.control}
      name={props.name}
      render={({ field }) => (
        <FormItem className="flex flex-col ">
          <FormLabel className="my-1">{props.label}</FormLabel>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  disabled={props.disabled ?? false}
                  className={cn(
                    "justify-between",
                    !field.value && "text-muted-foreground"
                  )}
                >
                  {field.value
                    ? props.data?.find(
                      (data) => data?.value === field?.value
                    )?.label
                    : props.placeholder}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className=" p-0">
              <Command>
                <CommandInput placeholder={props.placeholder} />
                <CommandList>
                  <CommandEmpty>No data.</CommandEmpty>
                  <CommandGroup>
                    {props.data?.map((data) => (
                      <CommandItem
                        value={data.label}
                        key={data.value}
                        onSelect={() => {
                          props.form.setValue(props.name, data.value)
                          setOpen(false)
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            data.value === field.value
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {data.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export default SearchSelect