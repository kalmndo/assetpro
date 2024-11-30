import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const mPeminjamanBarangRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const result = await ctx.db.masterPeminjamanBarang.findMany({
      include: {
        MasterBarang: true,
      },
    });
    const barangs = await ctx.db.masterBarang.findMany({
      where: {
        id: { notIn: result.map((v) => v.barangId) },
        fullCode: { startsWith: "1" },
      },
    });

    return {
      result: result.map((v) => ({
        id: v.id,
        name: v.MasterBarang.name,
      })),
      barangs: barangs.map((v) => ({
        label: v.name,
        value: v.id,
      })),
    };
  }),
  getSelect: protectedProcedure.query(async ({ ctx }) => {
    const result = await ctx.db.masterEvaluasiUser.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        User: true,
      },
    });

    return result.map((v) => ({
      label: v.User.name,
      value: v.id,
    }));
  }),
  create: protectedProcedure
    .input(
      z.object({
        barangId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { barangId } = input;

      try {
        await ctx.db.masterPeminjamanBarang.create({
          data: {
            barangId,
          },
        });
        return {
          ok: true,
          message: "Berhasil menambah Master Peminjaman Barang",
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Kemunkingan terjadi kesalahan sistem, silahkan coba lagi",
          cause: error,
        });
      }
    }),
  remove: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id } = input;

      try {
        await ctx.db.masterPeminjamanBarang.delete({
          where: { id },
        });
        return {
          ok: true,
          message: "Berhasil menghapus Master Peminjaman Barang",
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Kemunkingan terjadi kesalahan sistem, silahkan coba lagi",
          cause: error,
        });
      }
    }),
});
