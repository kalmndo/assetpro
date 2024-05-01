import {
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";

export const userRouter = createTRPCRouter({
  getAll: protectedProcedure
    .query(async ({ ctx }) => {
      const result = await ctx.db.user.findMany({
        orderBy: {
          createdAt: "asc"
        }
      })

      return result
    }),
});
