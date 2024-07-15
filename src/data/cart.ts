import { atomWithStorage, splitAtom } from 'jotai/utils'

export type CartType = {
  id: string
  image: string
  name: string
  deskripsi: string
  kode: string
  qty: string
  uom: string
  kodeAnggaran: string[]
}

export const cartsAtom = atomWithStorage('cart', [])
export const cartsAtomsAtom = splitAtom(cartsAtom)
