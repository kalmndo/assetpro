import {
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";
import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const mbKategoriRouter = createTRPCRouter({
  getAll: protectedProcedure
    .query(async ({ ctx }) => {
      const result = await ctx.db.masterBarangKategori.findMany({
        orderBy: {
          createdAt: "desc"
        },
        include: {
          Golongan: true
        }
      })

      return result.map((v) => ({
        ...v,
        kode: `${v.classCode}.${v.code}`,
        golongan: v.Golongan.name
      }))
    }),

  create: protectedProcedure
    .input(z.object({
      name: z.string(),
      code: z.string(),
      golonganId: z.string(),
      classCode: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const {
        name,
        code,
        golonganId,
        classCode
      } = input

      try {
        await ctx.db.masterBarangKategori.create({
          data: {
            name,
            code: Number(code),
            golonganId,
            classCode,
            fullCode: `${classCode}.${code}`
          },
        })
        return {
          ok: true,
          message: 'Berhasil menambah kategori'
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

  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      name: z.string(),
      code: z.string(),
      golonganId: z.string(),
      classCode: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const {
        id,
        name,
        code,
        golonganId,
        classCode
      } = input

      try {

        await ctx.db.masterBarangKategori.update({
          where: {
            id
          },
          data: {
            name,
            code: Number(code),
            golonganId,
            classCode,
            fullCode: `${classCode}.${code}`
          },
        })
        return {
          ok: true,
          message: 'Berhasil mengubah kategori'
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
        await ctx.db.masterBarangKategori.delete({
          where: { id },
        })
        return {
          ok: true,
          message: 'Berhasil menghapus kategori'
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
