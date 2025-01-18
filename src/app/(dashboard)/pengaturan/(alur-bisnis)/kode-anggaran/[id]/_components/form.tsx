import { CurrencyInput } from "@/components/currency-input"
import SearchSelect from "@/components/search-select"
import { Button } from "@/components/ui/button"
import { DialogFooter } from "@/components/ui/dialog"
import {
  Form as OriginalForm,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { type SelectProps } from "@/lib/type"
import { zodResolver } from "@hookform/resolvers/zod"
import { LoaderCircle } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

const formSchema = z.object({
  "departmentId": z.string().min(1).max(255),
  "nilai": z.string()
})


interface Props {
  departments: SelectProps[]
  isEdit?: boolean
  onSubmit(values: z.infer<typeof formSchema>): Promise<void>
  isPending: boolean
  value?: any,
}

export const Form = ({
  departments,
  value,
  isEdit = false,
  onSubmit,
  isPending
}: Props) => {

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      departmentId: isEdit ? value.departmentId : '',
      nilai: undefined
    },
  })


  return (
    <div className="relative">
      <OriginalForm {...form}>
        <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="space-y-2 ">
          <SearchSelect
            data={departments}
            form={form}
            label="Department"
            name="departmentId"
            placeholder="Pilih Department"
          />
          <FormField
            control={form.control}
            name="nilai"
            render={({ }) => (
              <FormItem>
                <FormLabel>Nilai</FormLabel>
                <FormControl>
                  <CurrencyInput
                    placeholder="Rp ..."
                    value={form.watch('nilai')}
                    onValueChange={(_v, _n, value) => {
                      form.setValue("nilai", value!.value)
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <DialogFooter>
            <Button disabled={isPending} type="submit">
              {isPending ?
                <LoaderCircle className="animate-spin" />
                : isEdit ? "Ubah" :
                  "Tambah"
              }
            </Button>
          </DialogFooter>
        </form>
      </OriginalForm>
    </div>
  )
}