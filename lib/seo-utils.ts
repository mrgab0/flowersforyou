import { IProduct as Product } from "@/lib/models/Product";

/**
 * Genera el script JSON-LD para un arreglo floral.
 * Cumple con los requisitos de Google para fragmentos enriquecidos de productos.
 */
export function getProductSchema(product: Product) {
  const schema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "image": product.images,
    "description": product.description,
    "sku": product._id.toString(),
    "offers": {
      "@type": "Offer",
      "url": `https://tuflowershop.com/product/${product.slug}`,
      "priceCurrency": "USD",
      "price": product.price,
      "itemCondition": "https://schema.org/NewCondition",
      "availability": product.stock > 0 
        ? "https://schema.org/InStock" 
        : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "FlowerShop",
        "name": "Nombre de tu Floristería"
      }
    }
  };

  return JSON.stringify(schema);
}

/**
 * Helper para generar Metadata dinámica en Next.js
 */
export function constructMetadata({
  title,
  description,
  image,
  slug
}: {
  title: string;
  description: string;
  image?: string;
  slug: string;
}) {
  return {
    title: `${title} | Floristería Especializada`,
    description,
    openGraph: {
      title,
      description,
      url: `https://tuflowershop.com/${slug}`,
      images: image ? [{ url: image }] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : [],
    },
  };
}
