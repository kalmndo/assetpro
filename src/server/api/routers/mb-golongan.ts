import {
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";

export const mbGolonganRouter = createTRPCRouter({
  getSelect: protectedProcedure
    .query(async ({ ctx }) => {
      const result = await ctx.db.masterBarangGolongan.findMany({
        orderBy: {
          createdAt: "desc"
        },
      })

      return result.map((v) => ({
        label: v.name,
        value: v.id,
        code: v.code
      }))
    }),
});
