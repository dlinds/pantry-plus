/* eslint-disable @next/next/no-img-element */
import { productsAtom } from "@/store/kroger/atoms";
import { KrogerProduct } from "@/store/kroger/types";
import { useAtom } from "jotai";
import { addItemToCart } from "@/store/kroger/actions";

export const ProductList = () => {
  const [products] = useAtom(productsAtom);

  // addItemToCart
  const handleAddItemToCart = async (product: KrogerProduct) => {
    await addItemToCart(product);
  };

  const findIdealImage = (product: KrogerProduct) => {
    const allSizes = product.images[0].sizes;
    const idealSize = allSizes.find((size) => size.size === "medium");

    if (idealSize) {
      return idealSize.url;
    }

    return allSizes[0].url;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map((product) => (
        <div
          key={product.productId}
          className="border rounded p-3 cursor-pointer"
          onClick={() => handleAddItemToCart(product)}
        >
          {findIdealImage(product) && (
            <img
              src={findIdealImage(product)}
              alt={product.name}
              className="w-full h-40 object-contain mb-2"
              width={160}
              height={160}
            />
          )}
          <h3>{product.description}</h3>
          <h3 className="font-medium">
            {product.aisleLocations.map((aisle, index) => (
              <div key={`${aisle.number}-${index}`}>Aisle {aisle.number}</div>
            ))}
          </h3>
          <p className="text-green-600">${product?.price?.toFixed(2)}</p>
        </div>
      ))}
    </div>
  );
};
