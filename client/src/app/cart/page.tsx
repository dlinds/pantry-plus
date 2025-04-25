"use client";

import { cartItemsAtom } from "@/store/user/atoms";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { getCartItems } from "@/store/user/actions";

export default function CartPage() {
  const [cartItems, setCartItems] = useAtom(cartItemsAtom);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCartItems() {
      try {
        setLoading(true);
        const items = await getCartItems();
        if (items) {
          setCartItems(items);
        }
      } catch (error) {
        console.error("Error fetching cart items:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCartItems();
  }, [setCartItems]);

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Cart</h1>

        {loading ? (
          <div className="text-center py-10">Loading cart items...</div>
        ) : cartItems.length === 0 ? (
          <div className="text-center py-10">Your cart is empty</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="border rounded cursor-pointer"
                style={{
                  padding: "12px",
                }}
              >
                <h3
                  style={{
                    fontSize: "16px",
                  }}
                >
                  {item.description}
                </h3>
                {item.aisle_number && (
                  <h3 className="font-medium">
                    <div>
                      aisle {item.aisle_number} ({item.aisle_description})
                    </div>
                  </h3>
                )}
                <p className="text-green-600">
                  $
                  {typeof item.price === "number"
                    ? item.price.toFixed(2)
                    : item.price}
                </p>
                {item.image_url && (
                  <img
                    src={
                      typeof item.image_url === "string"
                        ? item.image_url
                        : item.image_url.url
                    }
                    alt={item.description}
                    className="w-full h-40 object-contain mb-2"
                    width={160}
                    style={{ maxHeight: "160px" }}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
