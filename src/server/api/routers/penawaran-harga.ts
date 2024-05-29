import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";
import { STATUS } from "@/lib/status";
import sendWhatsAppMessage from "@/lib/send-whatsapp";
import { v4 as uuidv4 } from 'uuid'
import formatPhoneNumber from "@/lib/formatPhoneNumber";
// import isTodayOrAfter from "@/lib/isTodayOrAfter";

export const penawaranHargaRouter = createTRPCRouter({
  getAll: protectedProcedure
    .query(async ({ ctx }) => {
      const result = await ctx.db.penawaranHarga.findMany({
        orderBy: {
          createdAt: "desc"
        },
        include: {
          PermintaanPenawaran: {
            include: {
              Pembelian: {
                include: {
                  PermintaanPembelianBarang: true
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

      return result?.map((v) => ({
        ...v,
        jumlah: v.PermintaanPenawaran.Pembelian.PermintaanPembelianBarang.length,
        tanggal: v.createdAt.toLocaleDateString()
      }))
    }),
  get: protectedProcedure
    .input(z.object({
      id: z.string()
    }))
    .query(async ({ ctx, input }) => {
      const { id } = input

      const result = await ctx.db.penawaranHarga.findFirst({
        where: {
          id
        },
        include: {
          PermintaanPenawaran: {
            include: {
              Pembelian: {
                include: {
                  PermintaanPembelianBarang: {
                    include: {
                      PenawaranHargaBarangNego: true,
                      PermintaanPenawaranBarangVendor: {
                        where: { harga: { not: null } },
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

      const barang = result.PermintaanPenawaran.Pembelian.PermintaanPembelianBarang.map((v) => ({
        id: v.id,
        name: v.MasterBarang.name,
        kode: v.MasterBarang.fullCode,
        image: v.MasterBarang.image ?? '',
        uom: v.MasterBarang.Uom.name,
        qty: v.qty,
        hargaNego: v.PenawaranHargaBarangNego?.hargaNego ?? 0,
        jumlahVendor: v.PermintaanPenawaranBarangVendor.length,
        vendor: v.PermintaanPenawaranBarangVendor.map((a) => ({
          name: a.Vendor.Vendor.name,
          harga: a.harga,
          total: a.totalHarga
        }))
      }))

      return {
        id: result.id,
        no: result.no,
        permintaanPenawaran: {
          id: result.PermintaanPenawaran.id,
          no: result.PermintaanPenawaran.no
        },
        barang,
        status: result.status,
        tanggal: result.createdAt.toLocaleDateString(),
        getVendors: getVendors ?? [],
        // TODO: hapus ini
        canSend: true,
        // canSend: isTodayOrAfter(result.PermintaanPenawaran.deadline),
        penawaranDeadline: result.PermintaanPenawaran.deadline?.toLocaleDateString(),
        deadline: result.deadline?.toLocaleDateString()
      }
    }),
  send: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        deadline: z.date(),
        barang: z.array(z.object({
          id: z.string({ description: "Permintaan pembelian barang id" }),
          hargaNego: z.string()
        }))
      })
    )
    .mutation(async ({ ctx, input }) => {
      const {
        id,
        deadline,
        barang
      } = input

      try {

        await ctx.db.$transaction(async (tx) => {
          const penawaranResult = await tx.penawaranHarga.update({
            where: {
              id
            },
            data: {
              deadline,
              status: STATUS.SELESAI.id
            }
          })

          for (const { id, hargaNego } of barang) {
            await tx.penawaranHargaBarangNego.create({
              data: {
                pembelianBarangId: id,
                hargaNego: Number(hargaNego)
              }
            })
          }

          const asdf = await tx.permintaanPenawaranBarangVendor.findMany({
            where: {
              pembelianBarangId: {
                in: barang.map((v) => v.id)
              },
            },
            include: {
              Vendor: {
                include: {
                  Vendor: true
                }
              }
            }
          })

          const groupByPembelianBarangId = () => {
            return asdf.reduce((acc, item) => {
              // @ts-ignore
              if (!acc[item.pembelianBarangId]) {
                // @ts-ignore
                acc[item.pembelianBarangId] = [];
              }
              // @ts-ignore
              acc[item.pembelianBarangId].push(item);
              return acc;
            }, {});
          };

          const groupedItems = groupByPembelianBarangId();

          const getTheLowestPrice = (): Record<string, number | null> => {
            const result: Record<string, number | null> = {};

            for (const key in groupedItems) {
              if (groupedItems.hasOwnProperty(key)) {
                // @ts-ignore
                const items = groupedItems[key];

                // Sort items by harga in ascending order, ignoring null values
                const sortedItems = items
                  .filter((item: any) => item.harga !== null)
                  .sort((a: any, b: any) => (a.harga as number) - (b.harga as number));

                // Get the three lowest prices
                result[key] = sortedItems.slice(0, 3).map((v: any) => ({
                  ...v,
                  vendor: v.Vendor.Vendor
                }));
              }
            }

            return result;
          };

          const lowestPrices = getTheLowestPrice();

          function getUniqueVendors() {
            const vendorsMap = new Map();

            for (const key in lowestPrices) {
              // @ts-ignore
              lowestPrices[key].forEach(item => {
                const vendor = item.vendor;
                if (!vendorsMap.has(vendor.id)) {
                  vendorsMap.set(vendor.id, {
                    ...vendor,
                    pembelianBarangId: []
                  });
                }
                vendorsMap.get(vendor.id).pembelianBarangId.push(item.pembelianBarangId);
              });
            }

            return Array.from(vendorsMap.values());
          }

          for (const { id, pembelianBarangId } of getUniqueVendors()) {
            const url = uuidv4()

            const result = await tx.penawaranHargaVendor.create({
              data: {
                url,
                vendorId: id,
                penawaranId: penawaranResult.id,
                PenawaranHargaBarangVendor: {
                  createMany: {
                    data: pembelianBarangId.map((v: string) => ({
                      pembelianBarangId: v,
                    }))
                  }
                }
              },
              include: {
                PenawaranHargaBarangVendor: {
                  include: {
                    PembelianBarang: {
                      include: {
                        MasterBarang: true
                      }
                    }
                  }
                },
                Vendor: true
              }
            })
            const barang = result.PenawaranHargaBarangVendor.map((v) => v.PembelianBarang.MasterBarang.name)

            const message = `
          *ASSETPRO - YAYASAN ALFIAN HUSIN*

Melakukan penawaran harga pada barang.
${barang.map((v, i) => `${i + 1}. ${v}`).join('\n')}

Silahkan klik link berikut untuk mengirim penawaran harga.
https://assetpro.site/vendor/ph/${result.id}`

            sendWhatsAppMessage(formatPhoneNumber(result.Vendor.whatsapp), message)
          }
          // EVALUASI CREATE


        })

        return {
          ok: true,
          message: 'Berhasil mengirim harga penawaran'
        }

      } catch (error) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Tidak ada form ini",
          cause: error
        });
      }
    })
})

