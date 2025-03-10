"use client"
import { type ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/data-table/column-header'

import { z } from 'zod'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Fragment } from 'react'
import { getInitials } from '@/lib/utils'

export const userSchema = z.object({
  name: z.string(),
  image: z.string(),
  email: z.string(),
  title: z.string(),
  organisasi: z.string(),
  department: z.string(),
  unit: z.string(),
  role: z.array(z.string()),
})

export type User = z.infer<typeof userSchema>

const HoverRole = ({ role }: { role: string[] }) => {
  return (
    <HoverCard openDelay={100}>
      <HoverCardTrigger>
        <Badge variant="secondary" className='relative'>
          {role[0]}
          {role.length > 1 && <div className='absolute -top-2 -right-4 ml-2 rounded-full bg-black px-1 text-[0.625rem] text-primary-foreground'>
            + {role.length - 1}
          </div>}
        </Badge>
      </HoverCardTrigger>
      <HoverCardContent isNaked >
        <ScrollArea className="h-72 w-48 rounded-md border">
          <div className="p-4">
            <h4 className="mb-4 text-sm font-medium leading-none">Role</h4>
            {role.map((v) => (
              <Fragment key={v}>
                <div className="text-sm">
                  {v}
                </div>
                <Separator className="my-2" />
              </Fragment>
            ))}
          </div>
        </ScrollArea>
      </HoverCardContent >
    </HoverCard>
  )
}

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Nama' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex space-x-2 items-center'>
          <Avatar>
            <AvatarImage src={row.original.image} alt="@shadcn" />
            <AvatarFallback>{getInitials(row.original.name)}</AvatarFallback>
          </Avatar>
          <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
            {row.getValue('name')}
          </span>
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Email' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex space-x-2'>
          <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
            {row.getValue('email')}
          </span>
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'title',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Jabatan' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex space-x-2'>
          <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
            {row.getValue('title')}
          </span>
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'organisasi',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Organisasi' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex space-x-2'>
          <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
            {row.getValue('organisasi')}
          </span>
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'department',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Department' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex space-x-2'>
          <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
            {row.getValue('department')}
          </span>
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'unit',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Unit' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex space-x-2'>
          <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
            {row.getValue('unit')}
          </span>
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'role',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Role' />
    ),

    cell: ({ row }) => {

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      const role = row.getValue('role') as string[]

      if (role.length > 0) {
        return (
          <HoverRole role={role} />
        )
      }

      return (
        <Badge variant="secondary" className='relative'>
          User
        </Badge>
      )
    },
    enableSorting: false,
    enableHiding: false,
  },
]
