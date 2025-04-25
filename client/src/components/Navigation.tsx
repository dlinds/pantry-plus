"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const pathname = usePathname();

  const isPath = (path: string) => {
    return pathname.startsWith(path);
  };

  return (
    <nav
      className="bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md "
      style={{ padding: "1rem" }}
    >
      <ul className="flex items-center space-x-6 w-full justify-between">
        <li>
          <Link
            href="/"
            className={`px-10 py-1 rounded-lg transition-all duration-200 hover:bg-blue-600/50 ${
              isPath("/") ? "font-semibold bg-blue-600/30" : ""
            }`}
          >
            Search
          </Link>
        </li>
        <li>
          <Link
            href="/cart"
            className={`px-2 py-1 rounded-lg transition-all duration-200 hover:bg-blue-600/50 ${
              isPath("/cart") ? "font-semibold bg-blue-600/30" : ""
            }`}
          >
            Cart
          </Link>
        </li>
        <li>
          <Link
            href="/account"
            className={`px-2 py-1 rounded-lg transition-all duration-200 hover:bg-blue-600/50 ${
              isPath("/account") ? "font-semibold bg-blue-600/30" : ""
            }`}
          >
            Account
          </Link>
        </li>
      </ul>
    </nav>
  );
}
