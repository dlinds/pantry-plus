/* eslint-disable @next/next/no-img-element */
import { productsAtom } from "@/store/kroger/atoms";
import { KrogerProduct } from "@/store/kroger/types";
import { addItemToCart } from "@/store/user/actions";
import { useAtom } from "jotai";

export const ProductList = () => {
  const [products] = useAtom(productsAtom);

  // addItemToCart
  const handleAddItemToCart = async (product: KrogerProduct) => {
    // ask user to confirm
    const confirmed = window.confirm(
      `Are you sure you want to add ${product.description} to your cart?`
    );
    if (confirmed) {
      await addItemToCart(product);
    }
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
          style={{
            padding: "12px",
            marginTop: "12px",
            marginBottom: "12px",
            marginLeft: "12px",
            marginRight: "12px",
            borderRadius: "12px",
          }}
          onClick={() => handleAddItemToCart(product)}
        >
          <h3
            style={{
              fontSize: "20px",
              borderBottom: "1px solid #ccc",
              paddingBottom: "4px",
              marginBottom: "12px",
            }}
          >
            {product.description}
          </h3>
          <div className="flex row" style={{ marginBottom: "12px" }}>
            <h3 className="font-medium mr-4" style={{ marginRight: "12px" }}>
              <div>{product.aisleLocations[0].description}</div>
            </h3>
            <p className="text-green-600 italic">
              ${product?.items[0]?.price?.regular}
            </p>
          </div>
          {findIdealImage(product) && (
            <img
              src={findIdealImage(product)}
              alt={product.name}
              className="w-full h-40 object-contain mb-2"
              width={160}
              style={{ maxHeight: "160px" }}
            />
          )}
        </div>
      ))}
    </div>
  );
};
