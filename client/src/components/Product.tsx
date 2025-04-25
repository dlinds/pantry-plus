/* eslint-disable @next/next/no-img-element */
import { KrogerProduct } from "@/store/kroger/types";

export const ProductView = ({ product }: { product: KrogerProduct }) => {
  return (
    <div key={product.productId} className="border rounded p-3">
      {product.images[0]?.sizes[0]?.url && (
        <img
          src={product.images[0].sizes[0].url}
          alt={product.name}
          className="w-full h-40 object-contain mb-2"
          width={160}
          height={160}
        />
      )}
      <h3 className="font-medium">{product.name}</h3>
      <p className="text-green-600">${product?.price?.toFixed(2)}</p>
    </div>
  );
};
