import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const mPeminjamanRuangRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const result = await ctx.db.masterPeminjamanRuang.findMany({
      include: {
        MasterRuang: true,
      },
    });
    const ruangs = await ctx.db.masterRuang.findMany({
      where: {
        id: { notIn: result.map((v) => v.ruangId) },
      },
    });

    return {
      result: result.map((v) => ({
        id: v.id,
        name: v.MasterRuang.name,
      })),
      ruangs: ruangs.map((v) => ({
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
        ruangId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { ruangId } = input;

      try {
        await ctx.db.masterPeminjamanRuang.create({
          data: {
            ruangId,
          },
        });
        return {
          ok: true,
          message: "Berhasil menambah Master Peminjaman Ruang",
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Kemunkingan terjadi kesalahan sistem, silahkan coba lagi",
          cause: error,
        });
      }
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        ruangId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ruangId } = input;

      try {
        await ctx.db.masterPeminjamanRuang.update({
          where: {
            id,
          },
          data: {
            ruangId,
          },
        });
        return {
          ok: true,
          message: "Berhasil mengubah Master peminjaman ruang",
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
        await ctx.db.masterPeminjamanRuang.delete({
          where: { id },
        });
        return {
          ok: true,
          message: "Berhasil menghapus Master Peminjaman Ruang",
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
