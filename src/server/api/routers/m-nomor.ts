
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const mNomor = createTRPCRouter({
  getNomor: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const {
        id
      } = input

      const result = await ctx.db.masterNomor.findFirst({
        where: {
          id
        }
      })

      if (!result) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Nomor tidak ada",
        });
      }

      // internal memo
      // const format = result.format

      // list penomoran
      // nomor urut (1 - 1000000) NOMOR
      // nomor urut romawi (I - MMCX) NOMORX
      // tanggal (1 - 31) DD
      // tanggal romawi (X - XXXI) DDX
      // bulan (1 - 12) MM
      // bulan (JAN - DES) MMM
      // bulan (JANUARI - DESEMBER) MMMM
      // bulan (I - XII) MMX
      // tahun (21 - 25) YY
      // tahun (2021 - 2025) YYYY
      // tahun (XXI - XXV) YYX
      // tahun (MMXXI - MMXXV) YYYYX
      // department DEP
      // department- unit DEPU



      result?.format

      return ''
    }),
});

// jika nomor otomatis
//  jika tidak pernah reset increment currentNumber
//  jika reset perbulan, dan hari ini tanggal nya, dan currentMonth lebih kecil dari bulan ini
//    ulang dari 1
//  jika reset pertahun dan hari ini tanggal & bulan nya, dan currentYear lebih kecil dari tahun ini
//    ulang dari 1
// jika nomor tidak otomatis wajib input nomor
