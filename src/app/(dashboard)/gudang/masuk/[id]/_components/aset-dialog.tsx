import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { type Dispatch, type SetStateAction } from "react"
import { Printer } from "lucide-react"
import { Separator } from "@/components/ui/separator"

export function AsetDialog({
  data,
  open,
  onOpenChange
}: {
  data: string[],
  open: boolean,
  onOpenChange: Dispatch<SetStateAction<boolean>>
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>No Inventaris</DialogTitle>
          <DialogDescription>
            Berikut no inventaris dan barcode no inventaris
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => console.log("")}
          >
            <Printer className="h-4 w-4 mr-2" />
            Print semua
          </Button>
        </div>
        <Separator className="my-1" />
        {
          data.map((v, i) => {
            return (
              <div key={i} className="flex justify-between items-center">
                <div className="flex justify-between space-x-4">
                  <p>{i + 1}.</p>
                  <p>{v}</p>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => console.log("")}
                >
                  <Printer className="h-4 w-4" />
                </Button>
              </div>
            )
          })
        }


      </DialogContent>
    </Dialog>
  )
}
