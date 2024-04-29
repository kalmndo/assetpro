import {
  LayoutDashboard
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
    title: 'Manajemen',
    label: '',
    href: '/manajemen',
    icon: <LayoutDashboard size={18} />,
    isTitle: true
  },
  {
    title: 'Pengadaan',
    label: '3',
    href: '/tasks',
    icon: <LayoutDashboard size={18} />,
    sub: [
      {
        title: 'Permintaan Barang',
        label: '',
        href: '/pengadaan/permintaan-barang',
        icon: <LayoutDashboard size={18} />,
      },
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
    icon: <LayoutDashboard size={18} />,
    sub: [
      {
        title: 'Permintaan Barang',
        label: '',
        href: '/gudang/permintaan-barang',
        icon: <LayoutDashboard size={18} />,
      },
      {
        title: 'Barang Masuk',
        label: '',
        href: '/gudang/barang-masuk',
        icon: <LayoutDashboard size={18} />,
      },
      {
        title: 'Barang Keluar',
        label: '',
        href: '/gudang/barang-keluar',
        icon: <LayoutDashboard size={18} />,
      },
      {
        title: 'Mutasi Barang',
        label: '',
        href: '/gudang/mutasi-barang',
        icon: <LayoutDashboard size={18} />,
      },
    ]
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
        title: 'Keluar',
        label: '',
        href: '/perbaikan/keluar',
        icon: <LayoutDashboard size={18} />,
      },
    ]
  },
  {
    title: 'Pemeliharaan',
    label: '',
    href: '/',
    icon: <LayoutDashboard size={18} />,
    sub: [
      {
        title: 'Gedung',
        label: '',
        href: '/pemeliharaan/gedung',
        icon: <LayoutDashboard size={18} />,
      },
      {
        title: 'Kendaraan',
        label: '',
        href: '/pemeliharaan/kendaraan',
        icon: <LayoutDashboard size={18} />,
      },
      {
        title: 'Peralatan',
        label: '',
        href: '/pemeliharaan/peralatan',
        icon: <LayoutDashboard size={18} />,
      },
      {
        title: 'Furnitur',
        label: '',
        href: '/pemeliharaan/furnitur',
        icon: <LayoutDashboard size={18} />,
      },
    ]
  },
  {
    title: 'User',
    label: '',
    href: '',
    icon: <LayoutDashboard size={18} />,
    isTitle: true
  },
  {
    title: 'Permintaan',
    label: '',
    href: '/permintaan/barang',
    icon: <LayoutDashboard size={18} />,
  },
  {
    title: 'Perbaikan',
    label: '',
    href: '/permintaan/perbaikan',
    icon: <LayoutDashboard size={18} />,
  },
  {
    title: 'Peminjaman',
    label: '',
    href: '/permintaan/peminjaman',
    icon: <LayoutDashboard size={18} />,
  },
  {
    title: 'Master',
    label: '',
    href: '',
    icon: <LayoutDashboard size={18} />,
    isTitle: true
  },
  {
    title: 'Permintaan',
    label: '',
    href: '/',
    icon: <LayoutDashboard size={18} />,
  },
  {
    title: 'Perbaikan',
    label: '',
    href: '/',
    icon: <LayoutDashboard size={18} />,
  },
  {
    title: 'Peminjaman',
    label: '',
    href: '/',
    icon: <LayoutDashboard size={18} />,
  },
]
