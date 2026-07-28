import dbConnect from "@/lib/db";
import { Product } from "@/lib/models/Product";
import { CatalogClient } from "@/components/shop/CatalogClient";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ProductosCatalogPage() {
  await dbConnect();
  const rawProducts = await Product.find({ isActive: { $ne: false } }).sort({ createdAt: -1 }).lean();
  const products = JSON.parse(JSON.stringify(rawProducts));

  return <CatalogClient initialProducts={products} />;
}
