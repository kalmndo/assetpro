import {
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";

export const kodeAnggaranRouter = createTRPCRouter({
  getAll: protectedProcedure
    .query(async ({ ctx }) => {
      const result = await ctx.db.masterKodeAnggaran.findMany({
        orderBy: {
          createdAt: "desc"
        },
        include: {
          Department: true
        }
      })
      return result.map((v) => ({
        kode: v.id,
        name: v.name,
        department: v.Department.name,
        nilai: v.nilai ? v.nilai?.toLocaleString("id-ID") : "Rp 0"
      }))
    }),
  getSelect: protectedProcedure
    .query(async ({ ctx }) => {
      const result = await ctx.db.masterKodeAnggaran.findMany({
        orderBy: {
          createdAt: "desc"
        },
      })

      return result.map((v) => ({
        label: v.name,
        value: v.id,
      }))
    }),
  getSelectByUser: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.session.user.id
      const user = await ctx.db.user.findUnique({ where: { id: userId } })
      const result = await ctx.db.masterKodeAnggaran.findMany({
        where: {
          departmentId: user?.departmentId
        },
        orderBy: {
          createdAt: "desc"
        },
      })

      return result.map((v) => ({
        label: `${v.id} - ${v.name}`,
        value: v.id,
      }))
    }),

});
