import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { Prisma } from "@prisma/client";
import { STATUS, getStatus } from "@/lib/status";
import { ROLE } from "@/lib/role";
import checkKetersediaanByBarang from "../shared/check-ketersediaan-by-barang";
import formatDate from "@/lib/formatDate";
import PENOMORAN from "@/lib/penomoran";
import getPenomoran from "@/lib/getPenomoran";
import notifDesc from "@/lib/notifDesc";
import { getPusherInstance } from "@/lib/pusher/server";
import { notificationQueue } from "@/app/api/queue/notification/route";
import { SelectProps } from "@/lib/type";
const pusherServer = getPusherInstance();

export const permintaanBarangRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(
      z.object({
        isUser: z.boolean(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { isUser } = input;

      let findMany;

      if (isUser) {
        findMany = {
          where: {
            // @ts-ignore
            pemohondId: ctx.session.user.id,
          },
          orderBy: {
            createdAt: "desc" as any,
          },
          include: {
            Ruang: true,
            PermintaanBarangBarang: true,
          },
        };
      } else {
        findMany = {
          where: {
            // @ts-ignore
            NOT: { status: STATUS.PENGAJUAN.id },
          },
          orderBy: {
            createdAt: "desc",
          },
          include: {
            // @ts-ignore
            Pemohon: true,
            Ruang: true,
            PermintaanBarangBarang: true,
          },
        };
      }

      // @ts-ignore
      const result = await ctx.db.permintaanBarang.findMany(findMany);

      return result.map((v) => ({
        ...v,
        // @ts-ignore
        ruang: v.Ruang?.name,
        // @ts-ignore
        jumlah: v.PermintaanBarangBarang.length,
        tanggal: v.createdAt.toLocaleDateString(),
      }));
    }),
  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const user = await ctx.db.user.findUnique({
        where: { id: userId },
        include: {
          UserRole: true,
        },
      });
      const roles = user?.UserRole.map((v) => v.roleId);

      const { id } = input;
      const result = await ctx.db.permintaanBarang.findFirst({
        where: {
          id,
        },
        include: {
          Ruang: true,
          Pemohon: {
            include: {
              Teknisi: true,
              Department: true,
              DepartmentUnit: true,
            },
          },
          PermintaanBarangBarang: {
            include: {
              Uom: true,
              Barang: true,
              PermintaanBarangBarangKodeAnggaran: {
                include: { MasterKodeAnggaranDepartment: { include: { MasterKodeAnggaran: true } } }
              },
              PermintaanBarangBarangHistory: {
                orderBy: { createdAt: "asc" },
              },
              PermintaanBarangBarangSplit: {
                orderBy: { createdAt: "asc" },
                include: {
                  PermintaanBarangBarangSplitHistory: {
                    orderBy: { createdAt: "asc" },
                  },
                },
              },
            },
            orderBy: { createdAt: "asc" },
          },
        },
      });

      if (!result) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something wrong",
        });
      }

      const {
        no,
        perihal,
        Ruang,
        createdAt,
        status,
        Pemohon: {
          name,
          image,
          title,
          atasanId,
          Department: { name: department },
          DepartmentUnit,
          Teknisi
        },
        PermintaanBarangBarang,
      } = result;

      const barang = PermintaanBarangBarang.filter(
        (v) => v.status !== STATUS.IM_REJECT.id,
      ).map((v) => {
        const isOut =
          v.PermintaanBarangBarangSplit.map((a) => a.status).some(
            (b) => b === "out",
          ) && ctx.session.user.id === result.pemohondId;
        return {
          id: v.id,
          barangId: v.Barang.id,
          name: v.Barang.name,
          image: v.Barang.image ?? "",
          deskripsi: v.desc,
          kode: v.Barang.fullCode,
          jumlah: String(v.qty),
          uom: {
            id: v.Uom.id,
            name: v.Uom.name,
          },
          kodeAnggaran: v.PermintaanBarangBarangKodeAnggaran.map(
            (v) => `${v.MasterKodeAnggaranDepartment?.MasterKodeAnggaran.id} - ${v.MasterKodeAnggaranDepartment?.MasterKodeAnggaran.name}`,
          ),
          status: v.status,
          persetujuan: v.PermintaanBarangBarangHistory,
          isOut,
          riwayat: v.PermintaanBarangBarangSplit.map((v) => ({
            id: v.id,
            qty: v.qty,
            status: v.status,
            histories: v.PermintaanBarangBarangSplitHistory,
          })),
        };
      });

      const isAtasan =
        userId === atasanId && status === getStatus(STATUS.PENGAJUAN.id).id;
      const isImApprove =
        roles?.includes(ROLE.IM_APPROVE.id) &&
        status === getStatus(STATUS.ATASAN_SETUJU.id).id;

      const canUpdate = isAtasan || isImApprove;

      let perbaikan

      if (Teknisi) {
        const res = await ctx.db.imPerbaikan.findFirst({
          where: {
            imId: id
          },
          include: {
            Perbaikan: true
          }
        })

        perbaikan= {
          id: res?.Perbaikan.id,
          no: res?.Perbaikan.no
        }
      }

      return {
        id,
        no,
        tanggal: createdAt.toLocaleDateString("id-ID"),
        perihal,
        ruang: Ruang?.name,
        status,
        pemohon: {
          name,
          image: image ?? "",
          title,
          department,
          departmentUnit: DepartmentUnit?.name,
        },
        barang,
        canUpdate,
        isImApprove,
        perbaikan
      };
    }),
  receive: protectedProcedure
    .input(
      z.object({
        permintaanBarangId: z.string(),
        barangId: z.string(),
        imId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { permintaanBarangId, imId, barangId } = input;

      try {
        await ctx.db.$transaction(async (tx) => {
          const im = await tx.permintaanBarang.findUnique({
            where: {
              id: imId,
            },
            include: {
              PermintaanBarangBarang: {
                include: {
                  Barang: true,
                  PermintaanBarangBarangSplit: {
                    where: {
                      status: "out",
                    },
                  },
                },
              },
              FtkbItemPemohon: {
                where: {
                  status: 0,
                  FtkbItem: {
                    Barang: { id: barangId },
                  },
                },
                include: {
                  FtkbItemPemohonAset: true,
                },
              },
            },
          });

          if (!im) {
            throw new TRPCError({
              code: "BAD_GATEWAY",
              message: "Tidak ada form ini",
            });
          }

          const permintaanBarang = im.PermintaanBarangBarang.find(
            (v) => v.id === permintaanBarangId,
          );
          const ftkbItemPemohon = im.FtkbItemPemohon[0];

          const isAset =
            permintaanBarang?.Barang.fullCode.split(".")[0] === "1";
          const split = permintaanBarang?.PermintaanBarangBarangSplit.find(
            (v) => v.status === "out",
          );
          if (isAset) {
            for (const iterator of ftkbItemPemohon!.FtkbItemPemohonAset) {
              await tx.daftarAset.update({
                where: {
                  id: iterator.daftarAsetId,
                },
                data: {
                  penggunaId: im.pemohondId,
                },
              });
            }
            await tx.daftarAsetGroup.update({
              where: {
                id: barangId,
              },
              data: {
                booked: { decrement: ftkbItemPemohon?.qty },
                used: { increment: ftkbItemPemohon?.qty },
                idle: { decrement: ftkbItemPemohon?.qty },
              },
            });
          } else {
          }

          await tx.permintaanBarangBarangSplitHistory.create({
            data: {
              barangSplitId: split!.id,
              formType: "received",
              formNo: "",
              desc: "User telah terima barang",
            },
          });

          await tx.permintaanBarangBarangSplit.update({
            where: {
              id: split!.id,
            },
            data: {
              status: "received",
            },
          });

          await tx.permintaanBarangBarang.update({
            where: {
              id: permintaanBarangId,
            },
            data: {
              status: "selesai",
            },
          });

          const isAllReceived = im.PermintaanBarangBarang.filter(
            (v) => v.id !== permintaanBarangId,
          )
            .map((v) => v.status)
            .every((v) => v === "selesai");

          if (isAllReceived) {
            await tx.permintaanBarang.update({
              where: {
                id: imId,
              },
              data: {
                status: "selesai",
              },
            });
          }
        });
        return {
          ok: true,
          message: "Berhasil menerima barang",
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Kemunkingan terjadi kesalahan sistem, silahkan coba lagi",
          cause: error,
        });
      }
    }),
  create: protectedProcedure
    .input(
      z.object({
        perihal: z.string(),
        ruangId: z.string().optional(),
        formPerbaikan: z.string().optional(),
        peruntukan: z.string(),
        barang: z.array(
          z.object({
            id: z.string(),
            qty: z.string(),
            deskripsi: z.string().optional(),
            uomId: z.string(),
            kodeAnggaran: z.array(z.string()),
            golongan: z.number(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { perihal, ruangId, peruntukan, barang, formPerbaikan } = input;
      const pemohondId = ctx.session.user.id;

      const userId = ctx.session.user.id;

      const user = await ctx.db.user.findFirst({
        where: {
          id: userId,
        },
        include: {
          UserRole: true,
        },
      });

      try {
        const result = await ctx.db.$transaction(async (tx) => {

          const atasanId = user?.atasanId;


          const penomoran = await tx.penomoran.upsert({
            where: { id: PENOMORAN.IM, year: String(new Date().getFullYear()) },
            update: { number: { increment: 1 } },
            create: { id: PENOMORAN.IM, code: 'IM', number: 0, year: String(new Date().getFullYear()) },
          });

          const pb = await tx.permintaanBarang.create({
            data: {
              no: getPenomoran(penomoran),
              perihal,
              ruangId: Number(peruntukan) === 2 ? null : ruangId,
              status: STATUS.PENGAJUAN.id,
              pemohondId,
              ...(user?.UserRole.length !== 0 && {
                peruntukan: Number(peruntukan),
              }),
            },
          });

          if (formPerbaikan) {
            await tx.imPerbaikan.create({
              data: {
                imId: pb.id,
                perbaikanId: formPerbaikan
              }
            })
          }

          // Prepare data for batch insertion
          const permintaanBarangData = barang.map(({ id, qty, uomId, kodeAnggaran, deskripsi }) => ({
            barangId: id,
            status: STATUS.PENGAJUAN.id,
            permintaanId: pb.id,
            qty: Number(qty),
            qtyOrdered: 0,
            qtyOut: 0,
            uomId,
            desc: deskripsi,
            kodeAnggaran, // Keep kodeAnggaran for later processing
          }));

          // Insert all PermintaanBarangBarang records and retrieve their IDs
          const createdPbbRecords = await Promise.all(
            permintaanBarangData.map(({ kodeAnggaran, ...data }) => tx.permintaanBarangBarang.create({
              data: {
                ...data,
              },
            }))
          );

          // Prepare batch data for kodeAnggaran insertion
          const kodeAnggaranBatchData = createdPbbRecords.flatMap((pbbRecord, index) => {
            const { id: pbbId } = pbbRecord;
            return permintaanBarangData[index]!.kodeAnggaran.map((kodeAnggaranId) => ({
              kodeAnggaranId,
              pbbId,
            }));
          });

          // Insert all kodeAnggaran entries in one batch
          await tx.permintaanBarangBarangKodeAnggaran.createMany({
            data: kodeAnggaranBatchData,
          });

          const desc = `<p class="text-sm font-semibold">${user?.name}<span class="font-normal ml-[5px]">Meminta persetujuan internal memo ${pb.no}</span></p>`;
          const notification = await tx.notification.create({
            data: {
              fromId: userId,
              // TODO: Benerin ini kalau gak ada atasan
              toId: atasanId ?? userId,
              link: `/permintaan/barang/${pb.id}`,
              desc,
              isRead: false,
            },
          });


          return {
            id: pb.id,
            notification
          };
        });

        await pusherServer.trigger(
          result.notification.toId,
          "notification",
          {
            id: result.notification.id,
            fromId: user?.id,
            toId: result.notification.toId,
            link: result.notification.link,
            desc: result.notification.desc,
            isRead: false,
            createdAt: result.notification.createdAt,
            From: {
              image: user?.image,
              name: user?.name
            },
          }
        )

        return {
          ok: true,
          data: { id: result.id },
          message: "Berhasil membuat permintaan barang",
        };
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === "P2002") {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "No Internal Memo ini sudah terdaftar, harap ubah.",
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
  createQuery: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.session.user.id;
      const user = await ctx.db.user.findFirst({
        where: {
          id: userId,
        },
        include: {
          Department: true,
        },
      });
      const orgId = user?.Department.organisasiId;
      const result = await ctx.db.masterRuang.findMany({
        where: {
          orgId,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      const kodes = await ctx.db.masterKodeAnggaranDepartment.findMany({
        where: {
          departmentId: user?.departmentId,
          deletedAt: null
        },
        include: {
          MasterKodeAnggaran: true
        },
        orderBy: {
          createdAt: "desc"
        },
      })

      const kodeAnggarans = kodes.map((v) => ({
        label: `${v.MasterKodeAnggaran.id} - ${v.MasterKodeAnggaran.name}`,
        value: v.id,
      }))

      const ruangs = result.map((v) => ({
        label: v.name,
        value: v.id,
      }));

      let peruntukan = [
        { value: "0", label: "Personal" },
      ]

      const isTeknisi = await ctx.db.teknisi.findFirst({
        where: {
          id: userId
        },
        include: {
          Perbaikan: {
            where: {
              status: STATUS.TEKNISI_FIXING.id
            }

          }
        }
      })

      let formPerbaikans: any[] = []

      if (isTeknisi) {
        peruntukan.push(
          { value: "2", label: "Perbaikan" },
        )
        formPerbaikans = await Promise.all(
          isTeknisi.Perbaikan.map(async (v) => {
            const dept = await ctx.db.user.findFirst({ where: { id: v.userId } })
            // Fetch kodeAnggaran data for the current Perbaikan
            const kodePer = await ctx.db.masterKodeAnggaranDepartment.findMany({
              where: {
                departmentId: dept?.departmentId, // Assuming 'v.id' refers to the departmentId
                deletedAt: null,
              },
              include: {
                MasterKodeAnggaran: true,
              },
              orderBy: {
                createdAt: "desc",
              },
            });


            // Transform kodeAnggaran data into desired format
            const kodeAnggaranPerbaikan = kodePer.map((item) => ({
              label: `${item.MasterKodeAnggaran.id} - ${item.MasterKodeAnggaran.name}`,
              value: item.id,
            }));

            // Return the transformed object for the current Perbaikan
            return {
              value: v.id,
              label: v.no,
              kodeAnggarans: kodeAnggaranPerbaikan,
            };
          })
        );
      }

      const isRole = await ctx.db.userRole.findFirst({
        where: {
          userId,
          roleId: ROLE.GUDANG_REQUEST_VIEW.id
        }
      })

      if (isRole) {
        peruntukan.push(
          { value: "1", label: "Stock" },
        )
      }

      return {
        kodeAnggarans,
        ruangs,
        peruntukan,
        formPerbaikans
      }
    }),
  approve: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        update: z
          .array(
            z.object({
              id: z.string(),
              qty: z.string(),
              uomId: z.string(),
              catatan: z.string(),
            }),
          )
          .nullable(),
        reject: z
          .array(
            z.object({
              id: z.string(),
              catatan: z.string(),
            }),
          )
          .nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, update, reject } = input;

      const userId = ctx.session.user.id;
      const user = await ctx.db.user.findUnique({
        where: {
          id: userId,
        },
        include: {
          UserRole: true,
        },
      });

      const res = await ctx.db.permintaanBarang.findUnique({
        where: {
          id,
        },
        include: {
          Pemohon: true,
        },
      });

      if (!res) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Permintaan Barang ini tidak ada",
        });
      }

      const isAtasan =
        res.Pemohon.atasanId === userId &&
        res.status === getStatus(STATUS.PENGAJUAN.id).id;
      const canEdit =
        user?.UserRole.some((v) => v.roleId === ROLE.IM_APPROVE.id) &&
        res.status === getStatus(STATUS.ATASAN_SETUJU.id).id;

      const status = isAtasan ? STATUS.ATASAN_SETUJU.id : STATUS.IM_APPROVE.id;

      if (!isAtasan && !canEdit) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Kamu tidak punya hak untuk melakukan ini",
        });
      }

      try {
        const result = await ctx.db.$transaction(async (tx) => {
          const pb = await tx.permintaanBarang.update({
            where: { id },
            data: {
              status: status,
            },
            include: {
              PermintaanBarangBarang: {
                include: {
                  Barang: true,
                },
              },
            },
          });
          const updateRejectBarangs = [
            ...(update ?? []),
            ...(reject ?? []),
          ].map((v) => v.id);
          const untouchedBarangs = pb.PermintaanBarangBarang.filter(
            (v) =>
              !updateRejectBarangs.includes(v.id) &&
              v.status !== STATUS.IM_REJECT.id,
          );
          // <p class="text-sm font-semibold">Adam Kalalmondo<span class="font-normal ml-2">meminta persetujuan internal memo</span></p>
          if (untouchedBarangs.length > 0) {
            for (const iterator of untouchedBarangs) {
              const qty = Number(iterator.qty);
              await tx.permintaanBarangBarang.update({
                where: {
                  id: iterator.id,
                },
                data: {
                  status: STATUS.IM_APPROVE.id,
                },
              });

              if (!isAtasan) {
                const prevBarang = pb.PermintaanBarangBarang.find(
                  (v) => v.id === iterator.id,
                );

                await tx.permintaanBarangBarangGroup.upsert({
                  where: {
                    barangId: prevBarang?.barangId,
                  },
                  create: {
                    barangId: prevBarang!.barangId,
                    qty,
                    permintaanBarang: [prevBarang!.id],
                    golongan: Number(prevBarang!.Barang.fullCode.split(".")[0]),
                    ordered: 0,
                  },
                  update: {
                    qty: { increment: Number(qty) },
                    permintaanBarang: { push: prevBarang!.id },
                  },
                });

                if (Number(prevBarang!.Barang.fullCode.split(".")[0]) === 1) {
                  const dag = await tx.daftarAsetGroup.findFirst({
                    where: {
                      id: prevBarang?.barangId,
                    },
                  });
                  if (!dag) {
                    await tx.daftarAsetGroup.create({
                      data: {
                        id: prevBarang!.barangId,
                        idle: 0,
                        used: 0,
                        booked: 0,
                      },
                    });
                  }
                }
              }
            }
            await tx.permintaanBarangBarangHistory.createMany({
              data: untouchedBarangs.map((v) => {
                const { monthName, day, hours, minutes } = formatDate(
                  new Date(),
                );
                return {
                  pbbId: v.id,
                  desc: `

<div class="aspect-square w-3 bg-primary rounded-full absolute left-0 translate-x-[-29.5px] z-10 top-1" /></div>
<div class="font-medium">${day}, ${monthName} ${hours}:${minutes} WIB</div>
<div class="">${user?.name} menyutujui permintaan barang</div>
<div class="text-muted-foreground">
Menyutujui permintaan barang
</div>`,
                  status: STATUS.IM_APPROVE.id,
                };
              }),
            });
          }

          if (update) {
            for (const iterator of update) {
              const qty = Number(iterator.qty);
              await tx.permintaanBarangBarang.update({
                where: {
                  id: iterator.id,
                },
                data: {
                  status: STATUS.IM_APPROVE.id,
                  qty,
                  uomId: iterator.uomId,
                },
              });
              if (!isAtasan) {
                const prevBarang = pb.PermintaanBarangBarang.find(
                  (v) => v.id === iterator.id,
                );

                await tx.permintaanBarangBarangGroup.upsert({
                  where: {
                    barangId: prevBarang?.barangId,
                  },
                  create: {
                    barangId: prevBarang!.barangId,
                    qty,
                    permintaanBarang: [prevBarang!.id],
                    golongan: Number(prevBarang!.Barang.fullCode.split(".")[0]),
                    ordered: 0,
                  },
                  update: {
                    qty: { increment: Number(qty) },
                    permintaanBarang: { push: prevBarang!.id },
                  },
                });

                if (Number(prevBarang!.Barang.fullCode.split(".")[0]) === 1) {
                  const dag = await tx.daftarAsetGroup.findFirst({
                    where: {
                      id: prevBarang?.barangId,
                    },
                  });
                  if (!dag) {
                    await tx.daftarAsetGroup.create({
                      data: {
                        id: prevBarang!.barangId,
                        idle: 0,
                        used: 0,
                        booked: 0,
                      },
                    });
                  }
                }
              }
            }

            await tx.permintaanBarangBarangHistory.createMany({
              data: update.map((v) => {
                const { day, hours, minutes, monthName } = formatDate(
                  new Date(),
                );
                return {
                  pbbId: v.id,
                  desc: ` 

<div class="aspect-square w-3 bg-primary rounded-full absolute left-0 translate-x-[-29.5px] z-10 top-1"></div>
<div class="font-medium">${day}, ${monthName} ${hours}:${minutes} WIB</div>
<div class="">${user?.name} menyutuji dan melakukan perubahan</div>
<div class="text-muted-foreground">
Menyutujui permintaan dan melakukan perubahan jumlah item menjadi ${v.qty}
</div>
<div class="text-muted-foreground">
Catatan: ${v.catatan}
</div>`,
                  status: STATUS.IM_APPROVE.id,
                };
              }),
            });
          }

          if (reject) {
            for (const iterator of reject) {
              await tx.permintaanBarangBarang.update({
                where: {
                  id: iterator.id,
                },
                data: {
                  status: STATUS.IM_REJECT.id,
                },
              });
            }

            await tx.permintaanBarangBarangHistory.createMany({
              data: reject.map((v) => {
                const { day, hours, minutes, monthName } = formatDate(
                  new Date(),
                );
                return {
                  pbbId: v.id,
                  desc: `
<div class="aspect-square w-3 bg-primary rounded-full absolute left-0 translate-x-[-29.5px] z-10 top-1" />
<div class="font-medium">${day}, ${monthName} ${hours}:${minutes} WIB</div>
<div class="">${user?.name} menolak permintaan barang</div>
<div class="text-muted-foreground">
Catatan: ${v.catatan}
</div>`,
                  status: STATUS.IM_REJECT.id,
                };
              }),
            });
          }

          let notificationData = []

          if (isAtasan) {
            const allRoles = await tx.userRole.findMany({ where: { roleId: ROLE.IM_APPROVE.id } })
            const userIds = allRoles.map((v) => v.userId)

            const notifications = await tx.notification.createManyAndReturn({
              data: userIds.map((v) => ({
                fromId: userId,
                toId: v,
                link: `/permintaan/barang/${pb.id}`,
                desc: notifDesc(user!.name, "Menyetujui", res.no),
                isRead: false,
              }))
            })

            notificationData = notifications

          } else {
            const allRoles = await tx.userRole.findMany({ where: { roleId: ROLE.GUDANG_REQUEST_VIEW.id } })
            const userIds = allRoles.map((v) => v.userId).filter((v) => v !== userId)

            const notifications = await tx.notification.createManyAndReturn({
              data: userIds.map((v) => ({
                fromId: userId,
                toId: v,
                link: `/permintaan/barang/${pb.id}`,
                desc: notifDesc(user!.name, "Menyetujui", res.no),
                isRead: false,
              }))
            })

            notificationData = notifications
          }
          return {
            notificationData
          }

        });

        const { notificationData } = result
        await Promise.all(
          notificationData.map((v) => (
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
          ))
        )


        return {
          ok: true,
          message: "Berhasil menyetujui permintaan barang",
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Kemunkingan terjadi kesalahan sistem, silahkan coba lagi",
          cause: error,
        });
      }
    }),
  reject: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id } = input;

      const userId = ctx.session.user.id;
      const user = await ctx.db.user.findUnique({
        where: {
          id: userId,
        },
        include: {
          UserRole: true,
        },
      });

      const res = await ctx.db.permintaanBarang.findUnique({
        where: {
          id,
        },
        include: {
          Pemohon: true,
        },
      });

      if (!res) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Permintaan Barang ini tidak ada",
        });
      }

      const isAtasan =
        res.Pemohon.atasanId === userId &&
        res.status === getStatus(STATUS.PENGAJUAN.id).id;
      const canEdit =
        user?.UserRole.some((v) => v.roleId === ROLE.IM_APPROVE.id) &&
        res.status === getStatus(STATUS.ATASAN_SETUJU.id).id;

      const status = isAtasan ? STATUS.IM_REJECT.id : STATUS.IM_REJECT.id;

      if (!isAtasan && !canEdit) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Kamu tidak punya hak untuk melakukan ini",
        });
      }

      try {
        await ctx.db.$transaction(async (tx) => {
          const pb = await tx.permintaanBarang.update({
            where: { id },
            data: {
              status: status,
            },
            include: {
              PermintaanBarangBarang: true,
            },
          });
          const untouchedBarangs = pb.PermintaanBarangBarang.filter(
            (v) => v.status !== STATUS.IM_REJECT.id,
          );
          const notifDesc = `<p class="text-sm font-semibold">${user?.name}<span class="font-normal ml-[5px]">Menolak permintaan ${res.no}</span></p>`;

          if (untouchedBarangs.length > 0) {
            for (const iterator of untouchedBarangs) {
              await tx.permintaanBarangBarang.update({
                where: {
                  id: iterator.id,
                },
                data: {
                  status: "to-reject",
                },
              });
              await tx.permintaanBarangBarangHistory.createMany({
                data: untouchedBarangs.map((v) => ({
                  pbbId: v.id,
                  desc: "Tolak",
                  status: "to-reject",
                })),
              });
            }
          }

          await tx.notification.create({
            data: {
              fromId: userId,
              toId: res.pemohondId,
              link: `/permintaan/barang/${pb.id}`,
              desc: notifDesc,
              isRead: false,
            },
          });
        });
        return {
          ok: true,
          message: "Berhasil menolak permintaan barang",
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Kemunkingan terjadi kesalahan sistem, silahkan coba lagi",
          cause: error,
        });
      }
    }),
  checkKetersediaanByBarang: protectedProcedure.query(async ({ ctx }) => {
    const pbbg = await ctx.db.permintaanBarangBarangGroup.findMany();

    if (!pbbg) {
      return {
        tersedia: [],
        takTersedia: [],
      };
    }

    const res = await checkKetersediaanByBarang(ctx.db, pbbg);

    return res;
  }),
});
