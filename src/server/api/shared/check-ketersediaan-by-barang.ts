import { STATUS } from "@/lib/status";
import {
  type PrismaClient,
  type PermintaanBarangBarangGroup,
} from "@prisma/client";

export default async function checkKetersediaanByBarang(
  ctx: PrismaClient,
  barangGroupResult: PermintaanBarangBarangGroup[],
) {
  const barangIds = barangGroupResult.map((v) => v.barangId);
  const permintaanBarangIds = barangGroupResult.flatMap(
    (v) => v.permintaanBarang,
  );

  const permintaanBarangResult = await fetchPermintaanBarang(
    ctx,
    permintaanBarangIds,
  );

  const mergeBarangGroupResult = barangGroupResult.map((v) => {
    return {
      ...v,
      permintaanBarang: permintaanBarangResult.filter(
        (a: any) => a.barangId === v.barangId,
      ),
    };
  });

  const { daftarAset, persediaan } = partitionByGolongan(
    mergeBarangGroupResult,
  );

  const [daftarAsetGroup, kartuStok] = await Promise.all([
    fetchKetersediaan(ctx, "daftarAsetGroup", barangIds),
    fetchKetersediaan(ctx, "kartuStok", barangIds),
  ]);

  const tersedia = [
    // @ts-ignore

    ...tersediaAset(daftarAsetGroup, daftarAset),
    // @ts-ignore
    ...tersediaStock(kartuStok, persediaan),
  ];

  const takTersedia = [
    // @ts-ignore
    ...mapBarangTakTersedia(daftarAsetGroup, daftarAset, "idle"),
    // @ts-ignore
    ...mapBarangTakTersedia(kartuStok, persediaan, "qty"),
  ];

  return {
    tersedia: tersedia.filter((v) => v.permintaan > 0),
    takTersedia,
  };
}

function tersediaAset(
  barang: Awaited<Promise<ReturnType<typeof fetchKetersediaan>>>,
  golonganData: MergeBarangGroup[],
) {
  // cari imId yang sama
  //
  // kalau mau deluan, mutasi barang lewat daftar Aset
  //
  // kalau barang nya di ambil lewat mutasi, kasih keterangan kurang berapa karna dimutasi
  // track status permintaan barang nya kalau sudah done jangan dicheck
  // artinya permintaan dia sisa berapa lagi?
  //
  // kalau qty sama dengan qtyOrder berarti pembelian
  // dan resiko dari beli ya menunggu datang
  // kalau mau mutasi kenapa beli?
  // jadi check imId aja semua
  //
  // kalau barang dibeli
  // tapi imId nya used
  return barang.map((v) => {
    const permintaan = golonganData.find((a) => a.barangId === v.id)!;
    const permintaanBarang = [];
    // eslint-disable-next-line
    // @ts-ignore
    let quota = v.qty;

    for (const item of permintaan.permintaanBarang) {
      const qtyMinOut = item.qty - item.qtyOut;
      const toTransfer = qtyMinOut > 0 ? qtyMinOut : quota;
      permintaanBarang.push({
        id: item.id,
        pemohonId: item.Permintaan.Pemohon.id,
        name: item.Permintaan.Pemohon.name,
        im: item.Permintaan.no,
        href: item.Permintaan.id,
        barangId: v.MasterBarang.id,
        qty: `${item.qty} ${v.MasterBarang.Uom.name}`,
        permintaan: item.qty,
        qtyOrdered: item.qtyOrdered,
        qtyOut: item.qtyOut,
        toTransfer,
        imStatus: item.Permintaan.status,
        status: item.status,
        createdAt: item.createdAt,
      });
      if (quota !== 0) {
        quota = quota - toTransfer;
      }
    }
    const daftarAset = v.MasterBarang.DaftarAset;

    const filteredAset = daftarAset.filter(
      (v) => v.status === STATUS.ASET_IDLE.id,
    );

    if (permintaanBarang && permintaanBarang.length > 0) {
      for (const val of permintaanBarang) {
        for (const a of filteredAset) {
          if (val.href === a.imId) {
            // @ts-ignore
            if (val.noInventaris) {
              // @ts-ignore
              val.noInventaris = [...val.noInventaris, a.id];
            } else {
              // @ts-ignore
              val.noInventaris = [a.id];
            }
          }
        }
      }
    }

    const newPermintaanBarang = permintaanBarang?.filter((obj) =>
      obj.hasOwnProperty("noInventaris"),
    );
    return {
      // for table
      id: permintaan?.barangId,
      image: v.MasterBarang.image,
      name: v.MasterBarang.name,
      kode: v.MasterBarang.fullCode,
      permintaan: permintaan?.qty,
      uom: v.MasterBarang.Uom.name,
      ordered: permintaan?.ordered,
      golongan: getGolonganLabel(permintaan?.golongan),
      // @ts-ignore
      tersedia: v.idle - v.booked,
      // for table
      permintaanBarang: newPermintaanBarang,
      permintaanBarangId: newPermintaanBarang?.map((v: any) => v.id),
      imQty: permintaan?.permintaanBarang.length,
    };
  });
}

function tersediaStock(
  barang: Awaited<Promise<ReturnType<typeof fetchKetersediaan>>>,
  golonganData: MergeBarangGroup[],
) {
  return barang.map((v) => {
    const permintaan = golonganData.find((a) => a.barangId === v.id)!;

    const permintaanBarang = [];
    // eslint-disable-next-line
    // @ts-ignore
    let quota = v.qty;

    for (const item of permintaan.permintaanBarang) {
      const qtyMinOut = item.qty - item.qtyOut;
      const toTransfer = qtyMinOut > 0 ? qtyMinOut : quota;
      permintaanBarang.push({
        id: item.id,
        pemohonId: item.Permintaan.Pemohon.id,
        name: item.Permintaan.Pemohon.name,
        im: item.Permintaan.no,
        href: item.Permintaan.id,
        barangId: v.MasterBarang.id,
        qty: `${item.qty} ${v.MasterBarang.Uom.name}`,
        permintaan: item.qty,
        qtyOrdered: item.qtyOrdered,
        qtyOut: item.qtyOut,
        toTransfer,
        imStatus: item.Permintaan.status,
        status: item.status,
        createdAt: item.createdAt,
      });
      if (quota !== 0) {
        quota = quota - toTransfer;
      }
    }

    return {
      id: permintaan.barangId,
      image: v.MasterBarang.image,
      name: v.MasterBarang.name,
      kode: v.MasterBarang.fullCode,
      permintaan: permintaan.qty,
      uom: v.MasterBarang.Uom.name,
      // eslint-disable-next-line
      // @ts-ignore
      tersedia: v.qty,
      ordered: permintaan.ordered,
      golongan: getGolonganLabel(permintaan.golongan),
      permintaanBarang,
      permintaanBarangId: permintaanBarang.map((v: any) => v.id),
      imQty: permintaan.permintaanBarang.length,
    };
  });
}

function fetchPermintaanBarang(
  ctx: PrismaClient,
  permintaanBarangIds: string[],
) {
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

type MergeBarangGroup = Omit<
  PermintaanBarangBarangGroup,
  "permintaanBarang"
> & {
  permintaanBarang: Awaited<Promise<ReturnType<typeof fetchPermintaanBarang>>>;
};

function partitionByGolongan(mergeBarangGroupResult: MergeBarangGroup[]) {
  const filterGolongan = (golongan: number) =>
    mergeBarangGroupResult.filter((v) => v.golongan === golongan);

  return {
    daftarAset: filterGolongan(1),
    persediaan: filterGolongan(2),
  };
}

function fetchKetersediaan(
  ctx: PrismaClient,
  model: "daftarAsetGroup" | "kartuStok",
  ids: string[],
) {
  const args = {
    where: { id: { in: ids } },
    include: {
      MasterBarang: {
        include: {
          Uom: true,
          ...(model === "daftarAsetGroup" && {
            DaftarAset: { where: { status: STATUS.ASET_IDLE.id } },
          }),
        },
      },
    },
  };

  if (model === "daftarAsetGroup") {
    return ctx.daftarAsetGroup.findMany(args);
  } else {
    return ctx.kartuStok.findMany(args);
  }
}

function mapBarang(
  barang: Awaited<Promise<ReturnType<typeof fetchKetersediaan>>>,
  golonganData: MergeBarangGroup[],
  qtyField: "idle" | "qty",
) {
  return barang.map((v) => {
    const permintaan = golonganData.find((a) => a.barangId === v.id)!;
    const permintaanBarang = permintaan?.permintaanBarang.map((item: any) =>
      mapPermintaanBarang(item, v.MasterBarang),
    );
    return {
      id: permintaan?.barangId,
      image: v.MasterBarang.image,
      name: v.MasterBarang.name,
      kode: v.MasterBarang.fullCode,
      permintaan: permintaan?.qty,
      uom: v.MasterBarang.Uom.name,
      tersedia: calculateTersedia(v, qtyField),
      ordered: permintaan?.ordered,
      golongan: getGolonganLabel(permintaan?.golongan),
      permintaanBarang,
      permintaanBarangId: permintaanBarang?.map((v: any) => v.id),
      imQty: permintaan?.permintaanBarang.length,
      // noInventaris: v.MasterBarang?.DaftarAset.map((v: any) => v.id),
      daftarAset: v.MasterBarang.DaftarAset,
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

function mapBarangTakTersedia(
  barang: Awaited<Promise<ReturnType<typeof fetchKetersediaan>>>,
  golonganData: MergeBarangGroup[],
  qtyField: "idle" | "qty",
) {
  return mapBarang(barang, golonganData, qtyField)
    .map((v) => {
      const remainingPermintaan = v.permintaan - v.ordered;
      let quota = remainingPermintaan;

      const permintaanBarang = v.permintaanBarang
        ?.map((item: any) => {
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
        imQty: permintaanBarang?.length,
      };
    })
    .filter((item) => item.permintaan > 0);
}

function calculateBeli(permintaan: number, quota: number) {
  return quota > 0 ? Math.min(permintaan, quota) : 0;
}
