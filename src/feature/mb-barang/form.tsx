import SearchSelect from "@/components/search-select"
import { Button } from "@/components/ui/button"
import { DialogFooter } from "@/components/ui/dialog"
import {
  Form as OriginalForm,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { type SelectProps, } from "@/lib/type"
import { zodResolver } from "@hookform/resolvers/zod"
import { LoaderCircle } from "lucide-react"
import { useEffect, useRef } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

const formSchema = z.object({
  "name": z.string().min(1).max(255),
  "code": z.string().min(1).max(9999),
  "golonganId": z.string().min(1).max(255),
  "kategoriId": z.string().min(1).max(255),
  "subKategoriId": z.string().min(1).max(255),
  "subSubKategoriId": z.string().min(1).max(255),
})

interface Props {
  isEdit?: boolean
  onSubmit(values: z.infer<typeof formSchema>): Promise<void>
  isPending: boolean
  data: {
    golongans: SelectProps[]
    kategoris: SelectProps[]
    subKategoris: SelectProps[]
    subSubKategoris: SelectProps[]
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
      code: isEdit ? String(value.code) : '',
      golonganId: isEdit ? value.golonganId : '',
      kategoriId: isEdit ? value.kategoriId : '',
      subKategoriId: isEdit ? value.subKategoriId : '',
      subSubKategoriId: isEdit ? value.subSubKategoriId : '',
    },
  })
  const { golonganId, kategoriId, subKategoriId } = form.watch()
  const { setValue } = form

  const initialRender = useRef(true);

  useEffect(() => {
    if (!initialRender.current) {
      if (golonganId) {
        setValue('kategoriId', '')
      }

    } else {
      initialRender.current = false;
    }
  }, [golonganId, setValue])

  useEffect(() => {
    if (!initialRender.current) {
      if (kategoriId) {
        setValue('subKategoriId', '')
      }
    } else {
      initialRender.current = false;
    }
  }, [kategoriId, setValue])

  useEffect(() => {
    if (!initialRender.current) {
      if (subKategoriId) {
        setValue('subSubKategoriId', '')
      }
    } else {
      initialRender.current = false;
    }
  }, [subKategoriId, setValue])

  const kategoris = data.kategoris.filter((v) => v.golonganId === form.watch('golonganId'))
  const subKategoris = data.subKategoris.filter((v) => v.kategoriId === form.watch('kategoriId'))
  const subSubKategoris = data.subSubKategoris.filter((v) => v.subKategoriId === form.watch('subKategoriId'))

  return (
    <div className="relative">
      <OriginalForm {...form}>
        <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="space-y-2 ">
          <div className="mt-2">
            <SearchSelect
              data={data.golongans}
              form={form}
              label="Golongan"
              name="golonganId"
              placeholder="Pilih Golongan "
            />
          </div>
          <div className="mt-2">
            <SearchSelect
              data={kategoris as any}
              form={form}
              label="Kategori"
              name="kategoriId"
              placeholder="Pilih Kategori "
              disabled={!form.watch('golonganId')}
            />
          </div>
          <div className="mt-2">
            <SearchSelect
              data={subKategoris as any}
              form={form}
              label="Sub Kategori"
              name="subKategoriId"
              placeholder="Pilih Sub Kategori "
              disabled={!form.watch('kategoriId')}
            />
          </div>
          <div className="mt-2">
            <SearchSelect
              data={subSubKategoris as any}
              form={form}
              label="Sub Sub Kategori"
              name="subSubKategoriId"
              placeholder="Pilih Sub Sub Kategori "
              disabled={!form.watch('subKategoriId')}
            />
          </div>
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
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kode</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Kode" {...field} />
                </FormControl>
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