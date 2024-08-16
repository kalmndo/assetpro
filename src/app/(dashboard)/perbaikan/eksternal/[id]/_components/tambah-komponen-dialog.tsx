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
import { useState } from "react";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { CurrencyInput } from "@/components/currency-input";

const formSchema = z.object({
  "name": z.string().min(1).max(255),
  "biaya": z.string().min(1).max(255),
  "jumlah": z.string().min(1).max(255),
})

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
      name: '',
      biaya: '',
      jumlah: ''
    },
  })

  return (
    <Form {...form}>
      <form noValidate onSubmit={form.handleSubmit(onSubmit)} >
        <div className="space-y-2">
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
            render={({ }) => (
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
  const { mutateAsync, isPending } = api.perbaikanEksternal.addComponent.useMutation()

  const onSubmit = async (v: z.infer<typeof formSchema>) => {
    try {
      const result = await mutateAsync({ id: id, ...v })
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