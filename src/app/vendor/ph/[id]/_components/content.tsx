"use client"

import { Button } from "@/components/ui/button"
import { api, type RouterOutputs } from "@/trpc/react"
import { atom, useAtom, useAtomValue, useSetAtom } from "jotai"
import { splitAtom } from "jotai/utils"
import { useEffect } from "react"
import Items from "./items"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { LoaderCircle } from "lucide-react"

const barangsAtom = atom([])

export default function Content({
  data
}: {
  data: RouterOutputs['vendor']['getPenawaranHarga']
}) {
  const setAnjing = useSetAtom(barangsAtom)

  useEffect(() => {
    // @ts-ignore
    setAnjing(data.barang)


  }, [data.barang, setAnjing])

  return <TheContent id={data.id} status={data.status} />
}

const barangsAtomAtom = splitAtom(barangsAtom)

const TheContent = ({
  id,
  status
}: {
  id: string,
  status: boolean
}) => {
  const router = useRouter()
  const [barangs] = useAtom(barangsAtomAtom)
  // @ts-ignore
  const barang = useAtomValue(barangsAtom)
  const { mutateAsync, isPending } = api.vendor.sendPenawaranHarga.useMutation()

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
      {barangs.map((v: any, i) => (
        <Items key={i} barangAtom={v} status={status} />
      ))}
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