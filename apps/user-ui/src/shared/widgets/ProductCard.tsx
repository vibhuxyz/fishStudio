"use client";
import { useState } from "react";
import Image, { StaticImageData } from "next/image";
import { Heart, Star, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductCardProps {
  name: string;
  price: number;
  weight: string;
  image: StaticImageData | string;
  rating?: number;
  description?: string;
  variant?: "simple" | "detailed";
}

const ProductCard = ({
  name,
  price,
  weight,
  image,
  rating,
  description,
  variant = "simple",
}: ProductCardProps) => {
  const [quantity, setQuantity] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  const handleAdd = () => setQuantity(1);
  const handleIncrement = () => setQuantity((q) => q + 1);
  const handleDecrement = () => setQuantity((q) => Math.max(0, q - 1));

  if (variant === "detailed") {
    return (
      <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        <div className="relative h-48 md:h-56 bg-gray-100">
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center hover:scale-110 transition-transform"
          >
            <Heart
              className={`h-4 w-4 ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-400"}`}
            />
          </button>
        </div>

        <div className="p-3 md:p-4">
          <h3 className="font-semibold text-sm md:text-base text-gray-900">
            {name}
          </h3>

          {rating && (
            <div className="flex items-center gap-1 mt-2 mb-2">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium text-gray-700">
                {rating}
              </span>
            </div>
          )}

          {description && (
            <p className="text-xs text-gray-600 mb-3">{description}</p>
          )}

          <div className="flex items-center justify-between">
            <div>
              <span className="text-lg font-bold text-gray-900">₹{price}</span>
              <span className="text-xs text-gray-500 ml-2">{weight}</span>
            </div>

            {quantity === 0 ? (
              <Button
                onClick={handleAdd}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                Add
              </Button>
            ) : (
              <div className="flex items-center gap-1 bg-green-50 rounded px-2 py-1">
                <button
                  onClick={handleDecrement}
                  className="p-1 hover:bg-green-100 rounded"
                >
                  <Minus className="h-3 w-3 text-green-600" />
                </button>
                <span className="w-6 text-center text-sm font-semibold text-green-600">
                  {quantity}
                </span>
                <button
                  onClick={handleIncrement}
                  className="p-1 hover:bg-green-100 rounded"
                >
                  <Plus className="h-3 w-3 text-green-600" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="relative h-40 bg-gray-100">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        />
      </div>

      <div className="p-3">
        <h3 className="font-semibold text-sm text-gray-900">{name}</h3>
        <div className="flex items-center justify-between mt-3">
          <div>
            <span className="text-base font-bold text-gray-900">₹{price}</span>
            <span className="text-xs text-gray-500 ml-2">{weight}</span>
          </div>

          {quantity === 0 ? (
            <Button
              onClick={handleAdd}
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-xs"
            >
              Add
            </Button>
          ) : (
            <div className="flex items-center gap-1 bg-green-50 rounded px-2 py-1">
              <button
                onClick={handleDecrement}
                className="p-0.5 hover:bg-green-100 rounded"
              >
                <Minus className="h-3 w-3 text-green-600" />
              </button>
              <span className="w-5 text-center text-xs font-semibold text-green-600">
                {quantity}
              </span>
              <button
                onClick={handleIncrement}
                className="p-0.5 hover:bg-green-100 rounded"
              >
                <Plus className="h-3 w-3 text-green-600" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
