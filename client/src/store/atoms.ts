import { atom } from "jotai";

// Define your atoms
export const counterAtom = atom(0);

// Example of a derived atom
export const doubleCounterAtom = atom((get) => get(counterAtom) * 2);

// Example of an atom with write function
export const incrementCounterAtom = atom(
  (get) => get(counterAtom),
  (get, set) => set(counterAtom, get(counterAtom) + 1)
);

// Atom for product search from Kroger API
export type Product = {
  id: string;
  name: string;
  price: number;
  image?: string;
};

export const searchTermAtom = atom("");
export const productsAtom = atom<Product[]>([]);
export const isLoadingAtom = atom(false);
