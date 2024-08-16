type RoleType = {
  id: string,
  name: string,
}

export const ROLE = {
  LAPORAN_VIEW: {
    id: 'laporan-view',
    name: 'Laporan (view)',
  },
  ASET_VIEW: {
    id: 'aset-view',
    name: 'Daftar Aset (view)',
  },
  STOCK_VIEW: {
    id: 'stock-view',
    name: 'Kartu Stock (view)',
  },
  IM_READ: {
    id: 'im-view',
    name: 'Internal Memo (view)',
  },
  IM_APPROVE: {
    id: 'im-approve',
    name: 'Internal Memo (approve)',
  },
  PEMBELIAN_READ: {
    id: 'pembelian-view',
    name: 'Permintaan Pembelian (view)',
  },
  PEMBELIAN_APPROVE: {
    id: 'pembelian-approve',
    name: 'Permintaan Pembelian (approve)',
  },
  PENAWARAN_VIEW: {
    id: 'penawaran-view',
    name: 'Permintaan Penawaran (view)',
  },
  PEMBELIAN_SELECT_VENDOR: {
    id: 'pembelian-select-vendor',
    name: 'Permintaan Penawaran (select vendor)',
  },
  NEGO_VIEW: {
    id: 'nego-view',
    name: 'Penawaran Harga (view)',
  },
  NEGO_SUBMIT: {
    id: 'nego-submit',
    name: 'Penawaran Harga (negosiasi)',
  },
  EVALUASI_HARGA_READ: {
    id: 'evaluasi-read',
    name: 'Evaluasi Harga (view)',
  },
  EVALUASI_HARGA_APPROVE: {
    id: 'evaluasi-approve',
    name: 'Evaluasi Harga (approve)',
  },
  PO_VIEW: {
    id: 'po-view',
    name: 'PO (view)',
  },
  GUDANG_REQUEST_VIEW: {
    id: 'gudang-request-view',
    name: 'Gudang Permintaan (view)',
  },
  GUDANG_MASUK_VIEW: {
    id: 'gudang-masuk-view',
    name: 'Gudang Masuk (view)',
  },
  GUDANG_KELUAR_VIEW: {
    id: 'gudang-keluar-view',
    name: 'Gudang Keluar (view)',
  },
  MUTASI_VIEW: {
    id: 'mutasi-view',
    name: 'Mutasi (view)',
  },
  PERBAIKAN_PERMINTAAN_VIEW: {
    id: 'perbaikan-permintaan-view',
    name: 'Perbaikan Permintaan (view)',
  },
  SELECT_TEKNISI: {
    id: 'perbaikan-select-approve',
    name: 'Perbaikan (select teknisi)',
  },
  PERBAIKAN_EKSTERNAL_VIEW: {
    id: 'perbaikan-eksternal-view',
    name: 'Perbaikan Eksternal (view)',
  },
  PERBAIKAN_EKSTERNAL_APPROVE: {
    id: 'perbaikan-eksternal-approve',
    name: 'Perbaikan Eksternal (approve)',
  },
  PERBAIKAN_EKSTERNAL_ADD_COMPONENT: {
    id: 'perbaikan-eksternal-komponen',
    name: 'Perbaikan Eksternal (add components)',
  },
  PERBAIKAN_EKSTERNAL_DISERAHKAN_KE_VENDOR: {
    id: 'perbaikan-eksternal-diserahkan-ke-vendor',
    name: 'Perbaikan Eksternal (send to vendor)',
  },
  PERBAIKAN_EKSTERNAL_TERIMA: {
    id: 'perbaikan-eksternal-terima',
    name: 'Perbaikan Eksternal (receive from vendor)',
  },
  PERBAIKAN_EKSTERNAL_DISERAHKAN_KE_USER: {
    id: 'perbaikan-eksternal-diserahkan-ke-user',
    name: 'Perbaikan Eksternal (send to user)',
  },
  PEMINJAMAN_INTERNAL_VIEW: {
    id: 'peminjaman-internal-view',
    name: 'Peminjaman Internal (view)',
  },
  PEMINJAMAN_INTERNAL_APPROVE: {
    id: 'peminjaman-internal-approve',
    name: 'Peminjaman Internal (approve)',
  },
  PEMINJAMAN_INTERNAL_SEND_TO_USER: {
    id: 'peminjaman-internal-send-to-user',
    name: 'Peminjaman Internal (send to user)',
  },
  PEMINJAMAN_INTERNAL_RECEIVE_FROM_USER: {
    id: 'peminjaman-internal-receive-from-user',
    name: 'Peminjaman Internal (receive from user)',
  },
  PEMINJAMAN_EKSTERNAL_VIEW: {
    id: 'peminjaman-eksternal-view',
    name: 'Peminjaman Eksternal (view)',
  },
  PEMINJAMAN_EKSTERNAL_CREATE: {
    id: 'peminjaman-eksternal-create',
    name: 'Peminjaman Eksternal (create)',
  },
  PEMINJAMAN_EKSTERNAL_APPROVE: {
    id: 'peminjaman-eksternal-approve',
    name: 'Peminjaman Eksternal (approve)',
  },
  PEMINJAMAN_EKSTERNAL_SEND_TO_USER: {
    id: 'peminjaman-eksternal-send-to-user',
    name: 'Peminjaman Eksternal (send to user)',
  },
  PEMINJAMAN_EKSTERNAL_RECEIVE_FROM_USER: {
    id: 'peminjaman-eksternal-receive-from-user',
    name: 'Peminjaman Eksternal (receive from user)',
  },
  MASTER_VIEW: {
    id: 'master-view',
    name: 'Master (view)',
  },
  PENGATURAN_VIEW: {
    id: 'pengaturan-view',
    name: 'Pengaturan (view)',
  },
}

export const getStatus = (id: string) => {
  let result: RoleType = { id: "", name: "" }
  const roleKeys = Object.keys(ROLE);
  for (const key of roleKeys) {
    // @ts-ignore
    if (ROLE[key].id === id) {
      // @ts-ignore
      result = ROLE[key]
    }
  }
  return result
}
