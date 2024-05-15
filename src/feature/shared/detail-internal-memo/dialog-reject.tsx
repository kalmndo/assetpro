"use client"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LoaderCircle } from "lucide-react"
import { useState } from "react"

interface Props {
  open: boolean
  onOpenChange(open: boolean): void
}

export const DialogReject = (
  {
    open,
    onOpenChange,
  }: Props
) => {
  const [value, setValue] = useState("")

  const onChange = (e: any) => {
    setValue(e.target.value)
  }

  const isPending = false

  const onSubmit = () => {
    console.log("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Apakah kamu yakin?</DialogTitle>
          <DialogDescription>
            Aksi ini tidak dapat dibatalkan. Apakah kamu yakin ingin menolak Internal Memo ini?
          </DialogDescription>
        </DialogHeader>
        <div className=" py-4">
          <Label htmlFor="catatan" className="text-right">
            Catatan
          </Label>
          <Input
            id="catatan"
            value={value}
            placeholder="Catatan"
            className="col-span-3"
            onChange={onChange}
          />
        </div>
        <DialogFooter>
          <Button
            variant='destructive'
            disabled={isPending} onClick={onSubmit}>{isPending ? <LoaderCircle className="animate-spin" /> : 'Yakin'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}