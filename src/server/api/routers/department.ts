import {
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";

export const departmentRouer = createTRPCRouter({
  getSelect: protectedProcedure
    .query(async ({ ctx }) => {
      const result = await ctx.db.department.findMany()

      return result.map((v) => ({
        value: v.id,
        label: v.name
      }))
    }),
});
