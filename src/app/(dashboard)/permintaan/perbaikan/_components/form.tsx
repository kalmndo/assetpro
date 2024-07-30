import SearchSelect from "@/components/search-select"
import { Button } from "@/components/ui/button"
import { DialogFooter } from "@/components/ui/dialog"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Form as OriginalForm,
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { type RouterOutputs } from "@/trpc/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { LoaderCircle } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

const formSchema = z.object({
  "asetId": z.string().min(1).max(255),
  'keluhan': z.string().min(1)
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
      asetId: '',
      keluhan: ''
    },
  })

  return (
    <div className="relative">
      <OriginalForm {...form}>
        <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="">
          <div className="mt-2 mb-5">
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
          <div>
            <FormField
              control={form.control}
              name="keluhan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Keluhan</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Keluhan atau diagnosa"
                      className=""
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
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