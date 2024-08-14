type BarangGroupResultType = {
  barangId: string;
  qty: number;
  permintaanBarang: string[];
  golongan: number;
  createdAt: Date;
  updatedAt: Date;
}[];

type CheckKetersediaanByBarangResult = {
  id: string;
  image: string;
  name: string;
  kode: string;
  permintaan: number;
  uom: string;
  tersedia: number;
  golongan: string;
  permintaanBarang: PermintaanBarangResult[];
  imQty: string;
  qty: string;
  permintaanBarangId: string[];
};

type PermintaanBarangResult = {
  id: string;
  name: string;
  im: string;
  href: string;
  qty: string;
  permintaan: number;
  qtyOrder: string;
  beli: number;
  status: string;
  toTransfer: number
  noInventaris: string[]
  pemohonId: string
};


export default async function checkKetersediaanByBarang(ctx: any, barangGroupResult: BarangGroupResultType) {
  const barangIds = barangGroupResult.map((v) => v.barangId)
  const permintaanBarangIds = barangGroupResult.flatMap((v) => v.permintaanBarang)

  const permintaanBarangResult = await fetchPermintaanBarang(ctx, permintaanBarangIds);


  const mergeBarangGroupResult = barangGroupResult.map((v) => {
    // && a.status === STATUS.IM_APPROVE.name
    // TODO: intinya filter status by approve or progress entah lah
    return {
      ...v,
      permintaanBarang: permintaanBarangResult.filter((a: any) => a.barangId === v.barangId)
    }
  })

  const [groupGolonganAset, groupGolonganPersediaan] = partitionByGolongan(
    mergeBarangGroupResult
  );

  const [daftarAsetGroup, kartuStok] = await Promise.all([
    fetchKetersediaan(ctx, 'daftarAsetGroup', barangIds),
    fetchKetersediaan(ctx, 'kartuStok', barangIds)
  ]);

  const tersedia = [
    // @ts-ignore
    ...mapBarangTersedia(daftarAsetGroup, groupGolonganAset, "idle"),
    // @ts-ignore
    ...mapBarangTersedia(kartuStok, groupGolonganPersediaan, "qty"),
  ];

  const takTersedia = [
    // @ts-ignore
    ...mapBarangTakTersedia(daftarAsetGroup, groupGolonganAset, "idle"),
    // @ts-ignore
    ...mapBarangTakTersedia(kartuStok, groupGolonganPersediaan, "qty"),
  ];

  return {
    tersedia,
    takTersedia,
  };
}

function fetchPermintaanBarang(ctx: any, permintaanBarangIds: string[]) {
  return ctx.permintaanBarangBarang.findMany({
    where: {
      id: { in: permintaanBarangIds },
    },
    include: {
      Permintaan: {
        include: {
          Pemohon: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

function partitionByGolongan(mergeBarangGroupResult: BarangGroupResultType) {
  const filterGolongan = (golongan: number) =>
    mergeBarangGroupResult.filter((v) => v.golongan === golongan);

  return [filterGolongan(1), filterGolongan(2)];
}

function fetchKetersediaan(ctx: any, model: string, ids: string[]) {
  // @ts-ignore
  return ctx[model].findMany({
    where: { id: { in: ids } },
    include: {
      MasterBarang: {
        include: {
          Uom: true,
          DaftarAset: true,
        },
      },
    },
  });
}

function mapBarang(
  barang: any[],
  golonganData: any[],
  qtyField: string
): any[] {
  return barang.map((v) => {
    const permintaan = golonganData.find((a) => a.barangId === v.id);
    const permintaanBarang = permintaan.permintaanBarang.map((item: any) =>
      mapPermintaanBarang(item, v.MasterBarang)
    );

    return {
      id: permintaan.barangId,
      image: v.MasterBarang.image,
      name: v.MasterBarang.name,
      kode: v.MasterBarang.fullCode,
      permintaan: permintaan.qty,
      uom: v.MasterBarang.Uom.name,
      tersedia: calculateTersedia(v, qtyField),
      ordered: permintaan.ordered,
      golongan: getGolonganLabel(permintaan.golongan),
      permintaanBarang,
      permintaanBarangId: permintaanBarang.map((v: any) => v.id),
      imQty: permintaan.permintaanBarang.length,
      noInventaris: v.MasterBarang?.DaftarAset.map((v: any) => v.id),
    };
  });
}

function mapPermintaanBarang(item: any, masterBarang: any) {
  return {
    id: item.id,
    pemohonId: item.Permintaan.Pemohon.id,
    name: item.Permintaan.Pemohon.name,
    im: item.Permintaan.no,
    href: item.Permintaan.id,
    barangId: masterBarang.id,
    qty: `${item.qty} ${masterBarang.Uom.name}`,
    permintaan: item.qty,
    qtyOrdered: item.qtyOrdered,
    qtyOut: item.qtyOut,
    imStatus: item.Permintaan.status,
    status: item.status,
    createdAt: item.createdAt,
  };
}

function calculateTersedia(v: any, qtyField: string) {
  return qtyField === "idle" ? v[qtyField] - v.booked : v[qtyField];
}

function getGolonganLabel(golongan: number) {
  return golongan === 1 ? "Aset" : "Persediaan";
}

function mapBarangTersedia(
  barang: any[],
  golonganData: any[],
  qtyField: string
): CheckKetersediaanByBarangResult[] {
  return mapBarang(barang, golonganData, qtyField).map((v) => {
    let quota = v.tersedia;
    const noInventarisArr = v.noInventaris;

    const permintaanBarang = v.permintaanBarang
      // @ts-ignore
      .sort((a: any, b: any) => new Date(a.createdAt) - new Date(b.createdAt))
      .map((item: any) => {
        const { toTransfer, updatedNoInventaris } = calculateToTransfer(
          item.permintaan,
          quota,
          noInventarisArr
        );
        quota -= toTransfer;

        return {
          ...item,
          toTransfer,
          noInventaris: updatedNoInventaris,
        };
      })
      .filter((item: any) => item.toTransfer > 0);

    return {
      ...v,
      permintaanBarang,
      imQty: permintaanBarang.length,
    };
  });
}


function calculateToTransfer(permintaan: number, quota: number, noInventarisArr: string[]) {
  let toTransfer = 0;
  let updatedNoInventaris;

  if (quota > 0) {
    if (quota >= permintaan) {
      toTransfer = permintaan;
      updatedNoInventaris = noInventarisArr.splice(0, permintaan);
    } else {
      toTransfer = quota;
    }
  }

  return { toTransfer, updatedNoInventaris };
}

function mapBarangTakTersedia(
  barang: any[],
  golonganData: any[],
  qtyField: string
): CheckKetersediaanByBarangResult[] {
  return mapBarang(barang, golonganData, qtyField)
    .map((v) => {
      const remainingPermintaan = v.permintaan - v.ordered;
      let quota = remainingPermintaan;

      const permintaanBarang = v.permintaanBarang
        .map((item: any) => {
          const beli = calculateBeli(item.permintaan, quota);
          quota -= beli;

          return {
            ...item,
            qtyOrder: `${beli} ${v.uom}`,
            beli,
            permintaan: item.permintaan - item.qtyOrdered,
          };
        })
        .filter((item: any) => item.permintaan > 0);

      return {
        ...v,
        permintaan: remainingPermintaan,
        qty: `${remainingPermintaan} Pcs`,
        permintaanBarang,
        imQty: permintaanBarang.length,
      };
    })
    .filter((item) => item.permintaan > 0);
}

function calculateBeli(permintaan: number, quota: number) {
  return quota > 0 ? Math.min(permintaan, quota) : 0;
}