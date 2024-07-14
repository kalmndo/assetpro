import {
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const perbaikanRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(z.object({
      isUser: z.boolean()
    }))
    .query(async ({ ctx, input }) => {
      const { isUser } = input

      let findMany;

      if (isUser) {
        findMany = {
          where: {
            // @ts-ignore
            userId: ctx.session.user.id
          },
          orderBy: {
            createdAt: "desc" as any
          },
          include: {
            Aset: {
              include: {
                MasterBarang: true
              }
            }
          }
        }
      } else {
        findMany = {
          where: {
            // @ts-ignore
            NOT: { status: STATUS.PENGAJUAN.id }
          },
          orderBy: {
            createdAt: "desc"
          },
          include: {
            Aset: {
              include: {
                MasterBarang: true
              }
            }
          }
        }
      }

      // @ts-ignore
      const result = await ctx.db.perbaikan.findMany(findMany)

      return result
    }),
  getSelect: protectedProcedure
    .query(async ({ ctx }) => {
      const result = await ctx.db.organisasi.findMany({
        orderBy: {
          createdAt: "desc"
        },
      })

      return result.map((v) => ({
        label: v.name,
        value: v.id,
      }))
    }),
  create: protectedProcedure
    .input(z.object({
      name: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const {
        name,
      } = input

      try {
        await ctx.db.organisasi.create({
          data: {
            name,
          },
        })
        return {
          ok: true,
          message: 'Berhasil menambah organisasi'
        }
      } catch (error) {
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
    }))
    .mutation(async ({ ctx, input }) => {
      const {
        id,
        name,
      } = input

      try {

        await ctx.db.department.update({
          where: {
            id
          },
          data: {
            name
          },
        })
        return {
          ok: true,
          message: 'Berhasil mengubah organisasi'
        }
      } catch (error) {
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
        await ctx.db.department.delete({
          where: { id },
        })
        return {
          ok: true,
          message: 'Berhasil menghapus organisasi'
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
