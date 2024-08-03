"use client"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { z } from "zod";
import { useEffect, useState } from "react";
import { api, RouterOutputs } from "@/trpc/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CurrencyInput } from "@/components/currency-input";
import SearchSelect from "@/components/search-select";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

const formSchema = z.object({
  "type": z.string().min(1).max(255),
  "name": z.string().min(1).max(255),
  "imId": z.string().min(1).max(255),
  "items": z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "Wajib pilih minimal 1 barang.",
  }),
  "biaya": z.string().min(1).max(255),
  "jumlah": z.string().min(1).max(255),
})
// barang
// pilih barang yang menuju ke im ini

// bukan barang
// nama
// biaya

const TheForm = ({
  isPending,
  onSubmit,
  imComponents
}: {
  isPending: boolean,
  onSubmit(value: any): void,
  imComponents: RouterOutputs['perbaikan']['getImConponents']
}) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: '0',
      name: '',
      imId: '',
      items: [],
      biaya: '',
      jumlah: ''
    },
  })

  const formType = form.watch('type');
  const setValue = form.setValue

  useEffect(() => {
    if (formType === '0') {
      setValue("imId", '')
      setValue("items", [])
      setValue("name", '1')
      setValue("biaya", '1')
      setValue("jumlah", '1')
    } else if (formType === '1') {
      setValue("imId", '1')
      setValue("items", ['1'])
      setValue("name", '')
      setValue("biaya", '')
      setValue("jumlah", '')
    }
  }, [formType, setValue])

  return (
    <Form {...form}>
      <form noValidate onSubmit={form.handleSubmit(onSubmit)} >
        <div className="space-y-2">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih tipe" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="0">Barang</SelectItem>
                    <SelectItem value="1">Bukan barang</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          {form.watch("type") === '0' ?
            <>
              <SearchSelect
                name="imId"
                form={form}
                label="Pilih Internal Memo"
                placeholder="Pilih Internal Memo"
                data={imComponents?.map((v) => ({ label: v.no, value: v.imId }))}
              />
              {
                form.watch("imId") ?
                  imComponents.find((v) => v.imId === form.watch("imId"))?.barang.length! > 0 ?
                    <FormField
                      control={form.control}
                      name="items"
                      render={() => (
                        <FormItem>
                          {imComponents.find((v) => v.imId === form.watch('imId'))?.barang.map((item) => (
                            <FormField
                              key={item.id}
                              control={form.control}
                              name="items"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={item.id}
                                    className="flex flex-row items-center justify-between space-x-3 space-y-0 mt-4"
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
                          ))
                          }
                        </FormItem>
                      )}
                    />
                    :
                    <div className="flex justify-center">
                      <p className="my-4">Tidak ada barang</p>
                    </div>
                  : <div></div>
              }
            </>
            :
            <>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama</FormLabel>
                    <FormControl>
                      <Input placeholder="Nama" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="jumlah"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jumlah</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Jumlah" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="biaya"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Biaya</FormLabel>
                    <FormControl>
                      <CurrencyInput
                        // {...field}
                        placeholder="Rp ..."
                        onValueChange={(_v, _n, value) => {
                          form.setValue("biaya", value!.value)
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          }
        </div>
        <DialogFooter className="mt-4">
          <Button
            type="submit"
            disabled={isPending}
          >
            Tambah
          </Button>
        </DialogFooter>
      </form>
    </Form>
  )
}

export default function TambahKomponenDialog({
  id,
  imComponents
}: {
  id: string,
  imComponents: RouterOutputs['perbaikan']['getImConponents']
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const { mutateAsync, isPending } = api.perbaikan.addComponent.useMutation()

  const onSubmit = async (v: z.infer<typeof formSchema>) => {
    try {
      const result = await mutateAsync({ perbaikanId: id, ...v })
      toast.success(result.message)
      router.refresh()
      setOpen(false)
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant={'secondary'}>
          <Plus size={14} className="mr-2" />
          Tambah komponen
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tambah komponen</DialogTitle>
        </DialogHeader>
        <TheForm onSubmit={onSubmit} isPending={isPending} imComponents={imComponents} />
      </DialogContent>
    </Dialog>
  )
}