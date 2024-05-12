import { atomWithStorage, splitAtom } from 'jotai/utils'

export type CartType = {
  id: string
  gambar: string
  name: string
  kode: string
  qty: string
  kodeAnggaran: string[]
}

export const cartsAtom = atomWithStorage('cart', [])
export const cartsAtomsAtom = splitAtom(cartsAtom)
