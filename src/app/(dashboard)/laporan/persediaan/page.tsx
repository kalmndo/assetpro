import Content from "./_components/content";

export default function Page() {
  return (
    <div>
      <div className="mb flex justify-between">
        <div className="">
          <h1 className="text-2xl font-bold tracking-tight">
            Laporan Persediaan
          </h1>
          <p className="text-muted-foreground">Kelola laporan persediaan</p>
        </div>
      </div>
      <Content />
    </div>
  );
}
