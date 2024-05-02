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
import { Input } from "@/components/ui/input"
import { LoaderCircle, Plus } from "lucide-react"
import * as z from "zod"
import { useForm } from "react-hook-form"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { api } from "@/trpc/react"
import { useState } from "react"
import SearchSelect from "@/components/search-select"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { revalidatePath } from 'next/cache'

const formSchema = z.object({
  "name": z.string().min(1).max(255),
  "email": z.string().min(1).max(9999),
  "department": z.string().min(1).max(255),
  "title": z.string().min(1).max(255),
  "atasan": z.string(),
  "role": z.array(z.string())
})

type Items = {
  id?: string,
  label?: string,
  separator?: boolean
}

const items: Items[] = [
  {
    id: "admin",
    label: "Admin",
  },
  {
    separator: true
  },
  {
    id: "internal-memo",
    label: "Internal Memo",
  },
  {
    id: "applications",
    label: "Applications",
  },
  {
    id: "desktop",
    label: "Desktop",
  },
  {
    id: "downloads",
    label: "Downloads",
  },
  {
    id: "documents",
    label: "Documents",
  },
] as const

type SelectProps = {
  label: string
  value: string
}

type Props = {
  data: {
    departments: SelectProps[],
    atasans: SelectProps[]
  }
}

export function AddModal({ data }: Props) {
  const router = useRouter()
  const { mutateAsync, isPending } = api.user.create.useMutation()
  const [open, setOpen] = useState(false)
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      department: "",
      title: "",
      atasan: "",
      role: []
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await mutateAsync(values)
      setOpen(false)
      toast.success('Berhasil membuat user')
      router.refresh()
      form.reset()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      toast.error(error.message)
    }
  }

  function handleOpen() {
    setOpen(true)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen} >
      <DialogTrigger asChild onClick={handleOpen}>
        <Button size="sm">
          <Plus size={18} className="mr-1" />
          Tambah
        </Button>
      </DialogTrigger>
      <DialogContent className="overflow-y-scroll max-h-[80vh]">
        <DialogHeader>
          <DialogTitle
          >
            Tambah User
          </DialogTitle>
        </DialogHeader>
        <div className="relative">
          <Form {...form}>
            <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="space-y-2 ">
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
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="mt-2">
                <SearchSelect
                  data={data.departments}
                  form={form}
                  label="Department"
                  name="department"
                  placeholder="Pilih Department "
                />
              </div>
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jabatan</FormLabel>
                    <FormControl>
                      <Input placeholder="Jabatan" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="space-y-2">
                <SearchSelect
                  data={data.atasans}
                  form={form}
                  label="Atasan"
                  name="atasan"
                  placeholder="Pilih Atasan"
                />
              </div>
              <FormField
                control={form.control}
                name="role"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="">Role</FormLabel>
                      <FormDescription>
                        Pilih role untuk user ini.
                      </FormDescription>
                    </div>
                    {items.map((item, i) => {
                      if (item.id !== undefined) {
                        return (
                          <FormField
                            key={item.id}
                            control={form.control}
                            name="role"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={item.id}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                      // @ts-expect-error
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
                                  <FormLabel className="text-sm font-normal">
                                    {item.label}
                                  </FormLabel>
                                </FormItem>
                              )
                            }}
                          />
                        )
                      }
                      return <Separator key={i} className="my-2" />
                    })}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button disabled={isPending} type="submit">
                  {isPending ?
                    <LoaderCircle className="animate-spin" />
                    :
                    "Tambah"
                  }
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
