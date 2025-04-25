import { atom } from "jotai";
import { CartItem } from "./type";

export const cartItemsAtom = atom<CartItem[]>([]);

export const addCartItemAtom = atom(null, (get, set, item: CartItem) => {
  set(cartItemsAtom, [...get(cartItemsAtom), item]);
});

export const removeCartItemAtom = atom(null, (get, set, item: CartItem) => {
  set(
    cartItemsAtom,
    get(cartItemsAtom).filter((i) => i.id !== item.id)
  );
});
