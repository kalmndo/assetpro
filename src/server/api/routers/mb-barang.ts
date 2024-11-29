import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const mbBarangRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const result = await ctx.db.masterBarang.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        SubSubKategori: {
          include: {
            SubKategori: {
              include: {
                Kategori: true,
              },
            },
          },
        },
      },
    });

    return result.map((v) => ({
      ...v,
      kode: `${v.classCode}.${v.code}`,
      subSubKategori: v.SubSubKategori.name,
      subKategoriId: v.SubSubKategori.SubKategori.id,
      kategoriId: v.SubSubKategori.SubKategori.kategoriId,
      golonganId: v.SubSubKategori.SubKategori.Kategori.golonganId,
    }));
  }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        image: z.string().nullable(),
        code: z.string(),
        subSubKategoriId: z.string(),
        classCode: z.string(),
        uomId: z.string(),
        deskripsi: z.string(),
        isUser: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const {
        name,
        image,
        code,
        subSubKategoriId,
        classCode,
        uomId,
        deskripsi,
        isUser,
      } = input;

      console.log("code ", code);
      console.log("isUser ", isUser);
      try {
        const transaction = await ctx.db.$transaction(async (tx) => {
          let theCode = Number(code);

          if (isUser) {
            const masterBarang = await tx.masterBarang.findMany({
              where: {
                classCode,
              },
            });

            const codes = masterBarang.map((v) => v.code);
            if (codes.length > 0) {
              // Sort the array to ensure the numbers are in ascending order
              codes.sort((a, b) => a - b);

              // Iterate through the array to find the first missing number
              for (let i = 0; i < codes.length - 1; i++) {
                if (codes[i + 1]! - codes[i]! > 1) {
                  theCode = codes[i]! + 1;
                }
              }

              // If no missing number is found in the loop, return the next number after the maximum
              theCode = codes[codes.length - 1]! + 1;
            }
          }

          const result = await tx.masterBarang.create({
            data: {
              name,
              image,
              code: theCode,
              subSubKategoriId,
              classCode,
              fullCode: `${classCode}.${theCode}`,
              uomId,
              deskripsi,
            },
            include: {
              Uom: true,
            },
          });

          if (Number(classCode.split(".")[0]) === 1) {
            await tx.daftarAsetGroup.create({
              data: {
                booked: 0,
                idle: 0,
                used: 0,
                id: result.id,
              },
            });
          } else {
            await tx.kartuStok.create({
              data: {
                qty: 0,
                id: result.id,
                // TODO: ganti ini
                harga:0,
                total:0
              },
            });
          }

          return {
            ...result,
            kode: result.fullCode,
            kodeAnggaran: [],
            qty: "1",
            uom: result.Uom.name,
            golongan: classCode.split(".")[0] === "1" ? 1 : 2,
          };
        });

        return {
          ok: true,
          message: "Berhasil menambah barang",
          data: transaction,
        };
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === "P2002") {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Kode barang ini sudah ada, harap ubah.",
              cause: error,
            });
          }
        }
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
        image: z.string().nullable(),
        code: z.string(),
        subSubKategoriId: z.string(),
        classCode: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, name, image, code, subSubKategoriId, classCode } = input;

      try {
        await ctx.db.masterBarang.update({
          where: {
            id,
          },
          data: {
            name,
            image,
            code: Number(code),
            subSubKategoriId,
            classCode,
            fullCode: `${classCode}.${code}`,
          },
        });
        return {
          ok: true,
          message: "Berhasil mengubah barang kategori",
        };
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === "P2002") {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Kode barang ini sudah ada, harap ubah.",
              cause: error,
            });
          }
        }
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
        await ctx.db.masterBarang.delete({
          where: { id },
        });
        return {
          ok: true,
          message: "Berhasil menghapus barang",
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
