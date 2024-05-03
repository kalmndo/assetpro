import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { LoaderCircle } from "lucide-react"

interface Props {
  open: boolean
  onOpenChange(open: boolean): void
  name: string
  dataName: string,
  onSubmit(): void,
  isPending: boolean
}

export const DeleteModal = (
  {
    open,
    onOpenChange,
    name,
    dataName,
    onSubmit,
    isPending
  }: Props
) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Apakah kamu yakin?</AlertDialogTitle>
          <AlertDialogDescription>
            Aksi ini tidak dapat dibatalkan. Aksi ini akan menghapus data <b className="text-black">{`(${dataName})`}</b> <b className="text-black">{name}</b> dari server
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel >Batal</AlertDialogCancel>
          <AlertDialogAction disabled={isPending} onClick={onSubmit}>{isPending ? <LoaderCircle className="animate-spin" /> : 'Yakin'}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}