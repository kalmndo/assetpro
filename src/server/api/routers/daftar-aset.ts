import formatDate from "@/lib/formatDate";
import {
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const daftarAsetRouter = createTRPCRouter({
  getAll: protectedProcedure
    .query(async ({ ctx }) => {
      const result = await ctx.db.daftarAset.findMany({
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          Pengguna: true,
          MasterBarang: {
            include: {
              Uom: true,
              SubSubKategori: true
            }
          }
        }
      })

      return result.map((v) => ({
        id: v.id,
        no: v.id,
        barang: {
          name: v.MasterBarang.name,
          image: v.MasterBarang.image,
        },
        code: v.MasterBarang.fullCode,
        kategori: v.MasterBarang.SubSubKategori.name,
        satuan: v.MasterBarang.Uom.name,
        pengguna: v.Pengguna?.name
      }))
    }),
  getSelectUser: protectedProcedure
    .query(async ({ ctx }) => {
      const penggunaId = ctx.session.user.id
      const result = await ctx.db.daftarAset.findMany({
        where: {
          penggunaId
        },
        orderBy: {
          createdAt: "desc"
        },
        include: {
          MasterBarang: true,
        }
      })

      return result.map((v) => ({
        label: `${v.id} | ${v.MasterBarang.name}`,
        value: v.id,
      }))
    }),
  get: protectedProcedure
    .input(z.object({
      id: z.string()
    }))
    .query(async ({ ctx, input }) => {
      const { id } = input
      const res = await ctx.db.daftarAset.findFirst({
        where: {
          id
        },
        include: {
          PeminjamanAsetEksternal: {
            include: {
              Peminjaman: {
                include: {
                  Pemohon: true
                }
              }
            }
          },
          PeminjamanAsetInternal: {
            include: {
              Peminjaman: {
                include: {
                  Peminjam: true
                }
              }
            }
          },
          DaftarAsetAudit: true,
          DaftarAsetAdditional: true,
          FtkbItemPemohonAset: {
            include: {
              FtkbItemPemohon: {
                include: {
                  IM: {
                    include: {
                      Pemohon: true,
                      Ruang: true
                    }
                  },
                  FtkbItem: {
                    include: {
                      Ftkb: true
                    }
                  }
                }
              }
            }
          },
          Perbaikan: {
            include: {
              PerbaikanKomponen: true,
              PerbaikanExternal: {
                include: {
                  PerbaikanEksternalKomponen: true
                }
              },
              Teknisi: {
                include: {
                  User: true
                }
              }
            }
          },
          Pengguna: {
            include: {
              Department: true,
              DepartmentUnit: true
            }
          },
          MasterBarang: {
            include: { SubSubKategori: true }
          },
          FttbItem: {
            include: {
              Fttb: true,
              PoBarang: {
                include: {
                  Barang: true,
                  PO: {
                    include: {
                      Vendor: true
                    }
                  }
                }
              }
            }
          }
        }
      })

      if (!res) {
        throw new TRPCError({
          code: "BAD_GATEWAY",
          message: "Tidak ada form ini"
        })
      }


      const pj = res.Pengguna

      const barang = res.MasterBarang
      const pembelian = res.FttbItem?.PoBarang
      const hargaPembelian = pembelian?.Barang.harga

      function monthsDifference(start: Date) {
        const end = new Date(new Date());

        const yearsDiff = end.getFullYear() - start.getFullYear();
        const monthsDiff = end.getMonth() - start.getMonth();
        const daysDiff = end.getDate() - start.getDate();

        let totalMonths = yearsDiff * 12 + monthsDiff;
        if (daysDiff < 0) {
          totalMonths -= 1;
        }

        const years = Math.floor(totalMonths / 12);
        const months = totalMonths % 12;

        let result = '';
        if (years > 0) {
          result += `${years} Tahun`;
        }
        if (months > 0) {
          result += `${months} Bulan`;
        }
        if (!result) {
          result = `${start.getDate() - end.getDate()} Hari`
        }

        return {
          usia: totalMonths,
          usiaString: result.trim()
        };
      }

      const { usia, usiaString } = monthsDifference(res.createdAt)
      // TODO: default umur ekonomi
      const umurEkonomi = res.umur
      const umurEkonomiMonth = 12 * umurEkonomi
      const residu = hargaPembelian ?? 0 / umurEkonomiMonth
      const totalPenyusutan = residu * usia

      // @ts-ignore
      const perbaikan = res.Perbaikan.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)).map((v) => {
        return {
          id: v.id,
          no: v.no,
          teknisi: v.Teknisi?.User.name,
          keluhan: v.keluhan,
          catatan: v.catatanTeknisi,
          tanggal: v.createdAt.toLocaleDateString(),
          status: v.status,
          biaya: `Rp ${v.PerbaikanKomponen.map((v) => v.biaya).reduce((a, b) => a + b, 0).toLocaleString("id-ID")}`
        }
      })

      // riwayat mutasi, terima barang, keluar barang, perbaikan
      const fttb = res.FttbItem?.Fttb
      const terima = {
        id: fttb?.id,
        no: fttb?.no,
        tanggal: fttb?.createdAt.toLocaleDateString("id-ID")
      }

      // @ts-ignore
      const keluar = res.FtkbItemPemohonAset.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)).map((v) => ({
        id: v.id,
        no: v.FtkbItemPemohon.FtkbItem.Ftkb.no,
        pemohon: v.FtkbItemPemohon.IM.Pemohon.name,
        noIm: v.FtkbItemPemohon.IM.no,
        tanggal: v.FtkbItemPemohon.IM.createdAt.toLocaleDateString("id-ID")
      }))

      // @ts-ignore
      const IM = res.FtkbItemPemohonAset.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))[0]?.FtkbItemPemohon.IM

      // dam total pembiayaan
      const totalBiayaPerbaikan = res.Perbaikan.flatMap((v) => v.PerbaikanKomponen.flatMap((v) => v.biaya)).reduce((a, b) => a + b, 0)
      const totalBiayaExternal = res.Perbaikan.flatMap((v) => v.PerbaikanExternal.flatMap((v) => v.PerbaikanEksternalKomponen.flatMap((v) => v.biaya))).reduce((a, b) => a + b, 0)

      const result = {
        name: barang.name,
        status: res.status,
        lokasi: IM?.Ruang.name,
        peruntukan: IM?.perihal,
        no: res.id,
        garansi: pembelian?.Barang.garansi,
        card: {
          harga: `Rp ${pembelian?.Barang.harga!.toLocaleString("id-ID")}`,
          susut: `Rp ${totalPenyusutan?.toLocaleString("id-ID")}`,
          biaya: `Rp ${(totalBiayaPerbaikan + totalBiayaExternal).toLocaleString("id-ID")}`,
          nilai: `Rp ${(usia > 0 ? hargaPembelian ?? 0 - residu : hargaPembelian ?? 0).toLocaleString("id-ID")}`
        },
        barang: {
          image: barang.image,
          desc: barang.deskripsi,
          code: barang.fullCode,
          kategori: barang.SubSubKategori.name,
        },
        info: res.DaftarAsetAdditional,
        // additional barang info
        pembelian: {
          tgl: pembelian?.createdAt.toLocaleDateString(),
          vendor: pembelian?.PO.Vendor.name,
          noPo: pembelian?.PO.no,
          harga: `Rp ${hargaPembelian?.toLocaleString('id-ID')}`
        },
        penyusutan: {
          id: '',
          umur: `${umurEkonomi} Tahun`,
          usia: usiaString,
          residu: `Rp ${residu.toLocaleString("id-ID")} / bulan`,
          total: `Rp ${totalPenyusutan.toLocaleString("id-ID")}`,
          nilai: `Rp ${(usia > 0 ? hargaPembelian ?? 0 - residu : hargaPembelian ?? 0).toLocaleString("id-ID")}`
        },
        pengguna: {
          name: pj?.name,
          image: pj?.image,
          title: pj?.title,
          department: `${pj?.Department.name} - ${pj?.DepartmentUnit?.name}`,
        },
        // riwayat mutasi, terima barang, keluar barang, perbaikan, peminjaman
        perbaikan,
        terima,
        keluar,
        mutasi: [],
        audit: res.DaftarAsetAudit,
        peminjaman: [
          ...res.PeminjamanAsetInternal.map((v) => ({
            id: v.id,
            tipe: 'Internal',
            no: v.Peminjaman.no,
            peminjam: v.Peminjaman.Peminjam.name,
            peruntukan: v.Peminjaman.peruntukan,
            from: v.from.toLocaleDateString("id-ID"),
            to: v.to.toLocaleDateString("id-ID"),
            status: v.Peminjaman.status
          })),
          ...res.PeminjamanAsetEksternal.map((v) => ({
            id: v.id,
            tipe: 'Eksternal',
            no: v.Peminjaman.no,
            peminjam: v.Peminjaman.Pemohon.name,
            peruntukan: v.Peminjaman.peruntukan,
            from: v.from.toLocaleDateString("id-ID"),
            to: v.to.toLocaleDateString("id-ID"),
            status: v.Peminjaman.status
            // @ts-ignore
          }))].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      }

      return result
    }),
  addInfo: protectedProcedure
    .input(z.object({
      id: z.string(),
      name: z.string(),
      value: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const {
        id,
        name,
        value
      } = input
      try {
        await ctx.db.$transaction(async (tx) => {
          const user = await tx.user.findUnique({ where: { id: ctx.session.user.id } })
          const res = await tx.daftarAsetAdditional.create({
            data: {
              asetId: id,
              name,
              value
            }
          })

          const { day, hours, minutes, monthName } = formatDate(res.createdAt)

          const desc =
            `
<div class="aspect-square w-3 bg-primary rounded-full absolute left-0 translate-x-[-29.5px] z-10 top-1"></div>
<div class="font-medium">${day}, ${monthName} ${hours}:${minutes} WIB</div>
<div class="font-semibold">${user?.name} menambah informasi</div>
<div class="text-sm ">${name}: ${value}</div>
`

          await tx.daftarAsetAudit.create({
            data: {
              asetId: id,
              desc
            }
          })
        })
        return {
          ok: true,
          message: 'Berhasil menambah informasi'
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          cause: error,
          message: "Kemunkingan terjadi kesalahan sistem, silahkan coba lagi",
        })
      }
    }),
  removeInfo: protectedProcedure
    .input(z.object({
      id: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const {
        id,
      } = input
      try {
        await ctx.db.$transaction(async (tx) => {
          const user = await tx.user.findUnique({ where: { id: ctx.session.user.id } })
          const res = await tx.daftarAsetAdditional.delete({
            where: {
              id
            }
          })

          const { day, hours, minutes, monthName } = formatDate(res.createdAt)

          const desc =
            `
<div class="aspect-square w-3 bg-primary rounded-full absolute left-0 translate-x-[-29.5px] z-10 top-1"></div>
<div class="font-medium">${day}, ${monthName} ${hours}:${minutes} WIB</div>
<div class="font-semibold">${user?.name} menghapus informasi</div>
<div class="text-sm ">${res.name}: ${res.value}</div>
`
          await tx.daftarAsetAudit.create({
            data: {
              asetId: id,
              desc
            }
          })
        })
        return {
          ok: true,
          message: 'Berhasil menambah informasi'
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          cause: error,
          message: "Kemunkingan terjadi kesalahan sistem, silahkan coba lagi",
        })
      }
    }),
  updatePenyusutan: protectedProcedure
    .input(z.object({
      id: z.string(),
      umur: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const {
        id,
        umur
      } = input
      try {
        await ctx.db.$transaction(async (tx) => {
          const user = await tx.user.findUnique({ where: { id: ctx.session.user.id } })

          const prev = await tx.daftarAset.findFirst({ where: { id } })

          const res = await tx.daftarAset.update({
            where: {
              id
            },
            data: {
              umur: Number(umur)
            }
          })

          const { day, hours, minutes, monthName } = formatDate(res.createdAt)

          const desc =
            `
<div class="aspect-square w-3 bg-primary rounded-full absolute left-0 translate-x-[-29.5px] z-10 top-1"></div>
<div class="font-medium">${day}, ${monthName} ${hours}:${minutes} WIB</div>
<div class="font-semibold">${user?.name} merubah umur ekonomis</div>
<div class="text-sm">dari ${prev?.umur} Tahun menjadi ${umur} Tahun</div>
`
          await tx.daftarAsetAudit.create({
            data: {
              asetId: id,
              desc
            }
          })
        })
        return {
          ok: true,
          message: 'Berhasil menambah informasi'
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          cause: error,
          message: "Kemunkingan terjadi kesalahan sistem, silahkan coba lagi",
        })
      }
    })
});
