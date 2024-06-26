import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { userRouter } from "./routers/user";
import { departmentRouter } from "./routers/department";
import { mbKategoriRouter } from "./routers/mb-kategori";
import { mbGolonganRouter } from "./routers/mb-golongan";
import { mbSubKategoriRouter } from "./routers/mb-sub-kategori";
import { mbSubSubKategoriRouter } from "./routers/mb-sub-sub-kategori";
import { mbBarangRouter } from "./routers/mb-barang";
import { cariBarangRouter } from "./routers/cari-barang";
import { mRuangRouter } from "./routers/m-ruang";
import { permintaanBarangRouter } from "./routers/permintaan-barang";
import { mUomRouter } from "./routers/m-uom";
import { departmentUnitRouter } from "./routers/department-unit";
import { kodeAnggaranRouter } from "./routers/kode-anggaran";
import { organisasiRouter } from "./routers/organisasi";
import { permintaanPembelianRouter } from "./routers/permintaan-pembelian";
import { permintaanPenawaranRouter } from "./routers/permintaan-penawaran";
import { penawaranHargaRouter } from "./routers/penawaran-harga";
import { vendorRouter } from "./routers/vendor";
import { evaluasiHargaRouter } from "./routers/evaluasi-harga";
import { mEvaluasiRouter } from "./routers/m-evaluasi";
import { purchaseOrderRouter } from "./routers/purchase-order";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  user: userRouter,
  organisasi: organisasiRouter,
  department: departmentRouter,
  departmentUnit: departmentUnitRouter,
  mbGolongan: mbGolonganRouter,
  mbKategori: mbKategoriRouter,
  mbSubKategori: mbSubKategoriRouter,
  mbSubSubKategori: mbSubSubKategoriRouter,
  mbBarang: mbBarangRouter,
  mRuang: mRuangRouter,
  mEvaluasi: mEvaluasiRouter,
  kodeAnggaran: kodeAnggaranRouter,
  mUom: mUomRouter,
  cariBarang: cariBarangRouter,
  permintaanBarang: permintaanBarangRouter,
  permintaanPembelian: permintaanPembelianRouter,
  permintaanPenawaran: permintaanPenawaranRouter,
  penawaranHarga: penawaranHargaRouter,
  evaluasiHarga: evaluasiHargaRouter,
  po: purchaseOrderRouter,
  vendor: vendorRouter
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
