import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";
import { STATUS } from "@/lib/status";
import sendWhatsAppMessage from "@/lib/send-whatsapp";
import { v4 as uuidv4 } from "uuid";
import formatPhoneNumber from "@/lib/formatPhoneNumber";
import PENOMORAN from "@/lib/penomoran";
import getPenomoran from "@/lib/getPenomoran";
import { ROLE } from "@/lib/role";
import notifDesc from "@/lib/notifDesc";
import { getPusherInstance } from "@/lib/pusher/server";
import { notificationQueue } from "@/app/api/queue/notification/route";
const pusherServer = getPusherInstance();

export const permintaanPenawaranRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const result = await ctx.db.permintaanPenawaran.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        Pembelian: {
          include: {
            PermintaanPembelianBarang: true,
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
      jumlah: v.Pembelian.PermintaanPembelianBarang.length,
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

      const result = await ctx.db.permintaanPenawaran.findUnique({
        where: {
          id,
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
      });

      if (!result) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Tidak ada form ini",
        });
      }

      let getVendors;

      const isPengajuan = result.status === STATUS.PENGAJUAN.id;

      if (isPengajuan) {
        getVendors = await ctx.db.vendor.findMany();
      } else {
        const res = await ctx.db.permintaanPenawaranVendor.findMany({
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

      const barang = result.Pembelian.PermintaanPembelianBarang.map((v) => ({
        id: v.id,
        name: v.MasterBarang.name,
        kode: v.MasterBarang.fullCode,
        image: v.MasterBarang.image ?? "",
        uom: v.MasterBarang.Uom.name,
        qty: v.qty,
        jumlahVendor: v.PermintaanPenawaranBarangVendor.length,
        vendorTerpilih: v.PermintaanPenawaranBarangVendor.map(
          (a) => a.Vendor.Vendor.id,
        ),
      }));

      return {
        id: result.id,
        no: result.no,
        permintaanPembelian: {
          id: result.Pembelian.id,
          no: result.Pembelian.no,
        },
        barang,
        status: result.status,
        tanggal: result.createdAt.toLocaleDateString(),
        getVendors: getVendors ?? [],
        deadline: result.deadline?.toLocaleDateString(),
        // @ts-ignore
        unsendVendors: isPengajuan ? [] : getVendors.filter((v) => !v.status),
      };
    }),

  changeDate: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        deadline: z.date(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, deadline } = input
      try {

        const penawaranResult = await ctx.db.permintaanPenawaran.update({
          where: {
            id,
          },
          data: {
            deadline,
            status: STATUS.SELESAI.id,
          },
        });

        return {
          ok: true,
          message: "Berhasil mengubah tanggal permintaan penawaran",
        };

      } catch (error) {
        console.log("err", error)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Tidak ada form ini",
        });
      }
    }),
  send: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        deadline: z.date(),
        barang: z.array(
          z.object({
            id: z.string({ description: "Permintaan pembelian barang id" }),
            vendorTerpilih: z.array(z.string()),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, deadline, barang } = input;

      const vendors = () => {
        const result = {};

        barang.forEach(({ id, vendorTerpilih }) => {
          vendorTerpilih.forEach((value) => {
            // @ts-ignore
            result[value] = result[value] || [];
            // @ts-ignore
            result[value].push(id);
          });
        });

        return Object.keys(result).map((key) => ({
          vendorId: key,
          // @ts-ignore
          barangIds: result[key] as string[],
        }));
      };

      try {

        const allRoles = await ctx.db.userRole.findMany({ where: { roleId: ROLE.NEGO_SUBMIT.id } })
        const userIds = allRoles.map((v) => v.userId).filter((v) => v !== ctx.session.user.id)
        const user = await ctx.db.user.findFirst({
          where: {
            id: ctx.session.user.id
          }
        })


        const result = await ctx.db.$transaction(async (tx) => {
          const penawaranResult = await tx.permintaanPenawaran.update({
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
                formType: "permintaan-penawaran",
                barangSplitId,
                formNo: penawaranResult.no,
                desc: "Permintaan harga penawaran ke vendor",
              },
            });
          }

          for (const { vendorId, barangIds } of vendors()) {
            const url = uuidv4();

            const result = await tx.permintaanPenawaranVendor.create({
              data: {
                url,
                vendorId,
                penawaranId: penawaranResult.id,
                PermintaanPenawaranBarangVendor: {
                  createMany: {
                    data: barangIds.map((v) => ({
                      pembelianBarangId: v,
                    })),
                  },
                },
              },
              include: {
                PermintaanPenawaranBarangVendor: {
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
            const barang = result.PermintaanPenawaranBarangVendor.map(
              (v) => v.PembelianBarang.MasterBarang.name,
            );

            const message = `
*ASSETPRO - YAYASAN ALFIAN HUSIN*
      
Permintaan penawaran harga barang.
${barang.map((v, i) => `${i + 1}. ${v}`).join("\n")}

Silahkan klik link berikut untuk mengirim penawaran harga.
https://assetpro.site/vendor/pp/${result.id}`;

            // sendWhatsAppMessage(formatPhoneNumber(result.Vendor.nohp ?? ''), message);
          }

          const penomoran = await tx.penomoran.upsert({
            where: { id: PENOMORAN.PENAWARAN_HARGA, year: String(new Date().getFullYear()) },
            update: { number: { increment: 1 } },
            create: { id: PENOMORAN.PENAWARAN_HARGA, code: 'FPH', number: 0, year: String(new Date().getFullYear()) },
          });

          const permPem = await tx.penawaranHarga.create({
            data: {
              no: getPenomoran(penomoran),
              status: STATUS.MENUNGGU.id,
              penawaranId: penawaranResult.id,
            },
          });

          const notifications = await tx.notification.createManyAndReturn({
            data: userIds.map((v) => ({
              fromId: ctx.session.user.id,
              toId: v,
              link: `/pengadaan/penawaran-harga/${permPem.id}`,
              desc: notifDesc(user!.name, "Negosiasi ke vendor", permPem.no),
              isRead: false,
            }
            ))
          })

          return {
            notifications
          }

        },
          {
            maxWait: 5000, // default: 2000
            timeout: 10000, // default: 5000
          }
        );
        const { notifications } = result

        Promise.all(
          notifications.map((v) => (
            pusherServer.trigger(
              v.toId,
              "notification",
              {
                id: v.id,
                fromId: user?.id,
                toId: v.toId,
                link: v.link,
                desc: v.desc,
                isRead: false,
                createdAt: v.createdAt,
                From: {
                  image: user?.image,
                  name: user?.name
                },
              }
            )

          )))
        return {
          ok: true,
          message: "Berhasil mengirim permintaan penawaran",
        };
      } catch (error) {
        console.log("err", error)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Tidak ada form ini",
        });
      }
    }),
});

