import {
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const kartuStokRouter = createTRPCRouter({
  getAll: protectedProcedure
    .query(async ({ ctx }) => {
      const result = await ctx.db.kartuStok.findMany({
        orderBy: {
          createdAt: "desc"
        },
        include: {
          MasterBarang: {
            include: {
              Uom: true,
              SubSubKategori: true
            }
          }
        }
      })

      return result.map((v) => ({
        id: v.id,
        barang: {
          name: v.MasterBarang.name,
          image: v.MasterBarang.image,
        },
        code: v.MasterBarang.fullCode,
        kategori: v.MasterBarang.SubSubKategori.name,
        satuan: v.MasterBarang.Uom.name,
        jumlah: v.qty,
        harga: `Rp ${v.harga.toNumber().toLocaleString("id-ID")}`,
        total: `Rp ${v.total.toNumber().toLocaleString("id-ID")}`,
      }))
    }),
  get: protectedProcedure
    .input(z.object({
      id: z.string()
    }))
    .query(async ({ ctx, input }) => {
      const { id } = input
      const result = await ctx.db.kartuStok.findFirst({
        where: {
          id
        },
        include: {
          KartuStokPergerakan: true,
          MasterBarang: {
            include: {
              Uom: true,
              FtkbItem: {
                orderBy: {
                  createdAt: 'desc'
                },
                include: {
                  Ftkb: true,
                  FtkbItemPemohon: {
                    orderBy: {
                      createdAt: 'desc'
                    },
                    include: {
                      IM: {
                        include: {
                          Pemohon: true
                        }
                      }
                    }
                  }
                }
              }
            },
          },
          FttbItemKartuStock: {
            orderBy: { createdAt: 'desc' },
            include: {
              FttbItem: {
                include: {
                  Fttb: true,
                  PoBarang: {
                    include: {
                      PO: {
                        include: {
                          Vendor: true
                        }
                      },
                      Barang: {
                        include: {
                          PembelianBarang: true
                        }
                      }
                    }
                  }
                }
              }
            }
          },
        }
      })

      if (!result) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: 'Tidak ada form ini'
        });
      }

      const barang = result.MasterBarang
      const masuk = result.FttbItemKartuStock.map((v) => ({
        id: v.id,
        no: v.FttbItem.Fttb.no,
        vendor: v.FttbItem.PoBarang.PO.Vendor.name,
        jumlah: v.FttbItem.PoBarang.Barang.PembelianBarang.qty,
        hargaSatuan: "Rp " + v.FttbItem.PoBarang.Barang.harga?.toLocaleString("id-ID"),
        hargaTotal: "Rp " + v.FttbItem.PoBarang.Barang.totalHarga?.toLocaleString("id-ID"),
        tanggal: v.FttbItem.createdAt.toLocaleDateString("id-ID")
      }))

      const keluar: { id: string, no: string, pemohon: string, noIm: string, jumlah: number, tanggal: string }[] = []

      for (const v of result.MasterBarang.FtkbItem) {
        const no = v.Ftkb.no
        for (const p of v.FtkbItemPemohon) {
          keluar.push({
            id: p.id,
            no,
            pemohon: p.IM.Pemohon.name,
            noIm: p.IM.no,
            jumlah: p.qty,
            tanggal: p.createdAt.toLocaleDateString("id-ID")
          })
        }
      }

      const pergerakanStok = createKartuStokPergerakan(result.KartuStokPergerakan)

      const res = {
        barang: {
          name: barang.name,
          image: barang.image,
          code: barang.fullCode,
          jumlah: result.qty,
          uom: barang.Uom.name,
          deskripsi: barang.deskripsi
        },
        card: {
          stok: result.qty,
          masuk: masuk.map((v) => v.jumlah).reduce((acc, num) => acc + num, 0),
          keluar: keluar.map((v) => v.jumlah).reduce((acc, num) => acc + num, 0),
          harga: 'Rp 0'
        },
        pergerakanStok,
        riwayat: {
          masuk,
          keluar
        }
      }

      return res
    }),
});

type Data = {
  id: string;
  year: number;
  month: any;
  out: number;
  in: number;
  kartuStokId: string;
  createdAt: Date;
  updatedAt: Date;
};

function createKartuStokPergerakan(data: Data[]) {
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Initialize a map to track existing months
  const monthMap = new Map<number, Data>();

  let year = 0

  for (const entry of data) {
    monthMap.set(entry.month, entry);
    year = entry.year

  }

  // Initialize the result array
  const result: Data[] = [];

  // Fill in missing months from January to December
  for (let month = 1; month <= 12; month++) {
    if (monthMap.has(month)) {
      const existingEntry = monthMap.get(month)!;

      result.push({
        ...existingEntry,
        month: monthNames[month - 1]
      });
    } else {
      result.push({
        id: "", // Generate or provide an appropriate id
        year,
        month: monthNames[month - 1],
        out: 0,
        in: 0,
        kartuStokId: "", // Provide appropriate kartuStokId
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
  }

  return result
}