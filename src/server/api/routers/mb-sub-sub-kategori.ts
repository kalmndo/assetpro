import {
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";
import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const mbSubSubKategoriRouter = createTRPCRouter({
  getAll: protectedProcedure
    .query(async ({ ctx }) => {
      const result = await ctx.db.masterBarangSubSubKategori.findMany({
        orderBy: {
          createdAt: "desc"
        },
        include: {
          SubKategori: {
            include: {
              Kategori: true
            }
          }
        }
      })

      return result.map((v) => ({
        ...v,
        kode: `${v.classCode}.${v.code}`,
        subKategori: v.SubKategori.name,
        kategoriId: v.SubKategori.kategoriId,
        golonganId: v.SubKategori.Kategori.golonganId
      }))
    }),

  create: protectedProcedure
    .input(z.object({
      name: z.string(),
      code: z.string(),
      subKategoriId: z.string(),
      classCode: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const {
        name,
        code,
        subKategoriId,
        classCode
      } = input

      try {
        await ctx.db.masterBarangSubSubKategori.create({
          data: {
            name,
            code: Number(code),
            subKategoriId,
            classCode,
            fullCode: `${classCode}.${code}`
          },
        })
        return {
          ok: true,
          message: 'Berhasil menambah sub sub kategori'
        }
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === 'P2002') {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Kode sub sub kategori ini sudah ada, harap ubah.",
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
      subKategoriId: z.string(),
      classCode: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const {
        id,
        name,
        code,
        subKategoriId,
        classCode
      } = input

      try {

        await ctx.db.masterBarangSubSubKategori.update({
          where: {
            id
          },
          data: {
            name,
            code: Number(code),
            subKategoriId,
            classCode,
            fullCode: `${classCode}.${code}`
          },
        })
        return {
          ok: true,
          message: 'Berhasil mengubah sub sub kategori'
        }
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === 'P2002') {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Kode sub sub kategori ini sudah ada, harap ubah.",
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
        await ctx.db.masterBarangSubSubKategori.delete({
          where: { id },
        })
        return {
          ok: true,
          message: 'Berhasil menghapus sub sub kategori'
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
