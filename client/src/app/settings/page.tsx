"use client";

import { useState } from "react";
import Link from "next/link";

export default function SettingsPage() {
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const saveCredentials = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!clientId || !clientSecret) {
      setMessage("Please enter both Client ID and Client Secret");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/settings/kroger", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientId,
          clientSecret,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save credentials");
      }

      setMessage("Kroger API credentials saved successfully!");
      // Clear the form
      setClientId("");
      setClientSecret("");
    } catch (error) {
      console.error("Error saving credentials:", error);
      setMessage("Error saving credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">API Settings</h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Kroger API Configuration</h2>

          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded">
            <h3 className="font-semibold mb-2">
              How to obtain Kroger API credentials:
            </h3>
            <ol className="list-decimal pl-5 space-y-2">
              <li>
                Register at{" "}
                <a
                  href="https://developer.kroger.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  https://developer.kroger.com/
                </a>
              </li>
              <li>Create a new application</li>
              <li>
                Set your Redirect URI to:{" "}
                <code className="bg-gray-100 px-2 py-1 rounded">
                  http://localhost:3001/auth/callback
                </code>
              </li>
              <li>Request access to the Products API and Locations API</li>
              <li>Copy your Client ID and Client Secret below</li>
            </ol>
          </div>

          <form onSubmit={saveCredentials}>
            <div className="mb-4">
              <label
                htmlFor="clientId"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Client ID
              </label>
              <input
                id="clientId"
                type="text"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full px-3 py-2 border rounded"
                placeholder="Enter your Kroger Client ID"
              />
            </div>

            <div className="mb-6">
              <label
                htmlFor="clientSecret"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Client Secret
              </label>
              <input
                id="clientSecret"
                type="password"
                value={clientSecret}
                onChange={(e) => setClientSecret(e.target.value)}
                className="w-full px-3 py-2 border rounded"
                placeholder="Enter your Kroger Client Secret"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
            >
              {isLoading ? "Saving..." : "Save Credentials"}
            </button>

            {message && (
              <p
                className={`mt-3 ${
                  message.includes("Error") ? "text-red-500" : "text-green-500"
                }`}
              >
                {message}
              </p>
            )}
          </form>

          <div className="mt-8 pt-6 border-t">
            <Link href="/account" className="text-blue-500 hover:underline">
              ← Back to Account
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
