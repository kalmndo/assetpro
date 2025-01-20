"use client"
import {
  Dialog,
  DialogContent,
  DialogDescription,
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

const formSchema = z.object({
  "catatan": z.string().min(1).max(255),
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
      catatan: ''
    },
  })

  return (
    <Form {...form}>
      <form noValidate onSubmit={form.handleSubmit(onSubmit)} >
        <div className="space-y-2">
          <FormField
            control={form.control}
            name="catatan"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Catatan</FormLabel>
                <FormControl>
                  <Input placeholder="Catatan" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <DialogFooter className="mt-4">
          <Button
            type="submit"
            variant="destructive"
            disabled={!form.formState.isDirty || !form.formState.isValid || isPending}
          >
            Tolak
          </Button>
        </DialogFooter>
      </form>
    </Form>
  )
}

export default function RejectDialog({
  id,
}: {
  id: string,
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const { mutateAsync, isPending } = api.perbaikanEksternal.reject.useMutation()

  const onSubmit = async (v: z.infer<typeof formSchema>) => {
    try {
      const result = await mutateAsync({ id, catatan: v.catatan })
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
        <Button size="lg" variant={'destructive'}>Tolak</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tolak permintaan</DialogTitle>
          <DialogDescription>
            Apakah kamu yakin untuk menolak permintaan ini?
            <br />
            Wajib isi catatan untuk menolak barang permintaan
          </DialogDescription>
        </DialogHeader>
        <TheForm onSubmit={onSubmit} isPending={isPending} />
      </DialogContent>
    </Dialog>
  )
}