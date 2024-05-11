import { atomWithStorage, splitAtom } from 'jotai/utils'

export const cartsAtom = atomWithStorage('cart', [])
export const cartsAtomsAtom = splitAtom(cartsAtom)
