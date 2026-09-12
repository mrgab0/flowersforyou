import dbConnect from "@/lib/db";
import { Product } from "@/lib/models/Product";
import { getAddons } from "@/lib/actions/addon";
import { CatalogClient } from "@/components/shop/CatalogClient";

export const revalidate = 60;

export default async function LocalizedProductosCatalogPage() {
  let products = [];
  let addons = [];

  try {
    await dbConnect();
    const [rawProducts, addonsRes] = await Promise.all([
      Product.find({ isActive: { $ne: false } }).sort({ createdAt: -1 }).lean(),
      getAddons(),
    ]);
    products = JSON.parse(JSON.stringify(rawProducts || []));
    addons = addonsRes.success && addonsRes.data ? addonsRes.data : [];
  } catch (err) {
    products = [];
    addons = [];
  }

  return <CatalogClient initialProducts={products} initialAddons={addons} />;
}
