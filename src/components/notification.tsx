"use client"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Bell } from "lucide-react"
import { ScrollArea } from "./ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import Link from "next/link"
import { type RouterOutputs } from "@/trpc/react"

function Item({
  item,
}: {
  item: RouterOutputs['user']['me']['notifications'][0]
}) {

  return (
    <Link href={item.link} className={`flex gap-4 items-center mb-4 ${item.isRead && 'opacity-50'}`}>
      <div>
        <Avatar className='h-12 w-12 rounded-sm'>
          <AvatarImage src={item.From.image ?? ''} alt='@shadcn' />
          <AvatarFallback>{item.From.name}</AvatarFallback>
        </Avatar>
      </div>
      <div className="grow">
        <div dangerouslySetInnerHTML={{ __html: item.desc }}></div>
      </div>
      <div>
        {!item.isRead && <div className="w-4 h-4 rounded-full bg-primary" />}
      </div>
    </Link>
  )
}

export default function Notification({
  notifications
}: {
  notifications: RouterOutputs['user']['me']['notifications']
}) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          size='icon'
          variant='ghost'
          className='rounded-full relative'
        >
          <Bell size={18} />
          <div className="absolute  text-xs bg-primary rounded-full px-[5px] text-white top-0 right-0">
            {notifications.length}
          </div>
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Notifikasi</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col h-[95%]">
          <Tabs className="mt-4" defaultValue="account">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="semua">Semua</TabsTrigger>
              <TabsTrigger value="belum">Belum dibaca</TabsTrigger>
              <TabsTrigger value="persetujuan">Persetujuan</TabsTrigger>
            </TabsList>
            <TabsContent value="semua">
              <ScrollArea className="grow my-4">
                {notifications.map((item) => (
                  <Item
                    key={item.id}
                    item={item}
                  />
                ))}
              </ScrollArea>
            </TabsContent>
            <TabsContent value="belum">

            </TabsContent>
            <TabsContent value="persetujuan">

            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  )
}