"use client";

import { useState } from "react";
import { useAtom } from "jotai";
import { userLocationAtom, persistentKrogerUserAtom } from "@/store/atoms";
import KrogerLogin from "@/components/KrogerLogin";
import Link from "next/link";

// Define types for Kroger location API
interface KrogerLocationAddress {
  addressLine1: string;
  city: string;
  state: string;
  zipCode: string;
}

interface KrogerDepartment {
  name: string;
}

interface KrogerLocationResult {
  locationId: string;
  name: string;
  address: KrogerLocationAddress;
  departments?: KrogerDepartment[];
}

export default function AccountPage() {
  const [zipCode, setZipCode] = useState("");
  const [radius, setRadius] = useState("10");
  const [searchResults, setSearchResults] = useState<KrogerLocationResult[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [userLocation, setUserLocation] = useAtom(userLocationAtom);
  const [krogerUser] = useAtom(persistentKrogerUserAtom);

  const searchLocations = async () => {
    if (!zipCode) {
      setErrorMessage("Please enter a ZIP code");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch(
        `/api/locations?zipCode=${zipCode}&radiusInMiles=${radius}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch locations");
      }

      const data = await response.json();
      setSearchResults(data.data || []);

      if (data.data?.length === 0) {
        setErrorMessage(
          "No locations found. Try a different ZIP code or increase the radius."
        );
      }
    } catch (error) {
      console.error("Error searching locations:", error);
      setErrorMessage("Error searching for locations. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const selectLocation = async (location: KrogerLocationResult) => {
    try {
      const response = await fetch("/api/user/location", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          krogerId: krogerUser?.id,
          locationId: location.locationId,
          name: location.name,
          address: {
            addressLine1: location.address.addressLine1,
            city: location.address.city,
            state: location.address.state,
            zipCode: location.address.zipCode,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save location");
      }

      // Update local state
      setUserLocation({
        id: location.locationId,
        name: location.name,
        address: `${location.address.addressLine1}, ${location.address.city}, ${location.address.state} ${location.address.zipCode}`,
      });

      alert("Location saved successfully!");
    } catch (error) {
      console.error("Error saving location:", error);
      alert("Error saving location. Please try again.");
    }
  };

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Account Settings</h1>
          <div className="flex items-center gap-4">
            <KrogerLogin />
            <Link
              href="/settings"
              className="text-blue-500 hover:underline text-sm"
            >
              API Settings
            </Link>
          </div>
        </div>

        {krogerUser ? (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Your Kroger Account</h2>
            <div className="p-4 border rounded">
              <div className="flex flex-col gap-1">
                <div className="flex gap-2">
                  <span className="font-semibold">Name:</span>
                  <span>
                    {krogerUser.firstName} {krogerUser.lastName}
                  </span>
                </div>
                {krogerUser.email && (
                  <div className="flex gap-2">
                    <span className="font-semibold">Email:</span>
                    <span>{krogerUser.email}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Kroger Account</h2>
            <p className="mb-4">
              Connect your Kroger account to access your personal shopping
              lists, loyalty card benefits, and more.
            </p>
            <KrogerLogin />
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Your Preferred Store</h2>

          {userLocation ? (
            <div className="mb-6">
              <div className="p-4 border rounded mb-4">
                <h3 className="font-bold">{userLocation.name}</h3>
                <p>{userLocation.address}</p>
              </div>
              <button
                onClick={() => setUserLocation(null)}
                className="text-red-500 hover:text-red-700"
              >
                Change Store
              </button>
            </div>
          ) : (
            <p className="mb-4">
              No store selected yet. Search for a store below.
            </p>
          )}

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Find a Store</h3>

            <div className="flex gap-2 mb-4">
              <div className="flex-1">
                <label
                  htmlFor="zipCode"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  ZIP Code
                </label>
                <input
                  id="zipCode"
                  type="text"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  placeholder="Enter ZIP code"
                  className="w-full px-3 py-2 border rounded"
                />
              </div>

              <div className="w-32">
                <label
                  htmlFor="radius"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Radius (miles)
                </label>
                <select
                  id="radius"
                  value={radius}
                  onChange={(e) => setRadius(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="15">15</option>
                  <option value="20">20</option>
                </select>
              </div>
            </div>

            <button
              onClick={searchLocations}
              disabled={isLoading}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
            >
              {isLoading ? "Searching..." : "Search"}
            </button>

            {errorMessage && (
              <p className="mt-2 text-red-500">{errorMessage}</p>
            )}

            {searchResults.length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold mb-2">Search Results:</h4>
                <div className="space-y-3">
                  {searchResults.map((location) => (
                    <div
                      key={location.locationId}
                      className="border rounded p-3"
                    >
                      <h5 className="font-bold">{location.name}</h5>
                      <p className="text-sm">
                        {location.address.addressLine1}, {location.address.city}
                        , {location.address.state} {location.address.zipCode}
                      </p>
                      {location.departments && (
                        <p className="text-xs text-gray-500 mt-1">
                          Departments:{" "}
                          {location.departments
                            .map((d: KrogerDepartment) => d.name)
                            .join(", ")}
                        </p>
                      )}
                      <button
                        onClick={() => selectLocation(location)}
                        className="mt-2 px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                      >
                        Select This Store
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
