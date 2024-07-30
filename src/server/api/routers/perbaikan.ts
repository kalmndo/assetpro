import { STATUS } from "@/lib/status";
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
  create: protectedProcedure
    .input(z.object({
      asetId: z.string(),
      keluhan: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const {
        asetId,
        keluhan
      } = input
      const userId = ctx.session.user.id

      try {
        await ctx.db.$transaction(async (tx) => {
          const user = await tx.user.findFirst({
            where: { id: userId }
          })

          const perbaikan = await tx.perbaikan.create({
            data: {
              no: Math.random().toString(),
              userId,
              keluhan,
              asetId,
              status: STATUS.PENGAJUAN.id
            },
          })

          const desc = `<p class="text-sm font-semibold">${user?.name}<span class="font-normal ml-[5px]">Meminta persetujuan permintaan perbaikan ${perbaikan.no}</span></p>`
          await tx.notification.create({
            data: {
              fromId: userId,
              // TODO: Benerin ini kalau gak ada atasan
              toId: user?.atasanId ?? userId,
              link: `/permintaan/perbaikan/${perbaikan.id}`,
              desc,
              isRead: false,
            }
          })
        })
        return {
          ok: true,
          message: 'Berhasil meminta permohonan perbaikan'
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
