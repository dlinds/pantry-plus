import { KrogerProduct, KrogerUser } from "./types";

// Initialize krogerUser from localStorage if available
export const getInitialKrogerUser = (): KrogerUser | null => {
  if (typeof window === "undefined") return null;

  try {
    const storedUser = localStorage.getItem("krogerUser");
    return storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.error("Error parsing stored kroger user:", error);
    return null;
  }
};

export const addItemToCart = async (product: KrogerProduct) => {
  const user = getInitialKrogerUser();

  if (!user) return;

  const formattedProduct: {
    id: string;
    description: string;
    aisle_bay_number: string;
    aisle_description: string;
    aisle_number: string;
    aisle_number_of_facings: string;
    aisle_side: string;
    aisle_shelf_number: string;
    aisle_shelf_position_in_bay: string;
    price: number;
    image_url: string;
  } = {
    id: product.productId,
    description: product.description,
    price: product.price || 0,
    image_url: product.images[0].sizes[0].url,
    aisle_bay_number: product.aisleLocations[0].bayNumber,
    aisle_description: product.aisleLocations[0].description,
    aisle_number: product.aisleLocations[0].number,
    aisle_number_of_facings: product.aisleLocations[0].numberOfFacings,
    aisle_side: product.aisleLocations[0].side,
    aisle_shelf_number: product.aisleLocations[0].shelfNumber,
    aisle_shelf_position_in_bay: product.aisleLocations[0].shelfPositionInBay,
  };

  // make POST call?
  const response = await fetch("/api/cart/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ krogerId: user.id, product: formattedProduct }),
  });

  if (!response.ok) {
    console.error("Failed to add item to cart");
  }

  return response.json();
};
