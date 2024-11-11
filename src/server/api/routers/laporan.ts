import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
} from "@/server/api/trpc";

export const laporanRouter = createTRPCRouter({
  semuaAset: publicProcedure
    .input(z.object({ tahun: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const { tahun } = input

      const startDate = new Date(`${String(tahun - 1)}-01-01T00:00:00Z`); // Start of 2023
      const endDate = new Date(`${String(tahun)}-12-31T23:59:59Z`)

      const result = await ctx.db.$transaction(async (tx) => {
        const daftarAsetResult = await tx.daftarAset.findMany({
          where: {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
          include: {
            MasterBarang: true
          }
        })

        const kategoriRes = await tx.masterBarangKategori.findMany()
        const res = kategoriRes.map((v) => ({
          name: v.name,
          fullCode: v.fullCode,
          thisYear: 0,
          lastYear: 0
        }))

        for (const val of daftarAsetResult) {
          const year = val.createdAt.getFullYear()
          const kategoriKode = val.MasterBarang.classCode.substring(0, 3)
          for (const asdf of res) {
            if (asdf.fullCode === kategoriKode) {
              if (year === tahun) {
                asdf.thisYear = asdf.thisYear + val.nilaiBuku
              } else {
                asdf.lastYear = asdf.lastYear + val.nilaiBuku
              }
            }
          }
        }

        return res.map((v, i) => {
          const percentage = ((v.thisYear - v.lastYear) / v.lastYear) * 100
          return ({
            ...v,
            id: i + 1,
            no: i + 1,
            percentage: isNaN(percentage) ? 0 : percentage
          })
        })

      })
      return result
    }),
});
