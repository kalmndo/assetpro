// 1. user
// 2. permintaan barang
//    persetujuan permintaan barang
//    barang tersedia
//    barang tidak tersedia
// 3. pengadaan
// 4. perbaikan
// 5. peminjaman

// kalau role user tidak ada tabs
// kalau ada role tabs nya tergantung role

export default function Page() {
  return (
    <div>
      <div className="flex justify-between">
        <div className="">
          <h1 className='text-2xl font-bold tracking-tight'>
            Welcome, Adam
          </h1>
          <p className='text-muted-foreground'>
            Here is what happened
          </p>
        </div>
      </div>
      <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0'>
        {/* <Table data={data} /> */}
      </div>
    </div>
  )
}