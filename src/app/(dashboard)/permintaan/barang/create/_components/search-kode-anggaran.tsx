import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Check, ChevronsUpDown } from "lucide-react";
import { type Dispatch, type SetStateAction, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { type SelectProps } from "@/lib/type";

export default function SearchKodeAnggaran({
  data,
  value,
  setValue
}: {
  data: SelectProps[],
  value: string,
  setValue: Dispatch<SetStateAction<string>>
}) {
  const [open, setOpen] = useState(false)
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between",
            !value && "text-muted-foreground"
          )}
        >
          {value
            ? data?.find(
              (v) => v?.value === value
            )?.label
            : "Kode anggaran"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className=" p-0">
        <Command>
          <CommandInput placeholder="Kode anggaran" />
          <CommandEmpty>No data.</CommandEmpty>
          <CommandGroup>
            {data?.map((v) => (
              <CommandItem
                value={v.label}
                key={v.value}
                onSelect={() => {
                  setValue(v.value)
                  setOpen(false)
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    v.value === value
                      ? "opacity-100"
                      : "opacity-0"
                  )}
                />
                {v.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}