import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DialogDescription } from "@radix-ui/react-dialog";
import { QRCodeSVG } from "qrcode.react";
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";

export const DialogQr = ({
  id,
  open,
  onClose,
}: {
  id: string;
  open: boolean;
  onClose: () => void;
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({ contentRef });
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Print QR</DialogTitle>
        </DialogHeader>
        <DialogDescription />
        <div ref={contentRef} className="flex items-center justify-center">
          <div>
            <QRCodeSVG value={id} />
          </div>
        </div>
        <Button
          onClick={() => {
            reactToPrintFn();
          }}
          size={"sm"}
        >
          Print
        </Button>
      </DialogContent>
    </Dialog>
  );
};
