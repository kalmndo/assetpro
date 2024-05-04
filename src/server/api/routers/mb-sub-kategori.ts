import {
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";
import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const mbSubKategoriRouter = createTRPCRouter({
  getAll: protectedProcedure
    .query(async ({ ctx }) => {
      const result = await ctx.db.masterBarangSubKategori.findMany({
        orderBy: {
          createdAt: "desc"
        },
        include: {
          Kategori: true

        }
      })

      return result.map((v) => ({
        ...v,
        kode: `${v.classCode}.${v.code}`,
        kategori: v.Kategori.name,
        golonganId: v.Kategori.golonganId
      }))
    }),

  create: protectedProcedure
    .input(z.object({
      name: z.string(),
      code: z.string(),
      kategoriId: z.string(),
      classCode: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const {
        name,
        code,
        kategoriId,
        classCode
      } = input

      try {
        await ctx.db.masterBarangSubKategori.create({
          data: {
            name,
            code: Number(code),
            kategoriId,
            classCode,
            fullCode: `${classCode}.${code}`
          },
        })
        return {
          ok: true,
          message: 'Berhasil menambah sub kategori'
        }
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === 'P2002') {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Kode sub kategori ini sudah ada, harap ubah.",
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
      kategoriId: z.string(),
      classCode: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const {
        id,
        name,
        code,
        kategoriId,
        classCode
      } = input

      try {

        await ctx.db.masterBarangSubKategori.update({
          where: {
            id
          },
          data: {
            name,
            code: Number(code),
            kategoriId,
            classCode,
            fullCode: `${classCode}.${code}`
          },
        })
        return {
          ok: true,
          message: 'Berhasil mengubah sub kategori'
        }
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === 'P2002') {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Kode kategori ini sudah ada, harap ubah.",
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
        await ctx.db.masterBarangSubKategori.delete({
          where: { id },
        })
        return {
          ok: true,
          message: 'Berhasil menghapus sub kategori'
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
