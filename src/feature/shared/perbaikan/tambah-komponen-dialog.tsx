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
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CurrencyInput } from "@/components/currency-input";
import SearchSelect from "@/components/search-select";

const formSchema = z.object({
  "type": z.string().min(1).max(255),
  "name": z.string().min(1).max(255),
  "barangId": z.string().min(1).max(255),
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
}: {
  isPending: boolean,
  onSubmit(value: any): void,
}) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: '0',
      name: '',
      barangId: '',
      biaya: '',
      jumlah: ''
    },
  })

  const formType = form.watch('type');
  const setValue = form.setValue

  useEffect(() => {
    if (formType === '0') {
      setValue("barangId", '')
      setValue("name", '1')
      setValue("biaya", '1')
      setValue("jumlah", '1')
    } else if (formType === '1') {
      setValue("barangId", '1')
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
            <SearchSelect
              name="barangId"
              form={form}
              label="Pilih barang"
              placeholder="Pilih barang"
              data={[{ value: '1', label: '1' }]}
            />
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
}: {
  id: string,
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const { mutateAsync, isPending } = api.perbaikan.addComponent.useMutation()

  const onSubmit = async (v: z.infer<typeof formSchema>) => {
    try {
      console.log("v", v)
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
        <TheForm onSubmit={onSubmit} isPending={isPending} />
      </DialogContent>
    </Dialog>
  )
}