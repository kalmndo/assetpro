'use client'

import PDF from "@/app/(dashboard)/pengadaan/purchase-order/[id]/_components/pdf";
import { Button } from "@/components/ui/button";
import { usePDF } from "@react-pdf/renderer";
import { Printer, Save } from "lucide-react";
import Link from "next/link";
import printJS from 'print-js'


export default function Print({data}: {data:any}) {
  const [instance, updateInstance] = usePDF({ document: <PDF data={data} /> });

  if (instance.loading) return (
    <div className="flex items-center gap-4">
      <Button variant={'ghost'} >
        <Printer size={20} />
      </Button>
      <Button variant={'ghost'} asChild>
        <Link href={''} download={"lala.pdf"}>
          <Save size={20} />
        </Link>
      </Button>
    </div>
  )

  if (instance.error) return <div>Something went wrong: {instance.error}</div>;
  const onPrint = () => {
    const blobURL = URL.createObjectURL(instance.blob!);
    printJS(blobURL)
  }
  return (
    <div className="flex items-center gap-4">
      <Button variant={'ghost'} onClick={onPrint}>
        <Printer size={20} />
      </Button>
      <Button variant={'ghost'} asChild>
        <Link href={instance.url!} download={"lala.pdf"}>
          <Save size={20} />
        </Link>
      </Button>
    </div>

  )
}