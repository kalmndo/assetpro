import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";
import { STATUS } from "@/lib/status";
import sendWhatsAppMessage from "@/lib/send-whatsapp";
import { v4 as uuidv4 } from "uuid";
import formatPhoneNumber from "@/lib/formatPhoneNumber";
import isTodayOrAfter from "@/lib/isTodayOrAfter";
import PENOMORAN from "@/lib/penomoran";
import getPenomoran from "@/lib/getPenomoran";
import notifDesc from "@/lib/notifDesc";
import { getPusherInstance } from "@/lib/pusher/server";
// import isTodayOrAfter from "@/lib/isTodayOrAfter";
const pusherServer = getPusherInstance();

export const penawaranHargaRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const result = await ctx.db.penawaranHarga.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        PermintaanPenawaran: {
          include: {
            Pembelian: {
              include: {
                PermintaanPembelianBarang: true,
              },
            },
          },
        },
      },
    });

    if (!result) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Tidak ada form ini",
      });
    }

    return result?.map((v) => ({
      ...v,
      jumlah: v.PermintaanPenawaran.Pembelian.PermintaanPembelianBarang.length,
      tanggal: v.createdAt.toLocaleDateString(),
    }));
  }),
  get: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { id } = input;

      const result = await ctx.db.penawaranHarga.findFirst({
        where: {
          id,
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
                              Vendor: true,
                            },
                          },
                        },
                      },
                      MasterBarang: {
                        include: {
                          Uom: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!result) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Tidak ada form ini",
        });
      }

      let getVendors;

      const isPengajuan = result.status === STATUS.MENUNGGU.id;

      if (isPengajuan) {
        getVendors = await ctx.db.vendor.findMany();
      } else {
        const res = await ctx.db.penawaranHargaVendor.findMany({
          where: { penawaranId: id },
          include: {
            Vendor: true,
          },
        });

        getVendors = res.map((v) => ({
          url: v.id,
          status: v.status,
          ...v.Vendor,
        }));
      }

      const barang =
        result.PermintaanPenawaran.Pembelian.PermintaanPembelianBarang.map(
          (v) => ({
            id: v.id,
            name: v.MasterBarang.name,
            kode: v.MasterBarang.fullCode,
            image: v.MasterBarang.image ?? "",
            uom: v.MasterBarang.Uom.name,
            qty: v.qty,
            hargaNego: v.PenawaranHargaBarangNego?.hargaNego ?? 0,
            jumlahVendor: v.PermintaanPenawaranBarangVendor.length,
            vendor: v.PermintaanPenawaranBarangVendor.map((a) => ({
              name: a.Vendor.Vendor.name,
              harga: a.harga,
              total: a.totalHarga,
              catatan: a.catatan,
              garansi: a.garansi,
              termin: a.termin,
              delivery: a.delivery,
            })),
          }),
        );

      return {
        id: result.id,
        no: result.no,
        permintaanPenawaran: {
          id: result.PermintaanPenawaran.id,
          no: result.PermintaanPenawaran.no,
        },
        barang,
        status: result.status,
        tanggal: result.createdAt.toLocaleDateString(),
        getVendors: getVendors ?? [],
        canSend:
          isTodayOrAfter(result.PermintaanPenawaran.deadline) &&
          result.status === STATUS.MENUNGGU.id,
        penawaranDeadline:
          result.PermintaanPenawaran.deadline?.toLocaleDateString(),
        deadline: result.deadline?.toLocaleDateString(),
        // @ts-ignore
        unsendVendors: isPengajuan ? [] : getVendors.filter((v) => !v.status),
      };
    }),
  send: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        deadline: z.date(),
        barang: z.array(
          z.object({
            id: z.string({ description: "Permintaan pembelian barang id" }),
            hargaNego: z.number(),
            catatan: z.string().optional(),
            termin: z.string().optional(),
            delivery: z.string().optional(),
            garansi: z.string().optional(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, deadline, barang } = input;

      try {
        await ctx.db.$transaction(async (tx) => {
          const penawaranResult = await tx.penawaranHarga.update({
            where: {
              id,
            },
            data: {
              deadline,
              status: STATUS.SELESAI.id,
            },
          });

          const permintaanPembelianBarangIds = barang.map((v) => v.id);

          const pBSPBB = await tx.pBSPBB.findMany({
            where: {
              pembelianBarangId: { in: permintaanPembelianBarangIds },
            },
          });

          for (const { barangSplitId } of pBSPBB) {
            await tx.permintaanBarangBarangSplitHistory.create({
              data: {
                formType: "penawaran-harga",
                barangSplitId,
                formNo: penawaranResult.no,
                desc: "Permintaan penawaran harga ke vendor",
              },
            });
          }

          for (const {
            id,
            hargaNego,
            termin,
            catatan,
            garansi,
            delivery,
          } of barang) {
            await tx.penawaranHargaBarangNego.create({
              data: {
                pembelianBarangId: id,
                hargaNego,
                termin,
                catatan,
                garansi,
                delivery,
              },
            });
          }

          const asdf = await tx.permintaanPenawaranBarangVendor.findMany({
            where: {
              pembelianBarangId: {
                in: barang.map((v) => v.id),
              },
            },
            include: {
              Vendor: {
                include: {
                  Vendor: true,
                },
              },
            },
          });

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
                  .sort(
                    (a: any, b: any) =>
                      (a.harga as number) - (b.harga as number),
                  );

                // Get the three lowest prices
                result[key] = sortedItems.slice(0, 3).map((v: any) => ({
                  ...v,
                  vendor: v.Vendor.Vendor,
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
              lowestPrices[key].forEach((item) => {
                const vendor = item.vendor;
                if (!vendorsMap.has(vendor.id)) {
                  vendorsMap.set(vendor.id, {
                    ...vendor,
                    pembelianBarangId: [],
                  });
                }
                vendorsMap
                  .get(vendor.id)
                  .pembelianBarangId.push(item.pembelianBarangId);
              });
            }

            return Array.from(vendorsMap.values());
          }

          for (const { id, pembelianBarangId } of getUniqueVendors()) {
            const url = uuidv4();

            const result = await tx.penawaranHargaVendor.create({
              data: {
                url,
                vendorId: id,
                penawaranId: penawaranResult.id,
                PenawaranHargaBarangVendor: {
                  createMany: {
                    data: pembelianBarangId.map((v: string) => ({
                      pembelianBarangId: v,
                    })),
                  },
                },
              },
              include: {
                PenawaranHargaBarangVendor: {
                  include: {
                    PembelianBarang: {
                      include: {
                        MasterBarang: true,
                      },
                    },
                  },
                },
                Vendor: true,
              },
            });
            const barang = result.PenawaranHargaBarangVendor.map(
              (v) => v.PembelianBarang.MasterBarang.name,
            );

            const message = `
          *ASSETPRO - YAYASAN ALFIAN HUSIN*

Melakukan penawaran harga pada barang.
${barang.map((v, i) => `${i + 1}. ${v}`).join("\n")}

Silahkan klik link berikut untuk mengirim penawaran harga.
https://assetpro.site/vendor/ph/${result.id}`;

            sendWhatsAppMessage(
              formatPhoneNumber(result.Vendor.whatsapp),
              message,
            );
          }
          let penomoran = await tx.penomoran.findUnique({
            where: {
              id: PENOMORAN.EVALUASI_HARGA,
              year: String(new Date().getFullYear())
            }
          })

          if (!penomoran) {
            penomoran = await tx.penomoran.create({
              data: {
                id: PENOMORAN.EVALUASI_HARGA,
                code: "FEPHB",
                number: 0,
                year: String(new Date().getFullYear())
              }
            })
          }

          // EVALUASI CREATE
          const evaluasi = await tx.evaluasi.create({
            data: {
              no: getPenomoran(penomoran),
              status: STATUS.PENGAJUAN.id,
              penawaranHargaId: penawaranResult.id,
            },
          });

          if (evaluasi) {
            await tx.penomoran.update({
              where: {
                id: PENOMORAN.EVALUASI_HARGA,
                year: String(new Date().getFullYear())
              },
              data: {
                number: { increment: 1 }
              }
            })
          }

          await tx.evaluasiBarang.createMany({
            data: barang.map((v) => ({
              evaluasiId: evaluasi.id,
              pembelianBarangId: v.id,
            })),
          });

          const allRoles = await tx.masterEvaluasiUser.findMany({
            orderBy: {
              nilai: 'asc'
            }
          })
          const user = await tx.user.findFirst({
            where: {
              id: ctx.session.user.id
            }
          })

          const notification = await tx.notification.create({
            data: {
              fromId: ctx.session.user.id,
              toId: allRoles[0]!.userId,
              link: `/pengadaan/evaluasi-harga/${evaluasi.id}`,
              desc: notifDesc(user!.name, "Evaluasi harga vendor", evaluasi.no),
              isRead: false,
            }
          })

          await pusherServer.trigger(
            allRoles[0]!.userId,
            "notification",
            {
              id: notification.id,
              fromId: ctx.session.user.id,
              toId: allRoles[0]!.userId,
              link: `/pengadaan/evaluasi-harga/${evaluasi.id}`,
              desc: notifDesc(user!.name, "Evaluasi harga vendor", evaluasi.no),
              isRead: false,
              createdAt: notification.createdAt,
              From: {
                image: user?.image,
                name: user?.name
              },
            }
          )
        },
          {
            maxWait: 5000, // default: 2000
            timeout: 10000, // default: 5000
          }
        );

        return {
          ok: true,
          message: "Berhasil mengirim harga penawaran",
        };
      } catch (error) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Tidak ada form ini",
          cause: error,
        });
      }
    }),
});
