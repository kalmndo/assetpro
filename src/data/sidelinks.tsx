import { ROLE } from "@/lib/role";
import {
  ArchiveRestore,
  BaggageClaim,
  Briefcase,
  Building,
  ChartColumnDecreasing,
  Drill,
  FileClock,
  HandCoins,
  Handshake,
  Inbox,
  LayoutDashboard,
  Luggage,
  MonitorCog,
  Package,
  PackageMinus,
  PackagePlus,
  PackageSearch,
  Percent,
  ScreenShare,
  Settings,
  ShoppingCart,
  SquareChartGantt,
  Warehouse,
  Wrench,
} from "lucide-react";

export interface NavLink {
  title: string;
  label?: string;
  href: string;
  icon: JSX.Element;
  isTitle?: boolean;
  role?: string;
}

export interface SideLink extends NavLink {
  sub?: NavLink[];
}

export const sidelinks: SideLink[] = [
  {
    title: "Dashboard",
    label: "",
    href: "/dashboard",
    icon: <LayoutDashboard size={18} />,
  },
  {
    title: "Laporan",
    label: "",
    href: "/laporan",
    icon: <ChartColumnDecreasing size={18} />,
    role: ROLE.LAPORAN_VIEW.id,
  },
  {
    title: "Daftar Aset",
    label: "",
    href: "/daftar-aset",
    icon: <Building size={18} />,
    role: ROLE.ASET_VIEW.id,
  },
  {
    title: "Kartu Stok",
    label: "",
    href: "/kartu-stok",
    icon: <Package size={18} />,
    role: ROLE.STOCK_VIEW.id,
  },
  {
    title: "Permintaan",
    label: "",
    href: "/permintaan",
    icon: <PackageSearch size={18} />,
    isTitle: true,
  },
  {
    title: "Barang",
    label: "",
    href: "/permintaan/barang",
    icon: <Inbox size={18} />,
  },
  {
    title: "Perbaikan",
    label: "",
    href: "/permintaan/perbaikan",
    icon: <Wrench size={18} />,
  },
  {
    title: "Peminjaman",
    label: "",
    href: "/permintaan/peminjaman",
    icon: <ArchiveRestore size={18} />,
  },
  {
    title: "Manajemen",
    label: "",
    href: "/manajemen",
    icon: <LayoutDashboard size={18} />,
    isTitle: true,
  },
  {
    title: "Permintaan Barang",
    label: "",
    href: "/permintaan-barang",
    icon: <FileClock size={18} />,
    role: ROLE.IM_READ.id,
  },
  {
    title: "Pengadaan",
    label: "3",
    href: "/tasks",
    icon: <ShoppingCart size={18} />,
    sub: [
      {
        title: "Permintaan Pembelian",
        label: "",
        href: "/pengadaan/permintaan-pembelian",
        icon: <ScreenShare size={18} />,
        role: ROLE.PEMBELIAN_READ.id,
      },
      {
        title: "Permintaan Penawaran",
        label: "",
        href: "/pengadaan/permintaan-penawaran",
        icon: <HandCoins size={18} />,
        role: ROLE.PENAWARAN_VIEW.id,
      },
      {
        title: "Penawaran Harga",
        label: "",
        href: "/pengadaan/penawaran-harga",
        icon: <Percent size={18} />,
        role: ROLE.NEGO_VIEW.id,
      },
      {
        title: "Evaluasi Harga",
        label: "",
        href: "/pengadaan/evaluasi-harga",
        icon: <Handshake size={18} />,
        role: ROLE.EVALUASI_HARGA_READ.id,
      },
      {
        title: "Purchase Order",
        label: "",
        href: "/pengadaan/purchase-order",
        icon: <SquareChartGantt size={18} />,
        role: ROLE.PO_VIEW.id,
      },
    ],
  },
  {
    title: "Gudang",
    label: "",
    href: "/",
    icon: <Warehouse size={18} />,
    sub: [
      {
        title: "Permintaan",
        label: "",
        href: "/gudang/permintaan",
        icon: <PackagePlus size={18} />,
        role: ROLE.GUDANG_REQUEST_VIEW.id,
      },
      {
        title: "Masuk",
        label: "",
        href: "/gudang/masuk",
        icon: <PackagePlus size={18} />,
        role: ROLE.GUDANG_MASUK_VIEW.id,
      },
      {
        title: "Keluar",
        label: "",
        href: "/gudang/keluar",
        icon: <PackageMinus size={18} />,
        role: ROLE.GUDANG_KELUAR_VIEW.id,
      },
    ],
  },
  {
    title: "Perbaikan",
    label: "",
    href: "",
    icon: <Wrench size={18} />,
    sub: [
      {
        title: "Internal",
        label: "",
        href: "/perbaikan/permintaan",
        icon: <Drill size={18} />,
        role: ROLE.PERBAIKAN_PERMINTAAN_VIEW.id,
      },
      {
        title: "Eksternal",
        label: "",
        href: "/perbaikan/eksternal",
        icon: <Luggage size={18} />,
        role: ROLE.PERBAIKAN_EKSTERNAL_VIEW.id,
      },
    ],
  },
  {
    title: "Peminjaman",
    label: "",
    href: "",
    icon: <ArchiveRestore size={18} />,
    sub: [
      {
        title: "Internal",
        label: "",
        href: "/peminjaman/internal",
        icon: <Briefcase size={18} />,
        role: ROLE.PEMINJAMAN_INTERNAL_VIEW.id,
      },
      {
        title: "Eksternal",
        label: "",
        href: "/peminjaman/eksternal",
        icon: <BaggageClaim size={18} />,
        role: ROLE.PEMINJAMAN_EKSTERNAL_VIEW.id,
      },
    ],
  },
  {
    title: "",
    label: "",
    href: "admin",
    icon: <LayoutDashboard size={18} />,
    isTitle: true,
  },
  {
    title: "Master",
    label: "",
    href: "/master",
    icon: <MonitorCog size={18} />,
    role: ROLE.MASTER_VIEW.id,
  },
  {
    title: "Pengaturan",
    label: "",
    href: "/pengaturan",
    icon: <Settings size={18} />,
    role: ROLE.PENGATURAN_VIEW.id,
  },
];
