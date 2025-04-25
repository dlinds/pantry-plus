// Kroger user authentication
export interface KrogerUser {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
}

// User location for Kroger store
export interface KrogerLocation {
  id: string;
  name: string;
  address: string;
}

// // Atom for product search from Kroger API
// export type KrogerProduct = {
//   id: string;
//   name: string;
//   price: number;
//   image?: string;
// };

// Define types for Kroger API response
interface KrogerProductImage {
  sizes: [
    {
      size: "xlarge" | "large" | "medium" | "small" | "thumbnail";
      url: string;
    }
  ];
}

interface KrogerProductPrice {
  regular: number;
}

interface KrogerProductItem {
  price?: KrogerProductPrice;
}

interface AisleLocation {
  bayNumber: string;
  description: string;
  number: string;
  numberOfFacings: string;
  side: "L" | "R";
  shelfNumber: string;
  shelfPositionInBay: string;
}

export interface KrogerProduct {
  productId: string;
  name: string;
  price: number;
  description: string;
  items: KrogerProductItem[];
  images: KrogerProductImage[];
  aisleLocations: AisleLocation[];
}

export interface KrogerResponse {
  data: KrogerProduct[];
}
