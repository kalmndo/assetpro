"use client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Form as OriginalForm, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { api } from "@/trpc/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Info, LoaderCircle, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

const formSchema = z.object({
  umur: z.string().refine((value) => {
    const numberValue = Number(value);
    return !isNaN(numberValue) && numberValue >= 1;
  }, {
    message: "Umur harus lebih besar atau sama dengan 1", // Custom error message
  }),
});

interface Props {
  onSubmit(values: z.infer<typeof formSchema>): Promise<void>,
  isPending: boolean
}

const Form = ({
  onSubmit,
  isPending
}: Props) => {

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      umur: '0'
    },
  })


  return (
    <div className="relative">
      <OriginalForm {...form}>
        <form noValidate onSubmit={form.handleSubmit(onSubmit)} className=" space-y-2">
          <FormField
            control={form.control}
            name="umur"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Umur Ekonomis</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Umur Ekonomis" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <DialogFooter className="mt-4">
            <Button disabled={!form.formState.isDirty || !form.formState.isValid || isPending} type="submit">
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


export const DialogPenyusutan = ({ id, open, onClose }: { id: string, open: boolean, onClose: () => void }) => {
  const router = useRouter()
  const { mutateAsync, isPending } = api.daftarAset.updatePenyusutan.useMutation()

  async function onSubmit(values: z.infer<typeof formSchema>) {

    try {
      const result = await mutateAsync({ id, ...values })
      onClose()
      toast.success(result.message)
      router.refresh()
    } catch (error: any) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      toast.error(error.message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ubah Umur ekonomis</DialogTitle>
        </DialogHeader>
        <Form
          isPending={isPending}
          onSubmit={onSubmit}
        />
      </DialogContent>
    </Dialog>
  )
}