import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";
import { STATUS } from "@/lib/status";
import sendWhatsAppMessage from "@/lib/send-whatsapp";
import { v4 as uuidv4 } from 'uuid'

export const permintaanPenawaranRouter = createTRPCRouter({
  getAll: protectedProcedure
    .query(async ({ ctx }) => {
      const result = await ctx.db.permintaanPenawaran.findMany({
        orderBy: {
          createdAt: "desc"
        },
        include: {
          Pembelian: {
            include: {
              PermintaanPembelianBarang: true
            }
          }
        }
      })

      if (!result) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Tidak ada form ini",
        });
      }

      return result?.map((v) => ({
        ...v,
        jumlah: v.Pembelian.PermintaanPembelianBarang.length,
        tanggal: v.createdAt.toLocaleDateString()
      }))
    }),
  get: protectedProcedure
    .input(z.object({
      id: z.string()
    }))
    .query(async ({ ctx, input }) => {
      const { id } = input

      const result = await ctx.db.permintaanPenawaran.findUnique({
        where: {
          id
        },
        include: {
          Pembelian: {
            include: {
              PermintaanPembelianBarang: {
                include: {
                  PermintaanPenawaranBarangVendor: {
                    include: {
                      Vendor: {
                        include: {
                          Vendor: true
                        }
                      }
                    }
                  },
                  MasterBarang: {
                    include: {
                      Uom: true
                    }
                  },
                }
              }
            }
          }
        }
      })

      if (!result) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Tidak ada form ini",
        });
      }

      let getVendors

      if (result.status === STATUS.MENUNGGU.id) {
        getVendors = await ctx.db.vendor.findMany()
      }

      const barang = result.Pembelian.PermintaanPembelianBarang.map((v) => ({
        id: v.id,
        name: v.MasterBarang.name,
        kode: v.MasterBarang.fullCode,
        image: v.MasterBarang.image ?? '',
        uom: v.MasterBarang.Uom.name,
        qty: v.qty,
        jumlahVendor: v.PermintaanPenawaranBarangVendor.length,
        vendorTerpilih: v.PermintaanPenawaranBarangVendor.map((a) => a.Vendor.Vendor.id)
      }))

      return {
        id: result.id,
        no: result.no,
        permintaanPembelian: {
          id: result.Pembelian.id,
          no: result.Pembelian.no
        },
        barang,
        status: result.status,
        tanggal: result.createdAt.toLocaleDateString(),
        getVendors: getVendors ?? []
      }
    }),
  send: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        deadline: z.date(),
        barang: z.array(z.object({
          id: z.string({ description: "Permintaan pembelian barang id" }),
          vendorTerpilih: z.array(z.string())
        }))
      })
    )
    .mutation(async ({ ctx, input }) => {
      const {
        id,
        deadline,
        barang
      } = input

      const vendors = () => {
        const result = {};

        barang.forEach(({ id, vendorTerpilih }) => {
          vendorTerpilih.forEach(value => {
            // @ts-ignore
            result[value] = result[value] || [];
            // @ts-ignore
            result[value].push(id);
          });
        });

        return Object.keys(result).map(key => ({
          vendorId: key,
          // @ts-ignore
          barangIds: result[key] as string[],
        }));
      };

      const url = uuidv4()
      const message =
        `
*ASSETPRO - YAYASAN ALFIAN HUSIN*
      
Permintaan penawaran harga barang.
1. Printer
2. Ram ssd

Silahkan klik link berikut untuk mengirim penawaran harga.
https://assetpro.site/vendor/pp/${url}
      `
      await sendWhatsAppMessage('+6281272035456', message)

      // try {

      //   await ctx.db.$transaction(async (tx) => {
      //     const penawaranResult = await tx.permintaanPenawaran.update({
      //       where: {
      //         id
      //       },
      //       data: {
      //         deadline,
      //         status: STATUS.SELESAI.id
      //       }
      //     })

      //     for (const { vendorId, barangIds } of vendors()) {
      //       await tx.permintaanPenawaranVendor.create({
      //         data: {
      //           url: '',
      //           vendorId,
      //           penawaranId: penawaranResult.id,
      //           PermintaanPenawaranBarangVendor: {
      //             createMany: {
      //               data: barangIds.map((v) => ({
      //                 pembelianBarangId: v,
      //               }))
      //             }
      //           }
      //         },
      //         include: {
      //           PermintaanPenawaranBarangVendor: true
      //         }
      //       })

      //     }
      // CREATE PENAWARAN HARGA STATUS WAITING

      //   })

      // } catch (error) {

      // }

    })
})