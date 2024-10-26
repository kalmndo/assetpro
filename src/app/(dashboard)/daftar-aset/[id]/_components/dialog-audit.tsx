"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { type RouterOutputs } from "@/trpc/react";

export const DialogAudit = ({
  data,
  open,
  onClose,
}: {
  data: RouterOutputs["daftarAset"]["get"]["audit"];
  open: boolean;
  onClose: () => void;
}) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Audit</DialogTitle>
        </DialogHeader>
        <div className="mx-auto w-full max-w-4xl ">
          <div className="relative pl-6 after:absolute after:inset-y-0 after:left-0 after:w-px after:bg-muted-foreground/20">
            <div className="grid gap-8">
              {data?.map((v) => (
                <div
                  className="relative grid gap-2 text-sm"
                  key={v.id}
                  dangerouslySetInnerHTML={{ __html: v.desc }}
                ></div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

