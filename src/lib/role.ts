type RoleType = {
  id: string,
  name: string,
}

export const ROLE = {
  IM_READ: {
    id: 'permintaan-barang-read',
    name: 'Internal Memo (read)',
  },
  IM_APPROVE: {
    id: 'permintaan-barang-approve',
    name: 'Internal Memo (approve)',
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
