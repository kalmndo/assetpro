type RoleType = {
  id: string,
  name: string,
}

export const ROLE = {
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
  PEMBELIAN_SELECT_VENDOR: {
    id: 'pembelian-select-approve',
    name: 'Permintaan Pembelian (select vendor)',
  },
  SELECT_TEKNISI: {
    id: 'perbaikan-select-approve',
    name: 'Perbaikan (select teknisi)',
  },
  EVALUASI_HARGA_READ: {
    id: 'evaluasi-read',
    name: 'Evaluasi Harga (view)',
  },
  EVALUASI_HARGA_APPROVE: {
    id: 'evaluasi-approve',
    name: 'Evaluasi Harga (approve)',
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
