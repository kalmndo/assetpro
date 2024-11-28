"use client";

import { Layout } from "lucide-react";
import Link from "next/link";
import { Fragment } from "react";

// semua per bulan per tahun semua unit bisnis
// laporan stock barang - periode, unit bisnis
// laporan stock umum - periode, kategori, unit bisnis
// kartu permintaan stock
const master = [
  {
    name: "",
    data: [
      {
        name: "Semua stock",
        logo: <Layout />,
        to: "persediaan/semua",
        desc: "",
      },
      {
        name: "Stock barang",
        logo: <Layout />,
        to: "persediaan/barang",
        desc: "",
      },
      {
        name: "Stock umum",
        logo: <Layout />,
        to: "persediaan/umum",
        desc: "",
      },
      {
        name: "Kartu stock permintaan",
        logo: <Layout />,
        to: "persediaan/permintaan",
        desc: "",
      },
    ],
  },
];

export default function Content({}) {
  return (
    <div>
      {master.map((v, i) => (
        <Fragment key={i}>
          <h1 className="text-xl font-semibold tracking-tight">{v.name}</h1>
          <ul className="no-scrollbar grid gap-4 overflow-y-scroll pb-8 pt-4 md:grid-cols-2 lg:grid-cols-4">
            {v.data.map((app) => (
              <Link href={app.to} key={app.name}>
                <li className="rounded-lg border p-4 hover:shadow-md">
                  <div className="mb-8 flex items-center justify-between">
                    <div
                      className={`flex size-10 items-center justify-center rounded-lg bg-muted p-2`}
                    >
                      {app.logo}
                    </div>
                  </div>
                  <div>
                    <h2 className="mb-1 font-semibold">{app.name}</h2>
                    <p className="line-clamp-2 text-gray-500">{app.desc}</p>
                  </div>
                </li>
              </Link>
            ))}
          </ul>
        </Fragment>
      ))}
    </div>
  );
}
