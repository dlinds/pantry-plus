export type CartItem = {
  id: string;
  product_id?: string;
  user_id?: string;
  description: string;
  aisle_bay_number?: string;
  aisle_description?: string;
  aisle_number?: string;
  aisle_number_of_facings?: string;
  aisle_side?: string;
  aisle_shelf_number?: string;
  aisle_shelf_position_in_bay?: string;
  price: number | string;
  image_url: string | { url: string };
  quantity?: number;
};
