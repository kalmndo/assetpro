import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const mRuangRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const result = await ctx.db.masterRuang.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return result;
  }),
  getSelect: protectedProcedure.query(async ({ ctx }) => {
    const result = await ctx.db.masterRuang.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return result.map((v) => ({
      label: v.name,
      value: v.id,
    }));
  }),
  getSelectByUser: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const user = await ctx.db.user.findFirst({
      where: {
        id: userId,
      },
      include: {
        Department: true,
      },
    });
    const orgId = user?.Department.organisasiId;
    const result = await ctx.db.masterRuang.findMany({
      where: {
        orgId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return result.map((v) => ({
      label: v.name,
      value: v.id,
    }));
  }),
  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { name } = input;

      try {
        await ctx.db.masterRuang.create({
          data: {
            name,
            // TODO: dam nanti ganti ini dynamic
            orgId: "1",
          },
        });
        return {
          ok: true,
          message: "Berhasil menambah ruang",
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
        name: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, name } = input;

      try {
        await ctx.db.masterRuang.update({
          where: {
            id,
          },
          data: {
            name,
          },
        });
        return {
          ok: true,
          message: "Berhasil mengubah ruang",
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
        await ctx.db.masterRuang.delete({
          where: { id },
        });
        return {
          ok: true,
          message: "Berhasil menghapus ruang",
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
