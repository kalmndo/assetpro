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
import { api, RouterOutputs } from "@/trpc/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Info, LoaderCircle, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

export const DialogAudit = ({ data, open, onClose }: { data: RouterOutputs['daftarAset']['get']['audit'], open: boolean, onClose: () => void }) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Audit</DialogTitle>
        </DialogHeader>
        <div className="w-full max-w-4xl mx-auto ">
          <div className="relative pl-6 after:absolute after:inset-y-0 after:left-0 after:w-px after:bg-muted-foreground/20">
            <div className="grid gap-8">
              {data?.map((v) => (
                <div className="grid gap-2 text-sm relative" key={v.id} dangerouslySetInnerHTML={{ __html: v.desc }}></div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}