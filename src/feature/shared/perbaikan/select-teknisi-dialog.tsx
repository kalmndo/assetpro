"use client"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import SearchSelect from "@/components/search-select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { SelectProps } from "@/lib/type";

const formSchema = z.object({
  "teknisiId": z.string().min(1).max(255),
})

const TheForm = ({
  onSubmit,
  isPending,
  teknisis
}: {
  onSubmit(value: any): void,
  isPending: boolean,
  teknisis: SelectProps[]
}) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      teknisiId: ''
    },
  })

  return (
    <DialogContent >
      <DialogHeader>
        <DialogTitle>Pilih Teknisi</DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <SearchSelect
            data={teknisis}
            form={form}
            label="Pilih Teknisi"
            name="teknisiId"
            placeholder="Pilih Teknisi"
          />

          <DialogFooter>
            <Button
              type="submit"
              size="sm"
              disabled={isPending}
            >
              {isPending ?
                <LoaderCircle className="animate-spin" />
                :
                "Yakin, Setuju"
              }
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  )
}

export default function SelectTeknisiDialog({
  id,
  teknisis
}: {
  id: string,
  teknisis: SelectProps[]
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const { mutateAsync, isPending } = api.perbaikan.selectTeknisi.useMutation()



  async function onSubmit(value: any) {
    try {
      const result = await mutateAsync({ id, teknisiId: value.teknisiId })
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
        <Button size="lg">Pilih Teknisi</Button>
      </DialogTrigger>

      <TheForm teknisis={teknisis} onSubmit={onSubmit} isPending={isPending} />

    </Dialog>
  )
}