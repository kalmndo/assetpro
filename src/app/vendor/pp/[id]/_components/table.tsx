'use client'
import { api, type RouterOutputs } from "@/trpc/react"
import { useEffect } from "react"
import { type PrimitiveAtom, atom, useAtom, useAtomValue, useSetAtom } from "jotai"
import { splitAtom } from "jotai/utils"
import {
  Table as TableOriginal,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getInitials } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { LoaderCircle } from "lucide-react"
import { CurrencyInput } from "@/components/currency-input"

const Cell = ({
  barangAtom,
  status
}: {
  barangAtom: PrimitiveAtom<{
    id: string;
    name: string;
    image: string | null;
    kode: string;
    qty: number;
    uom: string;
    harga: number | null;
    hargaString: string
    totalHarga: number | null;
  }>,
  status: boolean
}) => {
  const [barang, setBarang] = useAtom(barangAtom)

  return (
    <>
      <TableCell className="font-medium">
        <div className={`flex space-x-2 items-center`}>
          <Avatar className='rounded-sm w-12 h-12'>
            <AvatarImage src={barang.image ?? ''} alt="@shadcn" />
            <AvatarFallback>{getInitials(barang.name)}</AvatarFallback>
          </Avatar>
          <div className='block'>
            <p className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
              {barang.name}
            </p>
            <p className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
              {barang.kode}
            </p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className='flex space-x-4'>
          <span className={`max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem] `}>
            {barang.qty} {barang.uom}
          </span>
        </div>
      </TableCell>
      <TableCell className="w-[200px]">
        {status ? <div className='flex space-x-4'>
          <span className={`max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem] `}>
            Rp {barang.harga?.toLocaleString('id-ID')}
          </span>
        </div> :
          <CurrencyInput
            name="input-name"
            placeholder="Rp ..."
            onValueChange={(_value, _name, values) => {
              setBarang((v) => ({
                ...v,
                hargaString: values!.value,
                harga: values!.float,
                totalHarga: values!.float! * barang.qty
              }))
            }
            }
          />
        }
      </TableCell>
      <TableCell className="w-[300px] text-right">Rp {barang.totalHarga?.toLocaleString("id-Id")}</TableCell>
    </>
  )
}

const barangsAtom = atom([])

export default function Table({
  data
}: {
  data: RouterOutputs['vendor']['getPermintaanPenawaran']
}) {
  const setAnjing = useSetAtom(barangsAtom)

  useEffect(() => {
    // @ts-ignore
    setAnjing(data.barang)


  }, [data.barang, setAnjing])

  return <Anjing id={data.id} status={data.status} />
}

const barangsAtomAtom = splitAtom(barangsAtom)

function Anjing({ id, status }: { id: string, status: boolean }) {
  const router = useRouter()
  const [barangs] = useAtom(barangsAtomAtom)
  // @ts-ignore
  const barang = useAtomValue(barangsAtom)
  const { mutateAsync, isPending } = api.vendor.sendPermintaanPenawaran.useMutation()
  const onSubmit = async () => {
    try {
      const result = await mutateAsync({
        id,
        barang
      })
      toast.success(result.message)
      router.refresh()
    } catch (error) {
      // @ts-ignore
      toast.error(error.message)
    }
  }

  return (
    <div>
      <TableOriginal>
        <TableHeader>
          <TableRow>
            <TableHead className="">Barang</TableHead>
            <TableHead>Jumlah</TableHead>
            <TableHead>Harga Satuan</TableHead>
            <TableHead className="text-right">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {barangs.map((v: any, i: number) => (
            <TableRow key={i}>
              <Cell barangAtom={v} status={status} />
            </TableRow>
          ))}

        </TableBody>
      </TableOriginal>
      <div className="flex justify-end my-4">
        {!status && <Button disabled={isPending} onClick={onSubmit}>
          {isPending ?
            <LoaderCircle className="animate-spin" />
            :
            "Kirim Penawaran"
          }
        </Button>}
      </div>
    </div>
  )
}