import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button";
import { api, type RouterOutputs } from "@/trpc/react";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowDown, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function DialogApprove({
  open,
  id,
  barangs,
  onOpenChange
}: {
  open: boolean,
  id: string,
  barangs: RouterOutputs['permintaanBarang']['get']['barang'],
  onOpenChange(): void
}) {
  const { mutateAsync, isPending } = api.permintaanBarang.approve.useMutation()
  const router = useRouter()
  // @ts-ignore
  const perubahans = barangs.filter((v) => v.qtyUpdate !== undefined)
  const penolakans = barangs.filter((v) => v.status === 'to-reject')

  const onSubmit = async () => {
    try {
      const result = await mutateAsync({
        id,
        // @ts-ignore
        update: perubahans.map((v) => ({ id: v.id, qty: v.qtyUpdate, uomId: v.uomUpdate.id, catatan: v.catatan })),
        // @ts-ignore
        reject: penolakans.map((v) => ({ id: v.id, catatan: 'asdf' }))
      })

      toast.success(result.message)
      router.refresh()
    } catch (error: any) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      toast.error(error.message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent >
        <DialogHeader>
          <DialogTitle>Persetujuan Internal Memo</DialogTitle>
        </DialogHeader>
        <div>
          <p className="text-sm">Apakah anda yakin menyutujui permintaan ini?</p>
        </div>
        <div>

          {perubahans.length > 0 && <>
            <p className="text-sm font-semibold">Perubahan</p>
            <Separator className="my-1" />
          </>}
          {perubahans.map((v) => (
            <div key={v.id} className="py-1">
              <div className="flex justify-between">
                <div className="flex gap-4 items-center">
                  <Avatar className='rounded-sm w-12 h-12'>
                    <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  <div className='block text-sm'>
                    <p className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
                      Jazz
                    </p>
                    <p className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
                      1.2.3.4.5
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <p className="text-xs text-destructive">{v.jumlah} {v.uom.name}</p>
                  <ArrowDown className="text-slate-500" size={12} />
                  {/* @ts-ignore */}
                  <p className="text-xs text-green-600">{v.qtyUpdate} {v.uomUpdate.name}</p>
                </div>
              </div>
              <div className="my-1">
                <p className="text-xs font-semibold">Catatan</p>
                {/* @ts-ignore */}
                <p className="text-xs">{v.catatan}</p>
              </div>
            </div>
          ))}
        </div>
        <div>
          {penolakans.length > 0 && <>
            <p className="text-sm font-semibold">Penolakan</p>
            <Separator className="my-1" />
          </>}
          {penolakans.map((v) => (
            <div key={v.id} className="py-1">
              <div className="flex justify-between">
                <div className="flex gap-4 items-center">
                  <Avatar className='rounded-sm w-12 h-12'>
                    <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  <div className='block text-sm'>
                    <p className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
                      {v.name}
                    </p>
                    <p className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
                      {v.kode}
                    </p>
                  </div>
                </div>
              </div>
              <div className="my-1">
                <p className="text-xs font-semibold">Catatan</p>
                {/* @ts-ignore */}
                <p className="text-xs">{v.catatan}</p>
              </div>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button
            type="submit"
            size="sm"
            onClick={onSubmit}
            disabled={isPending}
          >
            {isPending ?
              <LoaderCircle className="animate-spin" />
              :
              "Yakin, Setuju"
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}