import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import monthsSince from "@/lib/month-since";

export const laporanRouter = createTRPCRouter({
  semuaAset: protectedProcedure
    .input(z.object({ tahun: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const { tahun } = input;

      const startDate = new Date(`${String(tahun - 1)}-01-01T00:00:00Z`); // Start of 2023
      const endDate = new Date(`${String(tahun)}-12-31T23:59:59Z`);

      const result = await ctx.db.$transaction(async (tx) => {
        const daftarAsetResult = await tx.daftarAset.findMany({
          where: {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
          include: {
            MasterBarang: true,
          },
        });

        const kategoriRes = await tx.masterBarangKategori.findMany({
          where: { classCode: "1" },
        });
        const res = kategoriRes.map((v) => ({
          name: v.name,
          fullCode: v.fullCode,
          thisYear: 0,
          lastYear: 0,
        }));
        console.log("res", res);

        for (const val of daftarAsetResult) {
          const year = val.createdAt.getFullYear();
          const kategoriKode = val.MasterBarang.classCode.substring(0, 3);
          for (const asdf of res) {
            if (asdf.fullCode === kategoriKode) {
              if (year === tahun) {
                asdf.thisYear = asdf.thisYear + val.nilaiBuku;
              } else {
                asdf.lastYear = asdf.lastYear + val.nilaiBuku;
              }
            }
          }
        }

        return res.map((v, i) => {
          const percentage = ((v.thisYear - v.lastYear) / v.lastYear) * 100;
          return {
            ...v,
            id: i + 1,
            no: i + 1,
            percentage: isNaN(percentage) ? 0 : percentage,
          };
        });
      });
      return result;
    }),
  jumlah: protectedProcedure
    .input(z.object({
      kategoriId: z.string(),
      subKategoriId: z.string(),
      subSubKategoriId: z.string(),
      org: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const { org, kategoriId, subKategoriId, subSubKategoriId } = input
      const whereClause: any = {};

      if (subSubKategoriId !== 'all') {
        whereClause.subSubKategoriId = subSubKategoriId;
      }
      if (subKategoriId !== 'all') {
        whereClause.SubSubKategori = {
          SubKategori: {
            id: subKategoriId,
          },
        };
      }
      if (kategoriId !== 'all') {
        whereClause.SubSubKategori = whereClause.SubSubKategori || {};
        whereClause.SubSubKategori.SubKategori = whereClause.SubSubKategori.SubKategori || {};
        whereClause.SubSubKategori.SubKategori.Kategori = {
          id: kategoriId,
        };
      }

      const daftarAsetWhereClause =
        org !== 'all'
          ? {
            Ruang: {
              orgId: org,
            },
          }
          : {};

      const result = await ctx.db.masterBarang.findMany({
        where: subSubKategoriId !== 'all' ? { subSubKategoriId } : {},
        include: {
          DaftarAset: {
            where: daftarAsetWhereClause
          },
          SubSubKategori: {
            include: {
              SubKategori: {
                include: {
                  Kategori: true
                }
              }
            }
          }
        }
      })



      console.log("result", result.map((v) => {
        const harga = v.DaftarAset.map((v) => v.hargaPembelian).reduce((a, b) => a + b, 0);
        const susut = v.DaftarAset.map((v) => v.nilaiPenyusutan).reduce((a, b) => a + b, 0);
        const buku = v.DaftarAset.map((v) => v.nilaiBuku).reduce((a, b) => a + b, 0);
        const jumlah = v.DaftarAset.length


        return {
          id: v.id,
          aset: v.name,
          jumlah: JSON.stringify(v.DaftarAset, null, 2),
          harga,
          susut,
          buku
        }
      }))
      return []
    }),
  getJumlah: protectedProcedure
    .query(async ({ ctx }) => {
      const o = await ctx.db.organisasi.findMany()
      const k = await ctx.db.masterBarangKategori.findMany({
        where: {
          golonganId: '1'
        }
      })
      const sk = await ctx.db.masterBarangSubKategori.findMany({
        where: {
          fullCode: { startsWith: '1' }
        }
      })
      const ssk = await ctx.db.masterBarangSubSubKategori.findMany({
        where: {
          fullCode: { startsWith: '1' }
        }
      })

      const org = o.map((v) => ({ id: v.id, name: v.name }))
      const kategori = k.map((v) => ({ id: v.id, name: v.name }))
      const subKategori = sk.map((v) => ({ id: v.id, name: v.name, parent: v.kategoriId }))
      const subSubKategori = ssk.map((v) => ({ id: v.id, name: v.name, parent: v.subKategoriId }))

      return {
        org: [{ id: 'all', name: 'Semua' }, ...org],
        kategori: [{ id: 'all', name: 'Semua' }, ...kategori],
        subKategori: [{ id: 'all', name: 'Semua' }, ...subKategori],
        subSubKategori: [{ id: 'all', name: 'Semua' }, ...subSubKategori],
      }

    }),
  semuaAsetPerlokasi: protectedProcedure
    .input(
      z.object({
        kategoriId: z.string(),
        from: z.date(),
        to: z.date(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { kategoriId, from, to } = input;
      // org | saldoawal | penambahan | jumlah | susut | saldoakhir
      const organisasiDb = await ctx.db.organisasi.findMany();
      const organisasiArr = organisasiDb.map((v) => ({
        id: v.id,
        name: v.name,
        saldoAwal: 0,
        penambahan: 0,
        jumlah: 0,
        susut: 0,
        saldoAkhir: 0,
      }));

      const organisasi = organisasiArr.reduce((acc, item) => {
        // eslint-disable-next-line
        // @ts-ignore
        acc[item.id] = item;
        return acc;
      }, {});

      const katDb = await ctx.db.masterBarangKategori.findFirst({
        where: { id: kategoriId },
      });
      if (!katDb) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const aset = await ctx.db.daftarAset.findMany({
        where: {
          MasterBarang: {
            SubSubKategori: { SubKategori: { Kategori: { id: kategoriId } } },
          },
        },
        include: {
          Ruang: true,
          MasterBarang: {
            include: {
              SubSubKategori: {
                include: {
                  SubKategori: {
                    include: {
                      Kategori: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      // saldo akhir = saldoawal + penambahan - susut

      for (const iterator of aset) {
        const orgId = iterator.Ruang!.orgId;
        // eslint-disable-next-line
        // @ts-ignore
        const v = organisasi[orgId];

        const monthLeft = monthsSince(iterator.createdAt);
        if (iterator.createdAt < from) {
          if (iterator.hargaPembelian) {
            if (monthLeft <= iterator.umur) {
              const monthlyDepreciation =
                iterator.hargaPembelian / iterator.umur;
              if (monthlyDepreciation > 0) {
                const total = monthlyDepreciation * monthLeft;

                v.susut = v.susut + total;
              }
            }
          }
          v.saldoAwal = v.saldoAwal + iterator.nilaiBuku;
          v.jumlah = v.jumlah + 1;
        } else if (iterator.createdAt > from && iterator.createdAt <= to) {
          if (iterator.hargaPembelian) {
            if (monthLeft <= iterator.umur) {
              const monthlyDepreciation =
                iterator.hargaPembelian / iterator.umur;
              if (monthlyDepreciation > 0) {
                const total = monthlyDepreciation * monthLeft;

                v.susut = v.susut + total;
              }
            }
          }
          v.penambahan = v.penambahan + iterator.nilaiBuku;
          v.jumlah = v.jumlah + 1;
        }
      }
      for (const [key, value] of Object.entries(organisasi)) {
        // eslint-disable-next-line
        // @ts-ignore
        const total = value.saldoAwal + value.penambahan;
        // eslint-disable-next-line
        // @ts-ignore
        value.saldoAkhir = total - value.susut;
      }

      // eslint-disable-next-line
      // @ts-ignore
      const result = Object.values(organisasi) as [
        {
          name: string;
          saldoAwal: number;
          penambahan: number;
          susut: number;
          jumlah: number;
          saldoAkhir: number;
        },
      ];
      return result;
    }),
  semuaStock: protectedProcedure
    .input(
      z.object({
        from: z.date(),
        to: z.date(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { from, to } = input;
      const organisasiDb = await ctx.db.organisasi.findMany();
      const organisasiArr = organisasiDb.map((v) => ({
        id: v.id,
        name: v.name,
        stockAwal: 0,
        stockAkhir: 0,
        masuk: 0,
        keluar: 0,
      }));

      const organisasi = organisasiArr.reduce((acc, item) => {
        // eslint-disable-next-line
        // @ts-ignore
        acc[item.id] = item;
        return acc;
      }, {});

      const laporanStock = await ctx.db.laporanStock.findMany({
        where: {
          date: {
            gte: from,
            lte: to,
          },
        },
        orderBy: {
          date: "asc",
        },
      });

      let index = 0;

      for (const value of laporanStock) {
        // eslint-disable-next-line
        // @ts-ignore
        const v = organisasi[value.orgId];
        // TODO: Gak bisa, ini harus index awal dari value.orgId bukan first dari seluruh
        if (index === 0) {
          v.stockAwal = value.stockTotal.toNumber();
          index = index + 1;
        }
        if (value.inTotal) {
          v.masuk = v.masuk + value.inTotal.toNumber();
        }
        if (value.outTotal) {
          v.keluar = v.keluar + value.outTotal.toNumber();
        }

        v.stockAkhir = value.stockTotal.toNumber();
      }

      const result = Object.values(organisasi) as [
        {
          id: string;
          name: string;
          stockAwal: number;
          stockAkhir: number;
          masuk: number;
          keluar: number;
        },
      ];
      return result;
    }),
  stockByOrg: protectedProcedure
    .input(
      z.object({
        orgId: z.string(),
        from: z.date(),
        to: z.date(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { from, to, orgId } = input;

      const laporanStock = await ctx.db.laporanStock.findMany({
        where: {
          date: {
            gte: from,
            lte: to,
          },
          orgId,
        },
        orderBy: {
          date: "asc",
        },
        include: {
          KartuStok: {
            include: {
              MasterBarang: {
                include: { Uom: true },
              },
            },
          },
        },
      });

      const res = {};

      for (const value of laporanStock) {
        const barang = value.KartuStok.MasterBarang;
        // eslint-disable-next-line
        // @ts-ignore
        if (!res[value.stockId]) {
          // eslint-disable-next-line
          // @ts-ignore
          res[value.stockId] = {
            id: barang.id,
            code: barang.fullCode,
            name: barang.name,
            uom: barang.Uom.name,
            awal: value.stockTotal.toNumber(),
            masuk: value.inTotal?.toNumber() ?? 0,
            keluar: value.outTotal?.toNumber() ?? 0,
            akhir: value.stockTotal.toNumber(),
          };
        } else {
          if (value.inTotal) {
            // eslint-disable-next-line
            // @ts-ignore
            res[value.stockId].masuk += value.inTotal.toNumber();
          }
          if (value.outTotal) {
            // eslint-disable-next-line
            // @ts-ignore
            res[value.stockId].keluar += value.outTotal.toNumber();
          }
          // eslint-disable-next-line
          // @ts-ignore
          res[value.stockId].akhir = value.stockTotal.toNumber();
        }
      }

      const result = Object.values(res) as [
        {
          id: string;
          code: string;
          name: string;
          uom: string;
          awal: number;
          akhir: number;
          masuk: number;
          keluar: number;
        },
      ];
      console.log("result", result);
      return result;
    }),
});
