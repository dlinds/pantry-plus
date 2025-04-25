"use client";

import { useAtom } from "jotai";
import { useState } from "react";
import {
  productsAtom,
  searchTermAtom,
  isLoadingAtom,
  type Product,
} from "@/store/atoms";

// Define types for Kroger API response
interface KrogerProductImage {
  sizes: Array<{
    url: string;
  }>;
}

interface KrogerProductPrice {
  regular: number;
}

interface KrogerProductItem {
  price?: KrogerProductPrice;
}

interface KrogerProduct {
  productId: string;
  description: string;
  items: KrogerProductItem[];
  images: KrogerProductImage[];
}

interface KrogerResponse {
  data: KrogerProduct[];
}

export default function ProductSearch() {
  const [searchTerm, setSearchTerm] = useAtom(searchTermAtom);
  const [products, setProducts] = useAtom(productsAtom);
  const [isLoading, setIsLoading] = useAtom(isLoadingAtom);
  const [locationId, setLocationId] = useState("70100"); // Example Kroger location ID

  const searchProducts = async () => {
    if (!searchTerm || !locationId) return;

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

      // Transform the data to match our Product type
      const transformedProducts: Product[] = data.data.map(
        (item: KrogerProduct) => ({
          id: item.productId,
          name: item.description,
          price: item.items[0]?.price?.regular || 0,
          image: item.images[0]?.sizes[0]?.url || "",
        })
      );

      setProducts(transformedProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-sm">
      <h2 className="text-xl font-bold mb-4">Product Search</h2>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search for products..."
          className="flex-1 px-3 py-2 border rounded"
        />

        <input
          type="text"
          value={locationId}
          onChange={(e) => setLocationId(e.target.value)}
          placeholder="Location ID"
          className="w-32 px-3 py-2 border rounded"
        />

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
            <div key={product.id} className="border rounded p-3">
              {product.image && (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-40 object-contain mb-2"
                />
              )}
              <h3 className="font-medium">{product.name}</h3>
              <p className="text-green-600">${product.price.toFixed(2)}</p>
            </div>
          ))}
        </div>
      )}

      {!isLoading && products.length === 0 && searchTerm && (
        <p>No products found. Try a different search term.</p>
      )}
    </div>
  );
}
