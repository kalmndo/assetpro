
import { z } from "zod";

import {
	createTRPCRouter,
	protectedProcedure,
} from "@/server/api/trpc";
import checkKetersediaanByBarang from "../shared/check-ketersediaan-by-barang";
import { STATUS } from "@/lib/status";
import { TRPCError } from "@trpc/server";
import { ROLE } from "@/lib/role";
import PENOMORAN from "@/lib/penomoran";
import getPenomoran from "@/lib/getPenomoran";
import notifDesc from "@/lib/notifDesc";
import { getPusherInstance } from "@/lib/pusher/server";
const pusherServer = getPusherInstance();

export const permintaanPembelianRouter = createTRPCRouter({
	getAll: protectedProcedure
		.query(async ({ ctx }) => {
			const result = await ctx.db.permintaanPembelian.findMany({
				orderBy: {
					createdAt: "desc"
				},
				include: {
					PermintaanPembelianBarang: true
				}
			})

			return result.map((v) => ({
				...v,
				jumlah: v.PermintaanPembelianBarang.length,
				tanggal: v.createdAt.toLocaleDateString()
			}))
		}),
	get: protectedProcedure
		.input(
			z.object({
				id: z.string()
			})
		)
		.query(async ({ ctx, input }) => {
			const { id } = input
			const userId = ctx.session.user.id

			const user = await ctx.db.user.findUnique({
				where: {
					id: userId
				},
				include: {
					UserRole: true
				}
			})
			if (!user) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Tidak ada user ini",
				});
			}

			const roleIds = user.UserRole.map((v) => v.roleId)

			const result = await ctx.db.permintaanPembelian.findUnique({
				where: {
					id
				},
				include: {
					PBPP: { include: { Permintaan: true } },
					PermintaanPembelianBarang: {
						include: {
							MasterBarang: {
								include: {
									Uom: true
								}
							},
							PBSPBB: true
						}
					}
				}
			})

			if (!result) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Tidak ada form ini",
				});
			}

			const isApprove = result.status === STATUS.PENGAJUAN.id && roleIds.some((v) => v === ROLE.PEMBELIAN_APPROVE.id)

			const isSelect = result.status === STATUS.IM_APPROVE.id && roleIds.some((v) => v === ROLE.PEMBELIAN_SELECT_VENDOR.id)

			const ims = result.PBPP.map((v) => ({
				id: v.permintaanId,
				no: v.Permintaan.no,
			}))

			const barang = result.PermintaanPembelianBarang.map((v) => ({
				id: v.id,
				image: v.MasterBarang.image,
				name: v.MasterBarang.name,
				kode: v.MasterBarang.fullCode,
				jumlah: v.qty,
				uom: v.MasterBarang.Uom.name
			}))

			return {
				...result,
				tanggal: result.createdAt.toLocaleDateString(),
				ims,
				barang,
				isApprove,
				isSelect
			}
		})
	,
	create: protectedProcedure
		.input(z.array(z.string()))
		.mutation(async ({ ctx, input }) => {
			const barangGroupResult = await ctx.db.permintaanBarangBarangGroup.findMany({
				where: {
					barangId: { in: input }
				}
			})
			const { takTersedia } = await checkKetersediaanByBarang(ctx.db, barangGroupResult)
			const barangs = takTersedia.flatMap((v) => v.permintaanBarang)
			const im = imToUpdateStatus(barangs)

			try {
				await ctx.db.$transaction(async (tx) => {
					let penomoran = await tx.penomoran.findUnique({
						where: {
							id: PENOMORAN.PERMINTAAN_PEMBELIAN,
							year: String(new Date().getFullYear())
						}
					})

					if (!penomoran) {
						penomoran = await tx.penomoran.create({
							data: {
								id: PENOMORAN.PERMINTAAN_PEMBELIAN,
								code: "FPPB",
								number: 0,
								year: String(new Date().getFullYear())
							}
						})
					}
					const permPem = await tx.permintaanPembelian.create({
						data: {
							no: getPenomoran(penomoran),
							status: STATUS.PENGAJUAN.id
						}
					})

					for (const iterator of im) {
						await tx.permintaanBarang.update({
							where: {
								id: iterator
							},
							data: {
								status: STATUS.PROCESS.id
							}
						})
					}
					await tx.pBPP.createMany({
						data: im.map((v) => ({ permintaanId: v, pembelianId: permPem.id }))
					})

					for (const value of takTersedia) {
						const ppb = await tx.permintaanPembelianBarang.create({
							data: {
								barangId: value.id,
								formId: permPem.id,
								qty: value.permintaan
							}
						})
						const groupPermintaanBarangLeft: string[] = []

						for (const iterator of value.permintaanBarang) {
							if (iterator.permintaan !== iterator.beli) {
								groupPermintaanBarangLeft.push(iterator.id)

							}
							const data = {
								qtyOrdered: iterator.beli,
							};

							if (iterator.status === 'approve') {
								// @ts-ignore
								data.status = { set: STATUS.PROCESS.id };
							}
							await tx.permintaanBarangBarang.update({
								where: {
									id: iterator.id
								},
								data
							})
							const splitResult = await tx.permintaanBarangBarangSplit.create({
								data: {
									pbbId: iterator.id,
									qty: iterator.beli,
									status: 'order',
									PermintaanBarangBarangSplitHistory: {
										create: {
											formNo: permPem.no,
											formType: 'permintaan-pembelian',
											desc: 'Permintaan pembelian'
										}
									}
								},
								include: {
									PermintaanBarangBarangSplitHistory: true
								}
							})
							await tx.pBSPBB.create({
								data: {
									barangSplitId: splitResult.id,
									pembelianBarangId: ppb.id
								}
							})
						}

						await tx.permintaanBarangBarangGroup.update({
							where: {
								barangId: value.id,
							},
							data: {
								ordered: { increment: value.permintaan },
							}
						})
					}
					await tx.penomoran.update({
						where: {
							id: PENOMORAN.PERMINTAAN_PEMBELIAN,
							year: String(new Date().getFullYear())
						},
						data: {
							number: { increment: 1 }
						}
					})

					const allRoles = await tx.userRole.findMany({ where: { roleId: ROLE.PEMBELIAN_APPROVE.id } })
					const userIds = allRoles.map((v) => v.userId)
					const user = await tx.user.findFirst({
						where: {
							id: ctx.session.user.id
						}
					})

					for (const v of userIds) {
						const notification = await tx.notification.create({
							data: {
								fromId: ctx.session.user.id,
								toId: v,
								link: `/pengadaan/permintaan-pembelian/${permPem.id}`,
								desc: notifDesc(user!.name, "Permintaan pembelian barang", permPem.no),
								isRead: false,
							},
						});
						await pusherServer.trigger(
							userIds,
							"notification",
							{
								id: notification.id,
								fromId: ctx.session.user.id,
								toId: v,
								link: `/pengadaan/permintaan-pembelian/${permPem.id}`,
								desc: notifDesc(user!.name, "Permintaan pembelian barang", permPem.no),
								isRead: false,
								createdAt: notification.createdAt,
								From: {
									image: user?.image,
									name: user?.name
								},
							}
						)
					}

				})
				return {
					ok: true,
					message: 'Berhasil membuat permintaan pembelian'
				}
			} catch (error) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Kemunkingan terjadi kesalahan sistem, silahkan coba lagi",
					cause: error,
				});
			}
		}),
	approve: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const { id } = input
			try {
				await ctx.db.$transaction(async (tx) => {
					const permintaanPembelian = await tx.permintaanPembelian.update({
						where: {
							id
						},
						data: {
							status: STATUS.IM_APPROVE.id
						}
					})

					const result = await tx.permintaanPembelianBarang.findMany({
						where: {
							formId: id
						},
						include: {
							PBSPBB: {
								include: {

								}
							}
						}
					})

					const barangSplitIds = result.flatMap((v) => v.PBSPBB.flatMap((aa) => aa.barangSplitId))

					for (const value of barangSplitIds) {
						await tx.permintaanBarangBarangSplitHistory.create({
							data: {
								desc: 'Permintaan pembelian disetujui',
								formNo: permintaanPembelian.no,
								formType: 'permintaan-pembelian',
								barangSplitId: value
							}
						})
					}

					let penomoran = await tx.penomoran.findUnique({
						where: {
							id: PENOMORAN.PERMINTAAN_PENAWARAN,
							year: String(new Date().getFullYear())
						}
					})

					if (!penomoran) {
						penomoran = await tx.penomoran.create({
							data: {
								id: PENOMORAN.PERMINTAAN_PENAWARAN,
								code: "FPP",
								number: 0,
								year: String(new Date().getFullYear())
							}
						})
					}
					const permPem = await tx.permintaanPenawaran.create({
						data: {
							no: getPenomoran(penomoran),
							status: "pengajuan",
							pembelianId: id
						}
					})

					if (permPem) {
						await tx.penomoran.update({
							where: {
								id: PENOMORAN.PERMINTAAN_PENAWARAN,
								year: String(new Date().getFullYear())
							},
							data: {
								number: { increment: 1 }
							}
						})
					}

					const allRoles = await tx.userRole.findMany({ where: { roleId: ROLE.PEMBELIAN_SELECT_VENDOR.id } })
					const userIds = allRoles.map((v) => v.userId)
					const user = await tx.user.findFirst({
						where: {
							id: ctx.session.user.id
						}
					})
					for (const v of userIds) {
						const notification = await tx.notification.create({
							data: {
								fromId: ctx.session.user.id,
								toId: v,
								link: `/pengadaan/permintaan-penawaran/${permPem.id}`,
								desc: notifDesc(user!.name, "Permintaan penawaran ke vendor", permPem.no),
								isRead: false,
							},
						});
						await pusherServer.trigger(
							userIds,
							"notification",
							{
								id: notification.id,
								fromId: ctx.session.user.id,
								toId: v,
								link: `/pengadaan/permintaan-penawaran/${permPem.id}`,
								desc: notifDesc(user!.name, "Permintaan penawaran ke vendor", permPem.no),
								isRead: false,
								createdAt: notification.createdAt,
								From: {
									image: user?.image,
									name: user?.name
								},
							}
						)
					}
				})

				return {
					ok: true,
					message: 'Berhasil menyetujui permintaan pembelian',
				}
			} catch (error) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Terjadi kesalahan server",
					cause: error
				});
			}
		}),
});

function imToUpdateStatus(data: any): string[] {
	return [...new Set(data.filter((item: any) => item.imStatus === 'approve').map((item: any) => item.href))] as string[]
}