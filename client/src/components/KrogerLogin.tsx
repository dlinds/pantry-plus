"use client";

import { useState } from "react";
import { useAtom } from "jotai";
import { krogerUserAtom } from "@/store/atoms";

interface KrogerLoginProps {
  className?: string;
}

export default function KrogerLogin({ className = "" }: KrogerLoginProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [krogerUser] = useAtom(krogerUserAtom);

  const initiateLogin = async () => {
    setIsLoading(true);
    setError("");

    try {
      // Get the authorization URL from our backend - use direct URL to backend API
      const response = await fetch(
        "http://localhost:3000/api/auth/kroger/authorize"
      );

      if (!response.ok) {
        throw new Error("Failed to initiate Kroger login");
      }

      const data = await response.json();
      console.log("Authorization URL:", data.authorizationUrl);

      // Redirect to Kroger's login page
      window.location.href = data.authorizationUrl;
    } catch (error) {
      console.error("Error initiating Kroger login:", error);
      setError("Error initiating login. Please try again.");
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/kroger/logout", { method: "POST" });
      // Force a page reload to clear state
      window.location.href = "/";
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  if (krogerUser) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="text-sm">
          <span>Logged in as </span>
          <span className="font-semibold">{krogerUser.firstName}</span>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm px-3 py-1 border border-red-400 text-red-500 rounded hover:bg-red-50"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className={className}>
      <button
        onClick={initiateLogin}
        disabled={isLoading}
        className="flex items-center justify-center gap-2 bg-[#0160A9] text-white px-4 py-2 rounded hover:bg-[#014c8c] disabled:bg-gray-400"
      >
        {isLoading ? (
          <span>Loading...</span>
        ) : (
          <>
            <svg
              viewBox="0 0 32 32"
              width="16"
              height="16"
              fill="white"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M16 0C7.178 0 0 7.178 0 16s7.178 16 16 16 16-7.178 16-16S24.822 0 16 0zm7.982 18.262h-1.855v2.384h-1.875v-2.384h-6.298v-1.8l5.973-9.184h2.2v9.309h1.855v1.675zm-3.73-1.675v-5.511l-3.578 5.511h3.578z" />
            </svg>
            Login with Kroger
          </>
        )}
      </button>

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
}
