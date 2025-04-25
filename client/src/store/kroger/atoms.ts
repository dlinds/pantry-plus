import { atom } from "jotai";
import { KrogerLocation, KrogerUser } from "./types";
import { getInitialKrogerUser } from "./actions";

export const userLocationAtom = atom<KrogerLocation | null>(null);

export const krogerUserAtom = atom<KrogerUser | null>(getInitialKrogerUser());

// Create a derived atom with write capability to update both state and localStorage
export const persistentKrogerUserAtom = atom(
  (get) => get(krogerUserAtom),
  (_, set, user: KrogerUser | null) => {
    set(krogerUserAtom, user);
    if (typeof window !== "undefined") {
      if (user) {
        localStorage.setItem("krogerUser", JSON.stringify(user));
      } else {
        localStorage.removeItem("krogerUser");
      }
    }
  }
);
