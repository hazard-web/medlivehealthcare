"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import {
  FALLBACK_PRODUCT_IMAGE,
  imageFallbacks,
} from "@/lib/product-images";
import { Package } from "lucide-react";

interface ProductImageProps {
  src: string;
  alt: string;
  productId?: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
}

export default function ProductImage({
  src,
  alt,
  productId,
  priority = false,
  sizes = "(max-width: 768px) 50vw, 25vw",
  className = "object-contain",
}: ProductImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setImgSrc(src);
    setFailed(false);
  }, [src]);

  if (failed) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-slate-100 text-slate-400">
        <Package className="mb-2 h-10 w-10" />
        <span className="px-4 text-center text-xs">Image unavailable</span>
      </div>
    );
  }

  const handleError = () => {
    if (productId && imageFallbacks[productId] && imgSrc !== imageFallbacks[productId]) {
      setImgSrc(imageFallbacks[productId]);
      return;
    }
    if (imgSrc !== FALLBACK_PRODUCT_IMAGE) {
      setImgSrc(FALLBACK_PRODUCT_IMAGE);
    } else {
      setFailed(true);
    }
  };

  return (
    <Image
      src={imgSrc}
      alt={alt}
      fill
      priority={priority}
      sizes={sizes}
      className={className}
      onError={handleError}
    />
  );
}
