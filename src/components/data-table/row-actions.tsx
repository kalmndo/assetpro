import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { Button } from '@/components/custom/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { type ReactNode } from 'react'

interface DataTableRowActionsProps {
  children: ReactNode,
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | null | undefined
}

export function DataTableRowActions({
  children,
  variant = 'ghost'
}: DataTableRowActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          className='flex h-8 w-8 p-0 data-[state=open]:bg-muted'
        >
          <DotsHorizontalIcon className='h-4 w-4' />
          <span className='sr-only'>Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-[160px]'>
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
