"use client"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { type ChangeEvent, useState, useEffect } from "react";

export default function DialogRejectBarang({
  open,
  name,
  onSubmit,
  onOpenChange
}: {
  open: boolean,
  name: string,
  onSubmit(): void,
  onOpenChange(): void
}) {
  const [value, setValue] = useState("")

  function onChange(e: ChangeEvent<HTMLInputElement>) {
    setValue(e.target.value)
  }

  useEffect(() => {
    setValue('')
  }, [onSubmit])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tolak Barang</DialogTitle>
          <DialogDescription>
            Apakah kamu yakin untuk menolak <span className="font-semibold text-black">{name}?</span>
            <br />
            Wajib isi catatan untuk menolak barang permintaan
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
            disabled={!value}
            type="submit"
            variant="destructive"
            onClick={onSubmit}
          >
            Tolak
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}