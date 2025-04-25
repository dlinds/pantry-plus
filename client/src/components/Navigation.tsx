"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAtom } from "jotai";
import { krogerUserAtom } from "@/store/atoms";

export default function Navigation() {
  const pathname = usePathname();
  const [krogerUser] = useAtom(krogerUserAtom);

  const isActive = (path: string) => {
    return pathname === path;
  };

  const isRecipePath = () => {
    return pathname.startsWith("/recipes");
  };

  const isAccountPath = () => {
    return pathname.startsWith("/account");
  };

  return (
    <nav className="bg-blue-500 text-white p-4">
      <div className="max-w-5xl mx-auto flex justify-between items-center">
        <div className="font-bold text-xl">Pantry Plus</div>
        <div className="flex items-center">
          <ul className="flex space-x-4 mr-6">
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
                href="/account"
                className={`hover:underline ${
                  isAccountPath() ? "font-bold underline" : ""
                }`}
              >
                Account
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

          {krogerUser && (
            <div className="text-sm bg-blue-600 px-3 py-1 rounded">
              Hi, {krogerUser.firstName}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
