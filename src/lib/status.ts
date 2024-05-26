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
    color: 'bg-green-600'
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
  }
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
