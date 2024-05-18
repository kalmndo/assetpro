import SearchSelect from "@/components/search-select"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DialogFooter } from "@/components/ui/dialog"
import {
  Form as OriginalForm,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import UploadAvatar from "@/components/upload-avatar"
import { type SelectProps } from "@/lib/type"
import { zodResolver } from "@hookform/resolvers/zod"
import { LoaderCircle } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

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
    id: "im-view",
    label: "Internal Memo (view)",
  },
  {
    id: "im-approve",
    label: "Internal Memo (approve)",
  },
  {
    separator: true
  },
] as const

const formSchema = z.object({
  "name": z.string().min(1).max(255),
  "image": z.string().nullable(),
  "email": z.string().min(1).max(9999),
  "department": z.string().min(1).max(255),
  "departmentUnitId": z.string().nullable(),
  "title": z.string().min(1).max(255),
  "atasan": z.string().nullable(),
  "role": z.array(z.string())
})


interface Props {
  isEdit?: boolean
  onSubmit(values: z.infer<typeof formSchema>): Promise<void>
  isPending: boolean
  data: {
    departments: SelectProps[],
    departmentUnits: SelectProps[],
    atasans: SelectProps[]
  },
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
      name: isEdit ? value.name : '',
      image: isEdit ? value.image : '',
      email: isEdit ? value.email : '',
      department: isEdit ? value.departmentId : '',
      departmentUnitId: isEdit ? value.departmentUnitId : '',
      title: isEdit ? value.title : '',
      atasan: isEdit ? value.atasanId : '',
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      role: isEdit ? value.UserRole?.map((v: any) => v.roleId) : []
    },
  })

  const departmentUnits = data.departmentUnits.filter((v) => v.departmentId === form.watch("department"))

  return (
    <div className="relative">
      <OriginalForm {...form}>
        <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="space-y-2 ">
          <UploadAvatar
            defaultImage={form.getValues('image') ?? ''}
            size="small"
            onChange={(v) => {
              form.setValue('image', `https://assetprodj.s3.ap-southeast-1.amazonaws.com/${v}`)
            }}
          />
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
          <div className="mt-2">
            <SearchSelect
              data={departmentUnits}
              form={form}
              label="Department Unit"
              name="departmentUnitId"
              placeholder="Pilih Department Unit"
              disabled={!form.watch('department')}
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
                              className="flex flex-row items-center space-x-3 space-y-0"
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