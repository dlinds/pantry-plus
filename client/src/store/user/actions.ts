import { KrogerProduct } from "../kroger/types";
import { getInitialKrogerUser } from "../kroger/actions";
import { CartItem } from "./type";

const findIdealImage = (product: KrogerProduct) => {
  const allSizes = product.images[0].sizes;
  const idealSize = allSizes.find((size) => size.size === "medium");

  if (idealSize) {
    return idealSize.url;
  }

  return allSizes[0].url;
};

export const addItemToCart = async (product: KrogerProduct) => {
  const user = getInitialKrogerUser();

  if (!user) return;

  const formattedProduct: {
    id: string;
    description: string;
    aisle_bay_number?: string;
    aisle_description?: string;
    aisle_number?: string;
    aisle_number_of_facings?: string;
    aisle_side?: string;
    aisle_shelf_number?: string;
    aisle_shelf_position_in_bay?: string;
    price: number;
    image_url: string;
  } = {
    id: product.productId,
    description: product.description,
    price: product.items[0]?.price?.regular || 0,
    image_url: findIdealImage(product),
    aisle_bay_number: product.aisleLocations[0]?.bayNumber,
    aisle_description: product.aisleLocations[0]?.description,
    aisle_number: product.aisleLocations[0]?.number,
    aisle_number_of_facings: product.aisleLocations[0]?.numberOfFacings,
    aisle_side: product.aisleLocations[0]?.side,
    aisle_shelf_number: product.aisleLocations[0]?.shelfNumber,
    aisle_shelf_position_in_bay: product.aisleLocations[0]?.shelfPositionInBay,
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

export const getCartItems = async (): Promise<CartItem[] | null> => {
  const user = getInitialKrogerUser();

  if (!user) return null;

  const response = await fetch(`/api/cart/items?krogerId=${user.id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    console.error("Failed to get cart items");
    return null;
  }

  return response.json();
};
