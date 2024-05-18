import {
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";
import { z } from "zod";

export const cariBarangRouter = createTRPCRouter({
  getList: protectedProcedure
    .input(z.object({ kategori: z.string() }))
    .query(async ({ ctx, input }) => {
      const { kategori } = input

      const [result, filterName] = await ctx.db.$transaction([
        ctx.db.masterBarang.findMany({
          where: kategori ? { subSubKategoriId: kategori } : {},
          include: {
            Uom: true,
            SubSubKategori: {
              include: {
                SubKategori: {
                  include: {
                    Kategori: {
                      include: {
                        Golongan: true
                      }
                    }
                  }
                }
              }
            }
          }
        }),
        ctx.db.masterBarangSubSubKategori.findFirst({ where: { id: kategori } })
      ])


      const data = result.map((v) => ({
        id: v.id,
        image: v.image ?? '',
        name: v.name,
        kode: v.fullCode,
        uom: v.Uom.name,
        uomId: v.uomId,
        subSubKategori: v.SubSubKategori.name,
        subKategori: v.SubSubKategori.SubKategori.name,
        kategori: v.SubSubKategori.SubKategori.Kategori.name,
        golongan: v.SubSubKategori.SubKategori.Kategori.Golongan.name
      }))

      return {
        data,
        filterName: filterName?.name
      }

    }),
  getAllKategori: protectedProcedure
    .query(async ({ ctx }) => {
      const result = await ctx.db.masterBarangGolongan.findMany({
        include: {
          MasterBarangKategori: {
            include: {
              MasterBarangSubKategori: {
                include: {
                  MasterBarangSuSubbKategori: true
                }
              }
            }
          }
        }
      })

      function resultFn(code: number) {
        return result.filter((v) => v.code === code).map((v) => ({
          id: v.id,
          name: v.name,
          child: v.MasterBarangKategori.filter((v) => v.code !== 1 && v.code !== 2).map((k) => ({
            id: k.id,
            name: k.name,
            child: k.MasterBarangSubKategori.map((sk) => ({
              id: sk.id,
              name: sk.name,
              child: sk.MasterBarangSuSubbKategori.map((ssk) => ({
                id: ssk.id,
                name: ssk.name
              }))
            }))
          }))
        }))
      }


      return {
        aset: resultFn(1),
        persediaan: resultFn(2)
      }

    })
});
