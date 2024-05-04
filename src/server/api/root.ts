import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { userRouter } from "./routers/user";
import { departmentRouer } from "./routers/department";
import { mbKategoriRouter } from "./routers/mb-kategori";
import { mbGolonganRouter } from "./routers/mb-golongan";
import { mbSubKategoriRouter } from "./routers/mb-sub-kategori";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  user: userRouter,
  department: departmentRouer,
  mbGolongan: mbGolonganRouter,
  mbKategori: mbKategoriRouter,
  mbSubKategori: mbSubKategoriRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
