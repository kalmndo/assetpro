import {
  FileClock,
  FolderSync,
  Inbox,
  LayoutDashboard,
  PackageMinus,
  PackagePlus,
  ShoppingCart,
  Warehouse,
  Wrench
} from 'lucide-react'

export interface NavLink {
  title: string
  label?: string
  href: string
  icon: JSX.Element,
  isTitle?: boolean
}

export interface SideLink extends NavLink {
  sub?: NavLink[]
}

export const sidelinks: SideLink[] = [
  {
    title: 'Dashboard',
    label: '',
    href: '/dashboard',
    icon: <LayoutDashboard size={18} />
  },
  {
    title: 'Laporan',
    label: '',
    href: '/laporan',
    icon: <LayoutDashboard size={18} />
  },
  {
    title: 'Daftar Aset',
    label: '',
    href: '/daftar-aset',
    icon: <LayoutDashboard size={18} />
  },
  {
    title: 'Kartu Stok',
    label: '',
    href: '/kartu-stok',
    icon: <LayoutDashboard size={18} />
  },
  {
    title: 'Permintaan',
    label: '',
    href: '/permintaan',
    icon: <LayoutDashboard size={18} />,
    isTitle: true
  },
  {
    title: 'Barang',
    label: '',
    href: '/permintaan/barang',
    icon: <Inbox size={18} />,
  },
  {
    title: 'Perbaikan',
    label: '',
    href: '/permintaan/perbaikan',
    icon: <Wrench size={18} />,
  },
  {
    title: 'Peminjaman',
    label: '',
    href: '/permintaan/peminjaman',
    icon: <FileClock size={18} />,
  },
  {
    title: 'Manajemen',
    label: '',
    href: '/manajemen',
    icon: <LayoutDashboard size={18} />,
    isTitle: true
  },
  {
    title: 'Permintaan Barang',
    label: '',
    href: '/permintaan-barang',
    icon: <FileClock size={18} />,
  },
  {
    title: 'Pengadaan',
    label: '3',
    href: '/tasks',
    icon: <ShoppingCart size={18} />,
    sub: [
      {
        title: 'Permintaan Pembelian',
        label: '',
        href: '/pengadaan/permintaan-pembelian',
        icon: <LayoutDashboard size={18} />,
      },
      {
        title: 'Permintaan Penawaran',
        label: '',
        href: '/pengadaan/permintaan-penawaran',
        icon: <LayoutDashboard size={18} />,
      },
      {
        title: 'Penawaran Harga',
        label: '',
        href: '/pengadaan/penawaran-harga',
        icon: <LayoutDashboard size={18} />,
      },
      {
        title: 'Evaluasi Harga',
        label: '',
        href: '/pengadaan/evaluasi-harga',
        icon: <LayoutDashboard size={18} />,
      },
      {
        title: 'Purchase Order',
        label: '',
        href: '/pengadaan/purchase-order',
        icon: <LayoutDashboard size={18} />,
      },
    ],
  },
  {
    title: 'Gudang',
    label: '',
    href: '/',
    icon: <Warehouse size={18} />,
    sub: [
      {
        title: 'Permintaan',
        label: '',
        href: '/gudang/permintaan',
        icon: <PackagePlus size={18} />,
      },
      {
        title: 'Masuk',
        label: '',
        href: '/gudang/masuk',
        icon: <PackagePlus size={18} />,
      },
      {
        title: 'Keluar',
        label: '',
        href: '/gudang/keluar',
        icon: <PackageMinus size={18} />,
      },
    ]
  },
  {
    title: 'Mutasi ',
    label: '',
    href: '/gudang/mutasi-barang',
    icon: <FolderSync size={18} />,
  },
  {
    title: 'Perbaikan',
    label: '',
    href: '',
    icon: <LayoutDashboard size={18} />,
    sub: [
      {
        title: 'Permintaan',
        label: '',
        href: '/perbaikan/permintaan',
        icon: <LayoutDashboard size={18} />,
      },
      {
        title: 'Eksternal',
        label: '',
        href: '/perbaikan/eksternal',
        icon: <LayoutDashboard size={18} />,
      },
    ]
  },
  {
    title: 'Peminjaman',
    label: '',
    href: '',
    icon: <LayoutDashboard size={18} />,
    sub: [
      {
        title: 'internal',
        label: '',
        href: '/peminjama/internal',
        icon: <LayoutDashboard size={18} />,
      },
      {
        title: 'external',
        label: '',
        href: '/peminjaman/external',
        icon: <LayoutDashboard size={18} />,
      },
    ]
  },
  {
    title: '',
    label: '',
    href: 'admin',
    icon: <LayoutDashboard size={18} />,
    isTitle: true
  },
  {
    title: 'Master',
    label: '',
    href: '/master',
    icon: <LayoutDashboard size={18} />,
  },
  {
    title: 'Pengaturan',
    label: '',
    href: '/pengaturan',
    icon: <LayoutDashboard size={18} />,
  },
]
