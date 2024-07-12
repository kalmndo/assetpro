type BarangGroupResultType = {
  barangId: string;
  qty: number;
  permintaanBarang: string[];
  golongan: number;
  createdAt: Date;
  updatedAt: Date;
}[]

type CheckKetersediaanByBarangResult = {
  id: string,
  image: string,
  name: string,
  kode: string
  permintaan: number,
  uom: string,
  tersedia: number,
  golongan: string,
  permintaanBarang: PermintaanBarangResult[]
  imQty: string,
  qty: '15 Pcs'
}

type PermintaanBarangResult = {
  id: string
  name: string
  im: string
  href: string
  qty: string
  permintaan: number
  qtyOrder: string
  beli: number,
  status: string
}

export default async function checkKetersediaanByBarang(ctx: any, barangGroupResult: BarangGroupResultType) {
  const barangIds = barangGroupResult.map((v) => v.barangId)
  const permintaanBarangIds = barangGroupResult.flatMap((v) => v.permintaanBarang)

  const permintaanBarangResult = await ctx.permintaanBarangBarang.findMany({
    where: {
      id: { in: permintaanBarangIds }
    },
    include: {
      Permintaan: {
        include: {
          Pemohon: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  const mergeBarangGroupResult = barangGroupResult.map((v) => {
    // && a.status === STATUS.IM_APPROVE.name
    // TODO: intinya filter status by approve or progress entah lah
    const permintaanBarang = permintaanBarangResult.filter((a: any) => a.barangId === v.barangId)
    return {
      ...v,
      permintaanBarang
    }
  })

  const filterGolongan = (golongan: number) => mergeBarangGroupResult.filter((v) => v.golongan === golongan);

  const [groupGolonganAset, groupGolonganPersediaan] = [filterGolongan(1), filterGolongan(2)];

  const fetchKetersediaan = async (model: 'daftarAsetGroup' | 'kartuStok', ids: string[]) => {
    // @ts-ignore
    const result = await ctx[model].findMany({
      where: { id: { in: ids } },
      include: {
        MasterBarang: {
          include: {
            Uom: true,
            DaftarAset: true
          }
        }
      }
    })
    return result
  }

  const [daftarAsetGroup, kartuStok] = await Promise.all([
    fetchKetersediaan('daftarAsetGroup', barangIds),
    fetchKetersediaan('kartuStok', barangIds)
  ]);

  const mapBarang = (barang: any, golonganData: any, qtyField: string) => {
    return barang.map((v: any) => {
      const permintaan = golonganData.find((a: any) => a.barangId === v.id);

      const permintaanBarang = permintaan.permintaanBarang.map((item: any) => {
        // const qty = item.qty - item.qtyOrdered - item.qtyOut
        return ({
          id: item.id,
          pemohonId: item.Permintaan.Pemohon.name,
          name: item.Permintaan.Pemohon.name,
          im: item.Permintaan.no,
          href: item.Permintaan.id,
          barangId: v.MasterBarang.id,
          qty: `${item.qty} ${v.MasterBarang.Uom.name}`,
          permintaan: item.qty,
          qtyOrdered: item.qtyOrdered,
          qtyOut: item.qtyOut,
          imStatus: item.Permintaan.status,
          status: item.status,
          createdAt: item.createdAt,
        })
      }) as CheckKetersediaanByBarangResult[]

      const permintaanBarangId = permintaanBarang.map((v) => v.id)


      return {
        id: permintaan.barangId,
        image: v.MasterBarang.image,
        name: v.MasterBarang.name,
        kode: v.MasterBarang.fullCode,
        permintaan: permintaan.qty,
        uom: v.MasterBarang.Uom.name,
        tersedia: qtyField === 'idle' ? v[qtyField] - v.booked : v[qtyField],
        ordered: permintaan.ordered,
        golongan: permintaan.golongan === 1 ? "Aset" : "Persediaan",
        permintaanBarang,
        permintaanBarangId,
        imQty: permintaan.permintaanBarang.length,
        noInventaris: v.MasterBarang?.DaftarAset.map((v: any) => v.id)
      };
    });
  }

  const mapBarangTersedia = (barang: any, golonganData: any, qtyField: string) => {
    return mapBarang(barang, golonganData, qtyField).map((v: any) => {
      let quota = v.tersedia
      // @ts-ignore
      v.permintaanBarang.sort((a: any, b: any) => new Date(a.createdAt) - new Date(b.createdAt))
      const noInventarisArr = v.noInventaris

      const permintaanBarang = v.permintaanBarang.map((item: any) => {
        let toTransfer = 0
        let noInventaris
        quota = quota - toTransfer

        if (quota > 0) {
          if (quota >= item.permintaan) {
            toTransfer = item.permintaan;
            noInventaris = noInventarisArr.splice(0, item.permintaan)

            quota -= item.permintaan;
          } else {
            toTransfer = quota;
            quota = 0;
          }
        }

        return {
          ...item,
          toTransfer,
          noInventaris
        }
      }).filter((v: any) => v.toTransfer > 0)

      return ({
        ...v,
        permintaanBarang,
        imQty: permintaanBarang.length
      })
    })
  }

  const mapBarangTakTersedia = (barang: any, golonganData: any, qtyField: string) => {
    return mapBarang(barang, golonganData, qtyField).map((v: any) => {
      const permintaan = v.permintaan - v.ordered
      let quota = permintaan

      const permintaanBarang = v.permintaanBarang.map((item: any) => {
        let beli = 0
        quota = quota - beli

        if (quota > 0) {
          if (quota >= item.permintaan) {
            beli = item.permintaan;
            quota -= item.permintaan;
          } else {
            beli = quota;
            quota = 0;
          }
        }


        return ({
          ...item,
          qtyOrder: `${beli} ${v.uom}`,
          beli,
          permintaan: item.permintaan - item.qtyOrdered
        })
      }).filter((v: any) => v.permintaan > 0)

      return ({
        ...v,
        permintaan,
        qty: `${permintaan} Pcs`,
        permintaanBarang,
        imQty: permintaanBarang.length
      })
    }).filter((a: any) => a.permintaan > 0)
  }
  const asetTersedia = mapBarangTersedia(daftarAsetGroup, groupGolonganAset, 'idle');
  const persediaanTersedia = mapBarangTersedia(kartuStok, groupGolonganPersediaan, 'qty');
  const asetTakTersedia = mapBarangTakTersedia(daftarAsetGroup, groupGolonganAset, 'idle');
  const persediaanTakTersedia = mapBarangTakTersedia(kartuStok, groupGolonganPersediaan, 'qty');

  const tersedia = [...asetTersedia, ...persediaanTersedia]
  const takTersedia = [...asetTakTersedia, ...persediaanTakTersedia] as CheckKetersediaanByBarangResult[]

  return {
    tersedia,
    takTersedia
  }
}