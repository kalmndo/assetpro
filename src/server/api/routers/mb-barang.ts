import {
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";
import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const mbBarangRouter = createTRPCRouter({
  getAll: protectedProcedure
    .query(async ({ ctx }) => {
      const result = await ctx.db.masterBarang.findMany({
        orderBy: {
          createdAt: "desc"
        },
        include: {
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

      return result.map((v) => ({
        ...v,
        kode: `${v.classCode}.${v.code}`,
        subSubKategori: v.SubSubKategori.name,
        subKategoriId: v.SubSubKategori.SubKategori.id,
        kategoriId: v.SubSubKategori.SubKategori.kategoriId,
        golonganId: v.SubSubKategori.SubKategori.Kategori.golonganId
      }))
    }),

  create: protectedProcedure
    .input(z.object({
      name: z.string(),
      image: z.string().nullable(),
      code: z.string(),
      subSubKategoriId: z.string(),
      classCode: z.string(),
      uomId: z.string(),
      deskripsi: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const {
        name,
        image,
        code,
        subSubKategoriId,
        classCode,
        uomId,
        deskripsi
      } = input

      try {
        await ctx.db.masterBarang.create({
          data: {
            name,
            image,
            code: Number(code),
            subSubKategoriId,
            classCode,
            fullCode: `${classCode}.${code}`,
            uomId,
            deskripsi
          },
        })
        return {
          ok: true,
          message: 'Berhasil menambah barang'
        }
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === 'P2002') {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Kode barang ini sudah ada, harap ubah.",
              cause: error,
            });
          }
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Kemunkingan terjadi kesalahan sistem, silahkan coba lagi",
          cause: error,
        });
      }
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      name: z.string(),
      code: z.string(),
      subSubKategoriId: z.string(),
      classCode: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const {
        id,
        name,
        code,
        subSubKategoriId,
        classCode
      } = input

      try {

        await ctx.db.masterBarang.update({
          where: {
            id
          },
          data: {
            name,
            code: Number(code),
            subSubKategoriId,
            classCode,
            fullCode: `${classCode}.${code}`
          },
        })
        return {
          ok: true,
          message: 'Berhasil mengubah barang kategori'
        }
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === 'P2002') {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Kode barang ini sudah ada, harap ubah.",
              cause: error,
            });
          }
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Kemunkingan terjadi kesalahan sistem, silahkan coba lagi",
          cause: error,
        });
      }
    }),

  remove: protectedProcedure
    .input(z.object({
      id: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const {
        id,
      } = input

      try {
        await ctx.db.masterBarang.delete({
          where: { id },
        })
        return {
          ok: true,
          message: 'Berhasil menghapus barang'
        }
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Kemunkingan terjadi kesalahan sistem, silahkan coba lagi",
          cause: error,
        });
      }
    }),

});
