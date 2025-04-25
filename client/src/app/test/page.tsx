"use client";

import { useState, useEffect } from "react";

interface ApiResponse {
  message: string;
  krogerConfig: {
    clientId: string;
    apiUrl: string;
    redirectUri: string;
  };
}

export default function TestPage() {
  const [apiStatus, setApiStatus] = useState<ApiResponse | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const testConnection = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/debug");

        if (!response.ok) {
          throw new Error(`API returned status ${response.status}`);
        }

        const data = await response.json();
        setApiStatus(data);
      } catch (error) {
        console.error("Error testing API connection:", error);
        setError(error instanceof Error ? error.message : String(error));
      } finally {
        setIsLoading(false);
      }
    };

    testConnection();
  }, []);

  const testAuthorize = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(
        "http://localhost:3000/api/auth/kroger/authorize"
      );

      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }

      const data = await response.json();
      console.log("Auth URL response:", data);
      alert(`Auth URL: ${data.authorizationUrl}`);
    } catch (error) {
      console.error("Error testing auth endpoint:", error);
      setError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">API Connection Test</h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">API Status</h2>

          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span>Checking API connection...</span>
            </div>
          ) : error ? (
            <div className="text-red-500">
              <p className="font-semibold">Connection Error:</p>
              <p>{error}</p>
              <p className="mt-2">
                Make sure your API server is running on http://localhost:3000
              </p>
            </div>
          ) : (
            <div>
              <p className="text-green-500 font-semibold mb-2">
                ✅ API Connected
              </p>

              <div className="mt-4 overflow-x-auto">
                <h3 className="font-semibold mb-2">API Configuration:</h3>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                  {JSON.stringify(apiStatus, null, 2)}
                </pre>
              </div>

              <button
                onClick={testAuthorize}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Test Authorize Endpoint
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
