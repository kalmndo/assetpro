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
import { type SelectProps } from "@/lib/type"
import { zodResolver } from "@hookform/resolvers/zod"
import { LoaderCircle } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

const formSchema = z.object({
  "userId": z.string().min(1).max(255),
  "nilai": z.string().min(1).max(255),
})


interface Props {
  isEdit?: boolean
  onSubmit(values: z.infer<typeof formSchema>): Promise<void>
  isPending: boolean
  value?: any,
  users: SelectProps[]
}

export const Form = ({
  value,
  users,
  isEdit = false,
  onSubmit,
  isPending
}: Props) => {

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: isEdit ? value.userId : '',
      nilai: isEdit ? value.nilai : ''
    },
  })
  return (
    <div className="relative">
      <OriginalForm {...form}>
        <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="space-y-2 ">
          {!isEdit && <SearchSelect
            data={users}
            form={form}
            label="User"
            name="userId"
            placeholder="Pilih User"
          />}
          <FormField
            control={form.control}
            name="nilai"
            render={({ }) => (
              <FormItem>
                <FormLabel>Nilai</FormLabel>
                <FormControl>
                  {/* <Input type='number' placeholder="Nilai" {...field} /> */}
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