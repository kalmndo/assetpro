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
    ...mapBarangTersedia(kartuStok, persediaan, "qty"),
  ];

  const takTersedia = [
    // @ts-ignore
    ...mapBarangTakTersedia(daftarAsetGroup, daftarAset, "idle"),
    // @ts-ignore
    ...mapBarangTakTersedia(kartuStok, persediaan, "qty"),
  ];

  return {
    tersedia,
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
    const permintaanBarang = permintaan?.permintaanBarang.map((item: any) =>
      mapPermintaanBarang(item, v.MasterBarang),
    );
    const daftarAset = v.MasterBarang.DaftarAset;

    const filteredAset = daftarAset.filter(
      (v) => v.status === STATUS.ASET_IDLE.id,
    );

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

    const newPermintaanBarang = permintaanBarang.filter((obj) =>
      obj.hasOwnProperty("noInventaris"),
    );
    return {
      // for table
      id: permintaan.barangId,
      image: v.MasterBarang.image,
      name: v.MasterBarang.name,
      kode: v.MasterBarang.fullCode,
      permintaan: permintaan.qty,
      uom: v.MasterBarang.Uom.name,
      ordered: permintaan.ordered,
      golongan: getGolonganLabel(permintaan.golongan),
      // for table
      permintaanBarang: newPermintaanBarang,
      permintaanBarangId: newPermintaanBarang.map((v: any) => v.id),
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
    persediaan: filterGolongan(1),
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
    //TODO: find no inv === fttb inv
    // console.log("permintaanBarang", v.MasterBarang)
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

function mapBarangTersedia(
  barang: Awaited<Promise<ReturnType<typeof fetchKetersediaan>>>,
  golonganData: MergeBarangGroup[],
  qtyField: "idle" | "qty",
) {
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
          noInventarisArr,
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

function calculateToTransfer(
  permintaan: number,
  quota: number,
  noInventarisArr: string[],
) {
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
  barang: Awaited<Promise<ReturnType<typeof fetchKetersediaan>>>,
  golonganData: MergeBarangGroup[],
  qtyField: "idle" | "qty",
) {
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
