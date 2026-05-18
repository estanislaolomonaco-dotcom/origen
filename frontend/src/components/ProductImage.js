"use client";

import { imageFallback } from "@/lib/imageFallback";

// Wrapper de <img> con fallback automatico si la URL falla.
// Uso: <ProductImage src={url} alt={nombre} />
export default function ProductImage({ src, alt, className, loading }) {
  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={src}
      alt={alt}
      className={className}
      loading={loading}
      onError={imageFallback(alt)}
    />
  );
}
