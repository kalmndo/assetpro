"use client"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { ChevronRightIcon, X } from "lucide-react"
import Link from "next/link"
import { useState } from "react"


interface ItemProps {
  id: string
  name: string
  onMouseOver(e: any): void
  isActive: boolean
}

const KategoriItem = ({ id, name, onMouseOver, isActive }: ItemProps) => {
  return (
    <Button id={id} onMouseEnter={onMouseOver} variant="ghost" className={cn(isActive && "text-accent-foreground bg-accent", "justify-between mb-4")}>
      {name}
      <ChevronRightIcon className="h-4 w-4" />
    </Button>
  )
}

interface KategoriContentItemProps {
  name: string
  child?: {
    id: string
    name: string
  }[]
  handleClose(): void
}


const KategoriContentItem = ({ name, child, handleClose }: KategoriContentItemProps) => {

  return (
    <div className="block h-min w-[20%]">
      <p className="text-sm font-semibold mb-2">{name}</p>
      <div className="">
        {child?.map(({ id, name }) => (
          <Link key={id} href={`/cari?kategori=${id}`} onClick={() => handleClose()}>
            <p key={id} className="text-sm mb-2 text-slate-700">{name}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}

interface ItemsProps {
  id: string
  name: string
  child?: {
    id: string
    name: string
    child?: {
      id: string
      name: string
    }[]
  }[]
}

interface ContentProps {
  items: ItemsProps[]
  handleClose(): void
}

const Content = ({ items, handleClose }: ContentProps) => {
  const [show, setShow] = useState(items[0]?.id)
  const contents = items.find((v) => v.id === show)

  function onMouseOver(e: any) {
    setShow(e.target.id)
  }

  return (
    <div className="grid grid-cols-12 gap-4 h-lvh">
      <div className="col-span-3 border-r flex flex-col pr-4">
        {items.map(({ id, name }) => (
          <KategoriItem key={id} id={id} name={name} onMouseOver={onMouseOver} isActive={show === id} />
        ))}
      </div>
      <div className="col-span-9 flex flex-wrap content-start">
        {contents?.child?.map((v) => (
          <KategoriContentItem key={v.id} name={v.name} child={v.child} handleClose={handleClose} />
        ))}
      </div>
    </div>
  )
}

interface KategoriDialogProps {
  aset: ItemsProps[]
  persediaan: ItemsProps[]
  kategori: string | undefined
}

export default function KategoriDialog({ aset, persediaan, kategori }: KategoriDialogProps) {
  const [open, setOpen] = useState(false)

  const handleClose = () => {
    setOpen(false)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {kategori &&
        <Link href='/cari'>
          <Button size="sm" variant="outline" className="mr-4">
            {kategori}
            <X size={16} className="ml-2" />
          </Button>
        </Link>
      }
      <SheetTrigger asChild>
        <Button size="sm" variant="outline">Kategori</Button>
      </SheetTrigger>
      <SheetContent className="max-w-[85%] w-[85%] sm:max-w-[85%]">
        <SheetHeader>
          <SheetTitle>Pilih Kategori</SheetTitle>
          <SheetDescription>
            Make changes to your profile here. Click save when youre done.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-4">
          <Tabs defaultValue="account">
            <TabsList className="w-[400px]">
              <TabsTrigger value="aset" className="w-[400px]">Aset</TabsTrigger>
              <TabsTrigger value="persediaan" className="w-[400px]">Persedian</TabsTrigger>
            </TabsList>
            <TabsContent value="aset" className="">
              <Separator className="my-4" />
              <Content items={aset} handleClose={handleClose} />
            </TabsContent>
            <TabsContent value="persediaan">
              <Separator className="my-4" />
              <Content items={persediaan} handleClose={handleClose} />
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  )
}
