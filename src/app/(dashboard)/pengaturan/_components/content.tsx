"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Layout } from "lucide-react"
import Link from "next/link"
import { Fragment, useState } from "react"

const masterKategori = new Map<string, string>([
  ['all', 'All Apps'],
  ['connected', 'Connected'],
  ['notConnected', 'Not Connected'],
])

const master = [
  {
    name: 'Alur bisnis',
    data: [
      {
        name: 'Penomoran Otomatis',
        logo: <Layout />,
        to: 'pengaturan/penomoran-otomatis',
        desc: 'deskripsi',
      },
      {
        name: 'Kode Anggaran',
        logo: <Layout />,
        to: 'pengaturan/kode-anggaran',
        desc: 'deskripsi',
      },
    ]
  },
]

export default function Content({ }) {
  const [masterType, setMasterType] = useState("all")
  const [searchTerm, setSearchTerm] = useState('')
  return (
    <div>
      <div className='my-4 flex items-end justify-between sm:my-0 sm:items-center'>
        <div className='flex flex-col gap-4 sm:my-4 sm:flex-row'>
          <Input
            placeholder='Filter apps...'
            className='h-9 w-40 lg:w-[250px]'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Select value={masterType} onValueChange={setMasterType}>
          <SelectTrigger className='w-36'>
            <SelectValue>{masterKategori.get(masterType)}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Apps</SelectItem>
            <SelectItem value='connected'>Connected</SelectItem>
            <SelectItem value='notConnected'>Not Connected</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Separator className="mb-4" />
      {master.map((v, i) => (
        <Fragment key={i}>
          <h1 className='text-xl font-semibold tracking-tight'>
            {v.name}
          </h1>
          <ul className='no-scrollbar grid gap-4 overflow-y-scroll pb-8 pt-4 md:grid-cols-2 lg:grid-cols-4'>
            {v.data.map((app) => (
              <Link href={app.to} key={app.name}
              >
                <li
                  className='rounded-lg border p-4 hover:shadow-md'
                >
                  <div className='mb-8 flex items-center justify-between'>
                    <div
                      className={`flex size-10 items-center justify-center rounded-lg bg-muted p-2`}
                    >
                      {app.logo}
                    </div>
                  </div>
                  <div>
                    <h2 className='mb-1 font-semibold'>{app.name}</h2>
                    <p className='line-clamp-2 text-gray-500'>{app.desc}</p>
                  </div>
                </li>
              </Link>
            ))}
          </ul>
        </Fragment>
      ))}
    </div>

  )
}