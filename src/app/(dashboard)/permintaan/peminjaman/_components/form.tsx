import SearchSelect from "@/components/search-select"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { DialogFooter } from "@/components/ui/dialog"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Form as OriginalForm,
} from "@/components/ui/form"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { type RouterOutputs } from "@/trpc/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { addDays, format } from "date-fns"
import { CalendarIcon, LoaderCircle } from "lucide-react"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

const formSchema = z.object({
  "type": z.string().min(1).max(255),
  'asetId': z.string().min(1),
  'ruangId': z.string().min(1),
  'peruntukan': z.string().min(1),
  "date": z.object({
    from: z.date(),
    to: z.date(),
  }).refine(
    (data) => data.from > addDays(new Date(), -1),
    "Start date must be in the future"
  ),

})

interface Props {
  asets: RouterOutputs['daftarAset']['getSelectUser']
  onSubmit(values: z.infer<typeof formSchema>): Promise<void>
  isPending: boolean
}

export const Form = ({
  asets,
  onSubmit,
  isPending
}: Props) => {

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "0",
      asetId: '',
      ruangId: '',
      peruntukan: "",
    },
  })

  const formType = form.watch("type")
  const setValue = form.setValue

  useEffect(() => {
    if (formType === "0") {
      setValue("asetId", '1')
      setValue("ruangId", '')
    } else {
      setValue("ruangId", '1')
      setValue("asetId", '')
    }
  }, [formType, setValue])

  return (
    <div className="relative">
      <OriginalForm {...form}>
        <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="">
            <SearchSelect
              data={[{ label: "Ruang", value: "0" }, { label: "Barang", value: "1" }]}
              form={form}
              label="Tipe"
              name="type"
              placeholder="Pilih tipe"
            />
          </div>
          {formType === '0'
            ?
            <div className="">
              <SearchSelect
                data={asets ? asets.map((v) => ({
                  ...v
                })) : []}
                form={form}
                label="Pilih ruang"
                name="ruangId"
                placeholder="Pilih ruang"
              />
            </div>
            :
            <div className="">
              <SearchSelect
                data={asets ? asets.map((v) => ({
                  ...v
                })) : []}
                form={form}
                label="No inventaris | Aset"
                name="asetId"
                placeholder="Pilih no inventaris"
              />
            </div>
          }
          <div>
            <FormField
              control={form.control}
              name="peruntukan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Peruntukan</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Peruntukan"
                      className=""
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Tanggal peminjaman</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value?.from ? (
                          field.value?.to ? (
                            <>
                              {format(field.value.from, "LLL dd, y")} -{" "}
                              {format(field.value.to, "LLL dd, y")}
                            </>
                          ) : (
                            format(field.value.from, "LLL dd, y")
                          )
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="range"

                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < new Date()
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <DialogFooter className="mt-4">
            <Button disabled={isPending} type="submit">
              {isPending ?
                <LoaderCircle className="animate-spin" />
                : 'Submit'
              }
            </Button>
          </DialogFooter>
        </form>
      </OriginalForm>
    </div>
  )
}