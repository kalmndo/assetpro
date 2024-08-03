type StatusType = {
  id: string,
  name: string,
  color: string
}

export const STATUS = {
  PENGAJUAN: {
    id: 'pengajuan',
    name: 'Pengajuan',
    color: '#f59f0b'
  },
  ATASAN_SETUJU: {
    id: 'atasan-setuju',
    name: 'Disetujui Atasan',
    color: '#15803c'
  },
  IM_APPROVE: {
    id: 'approve',
    name: 'Disetujui',
    color: '#15803c'
  },
  IM_REJECT: {
    id: 'reject',
    name: 'Ditolak',
    color: '#dc2626'
  },
  PROCESS: {
    id: 'process',
    name: 'Dalam Proses',
    color: '#dc2626'
  },
  MENUNGGU: {
    id: 'menunggu',
    name: 'Menunggu',
    color: '#f59f0b'
  },
  SELESAI: {
    id: 'selesai',
    name: 'Selesai',
    color: '#15803c'
  },
  BARANG: {
    id: 'in',
    name: 'Barang di terima di gudang',
    color: '#15803c'
  },
  TEKNISI_DISPOSITION: {
    id: 'diserahkan-teknisi',
    name: 'Diserahkan Ke Teknisi',
    color: '#15803c'
  },
  TEKNISI_FIXING: {
    id: 'teknisi-fixing',
    name: 'Teknisi sedang memperbaiki',
    color: '#15803c'
  },
  TEKNISI_DONE: {
    id: 'teknisi-done',
    name: 'Teknisi selesai memperbaiki',
    color: '#15803c'
  },
}

export const getStatus = (id: string) => {
  let result: StatusType = { color: "", id: "", name: "" }
  const statusKeys = Object.keys(STATUS);
  for (const key of statusKeys) {
    // @ts-ignore
    if (STATUS[key].id === id) {
      // @ts-ignore
      result = STATUS[key]
    }
  }
  return result
}
