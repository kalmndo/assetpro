import Content from "./_components/content";

export default function Page() {
  return (
    <div>
      <div className="mb flex justify-between">
        <div className="">
          <h1 className="text-2xl font-bold tracking-tight">
            Laporan semua aset perlokasi
          </h1>
          <p className="text-muted-foreground">
            Kelola laporan semua perlokasi
          </p>
        </div>
      </div>
      <Content />
    </div>
  );
}
