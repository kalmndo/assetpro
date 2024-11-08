"use client"

import { Layout } from "lucide-react"
import Link from "next/link"
import { Fragment } from "react"

const master = [
  {
    name: '',
    data: [
      {
        name: 'Semua Aset',
        logo: <Layout />,
        to: 'aset/semua',
        desc: 'semua aset',
      },
      {
        name: 'Semua Aset Per lokasi',
        logo: <Layout />,
        to: 'pengaturan/kode-anggaran',
        desc: 'setmua aset per lokasi',
      },
      {
        name: 'Aset tanah',
        logo: <Layout />,
        to: 'pengaturan/kode-anggaran',
        desc: 'aset tanah',
      },
    ]
  },
]

export default function Content({ }) {

  return (
    <div>        
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