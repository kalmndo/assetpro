import Content from "./_components/content";

export default function Page() {
  return (
    <div>
      <div className="mb flex justify-between">
        <div className="">
          <h1 className='text-2xl font-bold tracking-tight'>
            Laporan Aset
          </h1>
          <p className='text-muted-foreground'>
            Kelola  laporan aset
          </p>
        </div>
      </div>
      <Content />
    </div>
  )
}
