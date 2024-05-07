import Content from "@/feature/master/content";

export default function Page() {
  return (
    <div>
      <div className="mb flex justify-between">
        <div className="">
          <h1 className='text-2xl font-bold tracking-tight'>
            Master
          </h1>
          <p className='text-muted-foreground'>
            Kelola master data
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
