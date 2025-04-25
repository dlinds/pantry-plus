"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAtom } from "jotai";
import { persistentKrogerUserAtom } from "@/store/atoms";

export default function Navigation() {
  const pathname = usePathname();
  const [krogerUser] = useAtom(persistentKrogerUserAtom);

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
    <nav className="bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link
          href="/"
          className="font-bold text-2xl tracking-tight hover:text-blue-100 transition-colors duration-200"
        >
          Pantry Plus
        </Link>
        <div className="flex items-center gap-6">
          <ul className="hidden md:flex items-center space-x-6">
            <li>
              <Link
                href="/"
                className={`px-2 py-1 rounded-lg transition-all duration-200 hover:bg-blue-600/50 ${
                  isActive("/") ? "font-semibold bg-blue-600/30" : ""
                }`}
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                href="/recipes"
                className={`px-2 py-1 rounded-lg transition-all duration-200 hover:bg-blue-600/50 ${
                  isRecipePath() ? "font-semibold bg-blue-600/30" : ""
                }`}
              >
                Recipes
              </Link>
            </li>
            <li>
              <Link
                href="/account"
                className={`px-2 py-1 rounded-lg transition-all duration-200 hover:bg-blue-600/50 ${
                  isAccountPath() ? "font-semibold bg-blue-600/30" : ""
                }`}
              >
                Account
              </Link>
            </li>
            <li>
              <Link
                href="/about"
                className={`px-2 py-1 rounded-lg transition-all duration-200 hover:bg-blue-600/50 ${
                  isActive("/about") ? "font-semibold bg-blue-600/30" : ""
                }`}
              >
                About
              </Link>
            </li>
          </ul>

          {krogerUser && krogerUser.firstName && (
            <div className="flex items-center gap-2 bg-blue-700 px-4 py-1.5 rounded-full text-sm font-medium shadow-sm hover:bg-blue-800 transition-colors duration-200">
              <span className="hidden sm:inline">Welcome,</span>{" "}
              {krogerUser.firstName}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
