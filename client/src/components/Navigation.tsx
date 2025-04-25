"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  const isRecipePath = () => {
    return pathname.startsWith("/recipes");
  };

  return (
    <nav className="bg-blue-500 text-white p-4">
      <div className="max-w-5xl mx-auto flex justify-between items-center">
        <div className="font-bold text-xl">Pantry Plus</div>
        <ul className="flex space-x-4">
          <li>
            <Link
              href="/"
              className={`hover:underline ${
                isActive("/") ? "font-bold underline" : ""
              }`}
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              href="/recipes"
              className={`hover:underline ${
                isRecipePath() ? "font-bold underline" : ""
              }`}
            >
              Recipes
            </Link>
          </li>
          <li>
            <Link
              href="/about"
              className={`hover:underline ${
                isActive("/about") ? "font-bold underline" : ""
              }`}
            >
              About
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
