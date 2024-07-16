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
import { api, type RouterOutputs } from "@/trpc/react"
import { getInitials } from "@/lib/utils"

function Item({
  item,
  onClick
}: {
  item: RouterOutputs['user']['me']['notifications'][0],
  onClick(): void
}) {

  return (
    <Link onClick={onClick} href={item.link} className={`flex gap-4 items-center mb-4 ${item.isRead && 'opacity-50'}`}>
      <div>
        <Avatar className='h-12 w-12 rounded-sm'>
          <AvatarImage src={item.From.image ?? ''} alt='@shadcn' />
          <AvatarFallback>{getInitials(item.From.name)}</AvatarFallback>
        </Avatar>
      </div>
      <div className="flex" dangerouslySetInnerHTML={{ __html: item.desc }}></div>
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
  const [notifs, setNotifs] = useState(notifications)
  const [open, setOpen] = useState(false)
  const { mutateAsync } = api.notification.clickNotification.useMutation()

  const onLinkClicked = (item: RouterOutputs['user']['me']['notifications'][0]) => async () => {
    setOpen(false)
    setNotifs((prev) => {
      return prev.map((v) => {
        if (v.id === item.id) {
          return {
            ...v,
            isRead: true
          }
        }
        return v
      })
    })
    await mutateAsync({ id: item.id })
  }

  const notifsLength = notifs.filter((v) => v.isRead === false).length

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
            {notifsLength}
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
                {notifs.map((item) => (
                  <Item
                    key={item.id}
                    item={item}
                    onClick={onLinkClicked(item)}
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