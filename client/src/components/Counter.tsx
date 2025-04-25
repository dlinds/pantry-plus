"use client";

import { useAtom } from "jotai";
import {
  counterAtom,
  doubleCounterAtom,
  incrementCounterAtom,
} from "@/store/atoms";

export default function Counter() {
  const [count] = useAtom(counterAtom);
  const [doubleCount] = useAtom(doubleCounterAtom);
  const [, increment] = useAtom(incrementCounterAtom);

  return (
    <div className="p-4 border rounded-lg shadow-sm">
      <h2 className="text-xl font-bold mb-4">Counter Example</h2>
      <p className="mb-2">Count: {count}</p>
      <p className="mb-4">Double Count: {doubleCount}</p>
      <button
        onClick={() => increment()}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Increment
      </button>
    </div>
  );
}
