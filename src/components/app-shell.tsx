"use client"

import useIsCollapsed from "@/hooks/use-is-collapsed"
import { type ReactNode } from "react"
import Sidebar from "./sidebar"

interface Props {
  children: ReactNode
}

export default function AppShell({ children }: Props) {
  const [isCollapsed, setIsCollapsed] = useIsCollapsed()
  return (
    <div className='relative h-full overflow-hidden bg-background'>
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main
        id='content'
        className={`overflow-x-hidden pt-16 transition-[margin] md:overflow-y-hidden md:pt-0 ${isCollapsed ? 'md:ml-14' : 'md:ml-64'} h-full`}
      >
        {children}
      </main>
    </div>
  )
}
