"use client";

import { useAtom } from "jotai";
import { useState, useEffect } from "react";
import { userLocationAtom } from "@/store/kroger/atoms";
import Link from "next/link";
import { productsAtom } from "@/store/kroger/atoms";
import { isLoadingAtom, searchTermAtom } from "@/store/atoms";
import { KrogerResponse } from "@/store/kroger/types";
import { ProductView } from "./Product";

export default function ProductSearch() {
  const [searchTerm, setSearchTerm] = useAtom(searchTermAtom);
  const [products, setProducts] = useAtom(productsAtom);
  const [isLoading, setIsLoading] = useAtom(isLoadingAtom);
  const [userLocation] = useAtom(userLocationAtom);
  const [locationId, setLocationId] = useState("");

  console.log(userLocation);

  // Use the saved location if available
  useEffect(() => {
    if (userLocation) {
      setLocationId(userLocation.id);
    }
  }, [userLocation]);

  const searchProducts = async () => {
    if (!searchTerm || !locationId) {
      alert(
        locationId
          ? "Please enter a search term"
          : "Please select a store location first"
      );
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/products?term=${encodeURIComponent(
          searchTerm
        )}&locationId=${locationId}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      const data = (await response.json()) as KrogerResponse;

      setProducts(data.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-sm">
      <h2 className="text-xl font-bold mb-4">Product Search</h2>

      {!userLocation && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-yellow-700 mb-2">
            You haven&apos;t selected a store location yet.
          </p>
          <Link href="/account" className="text-blue-500 hover:underline">
            Go to Account Settings to set your store location
          </Link>
        </div>
      )}

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search for products..."
          className="flex-1 px-3 py-2 border rounded"
        />

        {userLocation ? (
          <div className="px-3 py-2 border rounded bg-gray-50 text-sm">
            Store: {userLocation.name}
          </div>
        ) : (
          <input
            type="text"
            value={locationId}
            onChange={(e) => setLocationId(e.target.value)}
            placeholder="Location ID"
            className="w-32 px-3 py-2 border rounded"
          />
        )}

        <button
          onClick={searchProducts}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
        >
          {isLoading ? "Searching..." : "Search"}
        </button>
      </div>

      {isLoading ? (
        <p>Loading products...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <ProductView key={product.productId} product={product} />
          ))}
        </div>
      )}

      {!isLoading && products.length === 0 && searchTerm && (
        <p>No products found. Try a different search term.</p>
      )}
    </div>
  );
}
