import SearchSelect from "@/components/search-select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DialogFooter } from "@/components/ui/dialog"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  Form as OriginalForm,
} from "@/components/ui/form"
import { getInitials } from "@/lib/utils"
import { type RouterOutputs } from "@/trpc/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { LoaderCircle } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

const formSchema = z.object({
  "poId": z.string().min(1).max(255),
  "items": z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "Wajib pilih minimal 1 barang.",
  }),
})

interface Props {
  isEdit?: boolean
  onSubmit(values: z.infer<typeof formSchema>): Promise<void>
  isPending: boolean
  data: RouterOutputs['barangMasuk']['findByPo'] | undefined,
  value?: any,
}

export const Form = ({
  value,
  data,
  isEdit = false,
  onSubmit,
  isPending
}: Props) => {

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      poId: '',
      items: []
    },
  })

  const barangs = data?.find((v) => v.id === form.watch('poId'))?.barang

  return (
    <div className="relative">
      <OriginalForm {...form}>
        <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="">
          <div className="mt-2 mb-5">
            <SearchSelect
              data={data ? data.map((v) => ({
                label: v.no,
                value: v.id
              })) : []}
              form={form}
              label="Nomor PO"
              name="poId"
              placeholder="Pilih Berdasarkan PO"
            />
          </div>
          {
            <FormField
              control={form.control}
              name="items"
              render={() => (
                <FormItem>
                  {barangs?.map((item) => (
                    <FormField
                      key={item.id}
                      control={form.control}
                      name="items"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={item.id}
                            className="flex flex-row items-center justify-between space-x-3 space-y-0"
                          >
                            <div
                              className="flex flex-row items-center space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(item.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, item.id])
                                      : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== item.id
                                        )
                                      )
                                  }}
                                />
                              </FormControl>
                              <div className='flex space-x-2 items-center'>
                                <Avatar className='rounded-sm w-12 h-12'>
                                  {/* @ts-ignore */}
                                  <AvatarImage src={item.image} alt="@shadcn" />
                                  <AvatarFallback>{getInitials(item.name)}</AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                  <span className='truncate font-medium text-sm'>
                                    {item.name}
                                  </span>
                                  <span className='truncate text-sm'>
                                    {item.code}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex ">
                              <p className="text-sm font-medium">
                                {item.qty} {item.uom}
                              </p>
                            </div>
                          </FormItem>
                        )
                      }}
                    />
                  ))}
                </FormItem>
              )}
            />
          }
          <DialogFooter className="mt-4">
            {
              form.watch("poId") && <Button disabled={isPending || form.watch('items').length === 0} type="submit">
                {isPending ?
                  <LoaderCircle className="animate-spin" />
                  : 'Submit'
                }
              </Button>
            }
          </DialogFooter>
        </form>
      </OriginalForm>
    </div>
  )
}