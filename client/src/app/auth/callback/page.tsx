"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAtom } from "jotai";
import { persistentKrogerUserAtom } from "@/store/atoms";

export default function KrogerAuthCallback() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [, setKrogerUser] = useAtom(persistentKrogerUserAtom);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      // Get the code and state from the URL
      const code = searchParams.get("code");
      const stateParam = searchParams.get("state");
      const errorParam = searchParams.get("error");

      if (errorParam) {
        setError(`Login failed: ${errorParam}`);
        setIsProcessing(false);
        return;
      }

      if (!code) {
        setError("No authorization code received");
        setIsProcessing(false);
        return;
      }

      try {
        // Send the code to our backend to exchange for tokens
        const response = await fetch("/api/auth/kroger/callback", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code, state: stateParam }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to exchange code for tokens");
        }

        const data = await response.json();

        // Set the user data in our global state
        setKrogerUser({
          id: data.user.id,
          firstName: data.user.firstName,
          lastName: data.user.lastName,
          email: data.user.email,
        });

        // Redirect back to the account page or home
        router.push("/account");
      } catch (error) {
        console.error("Error exchanging code for tokens:", error);
        setError("Error completing login. Please try again.");
        setIsProcessing(false);
      }
    };

    handleCallback();
  }, [searchParams, router, setKrogerUser]);

  return (
    <main className="min-h-screen p-8 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">
          {isProcessing
            ? "Completing Your Login..."
            : error
            ? "Login Error"
            : "Login Complete!"}
        </h1>

        {isProcessing && (
          <div className="flex justify-center mb-4">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {error && (
          <>
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={() => router.push("/account")}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Return to Account
            </button>
          </>
        )}

        {!isProcessing && !error && (
          <p>You&apos;ve successfully logged in with Kroger. Redirecting...</p>
        )}
      </div>
    </main>
  );
}
