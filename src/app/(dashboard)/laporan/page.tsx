import Content from "./_components/content";

export default function Page() {
  return (
    <div>
      <div className="mb flex justify-between">
        <div className="">
          <h1 className='text-2xl font-bold tracking-tight'>
            Laporan
          </h1>
          <p className='text-muted-foreground'>
            Kelola  laporan
          </p>
        </div>
        <div className="">
          {/* <AddDialog data={modalData} /> */}
        </div>
      </div>
      <Content />
    </div>
  )
}
