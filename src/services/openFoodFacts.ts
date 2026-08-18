import { FoodItem } from '../lib/types';

// Open Food Facts is a free, open, no-API-key nutrition database.
// Docs: https://world.openfoodfacts.org/data
const SEARCH_URL = 'https://world.openfoodfacts.org/cgi/search.pl';
const PRODUCT_URL = 'https://world.openfoodfacts.org/api/v2/product';

interface OffProduct {
  code?: string;
  product_name?: string;
  brands?: string;
  image_front_small_url?: string;
  serving_size?: string;
  nutriments?: {
    'energy-kcal_100g'?: number;
    'proteins_100g'?: number;
    'fat_100g'?: number;
    'carbohydrates_100g'?: number;
  };
}

function toFoodItem(p: OffProduct): FoodItem | null {
  const name = p.product_name?.trim();
  const kcal = p.nutriments?.['energy-kcal_100g'];
  if (!name || typeof kcal !== 'number' || kcal <= 0) return null;
  return {
    id: p.code ?? `${name}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    brand: p.brands || undefined,
    barcode: p.code,
    caloriesPer100g: Math.round(kcal),
    proteinPer100g: p.nutriments?.proteins_100g,
    fatPer100g: p.nutriments?.fat_100g,
    carbsPer100g: p.nutriments?.carbohydrates_100g,
    source: 'openfoodfacts',
    imageUrl: p.image_front_small_url,
  };
}

export async function searchFoodByName(query: string): Promise<FoodItem[]> {
  const url = `${SEARCH_URL}?search_terms=${encodeURIComponent(
    query
  )}&search_simple=1&action=process&json=1&page_size=25&fields=code,product_name,brands,image_front_small_url,serving_size,nutriments`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Search failed (${res.status})`);
  const data = await res.json();
  const products: OffProduct[] = data.products ?? [];
  return products.map(toFoodItem).filter((f): f is FoodItem => f !== null);
}

export async function lookupFoodByBarcode(barcode: string): Promise<FoodItem | null> {
  const url = `${PRODUCT_URL}/${encodeURIComponent(
    barcode
  )}.json?fields=code,product_name,brands,image_front_small_url,serving_size,nutriments`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Lookup failed (${res.status})`);
  const data = await res.json();
  if (data.status !== 1 || !data.product) return null;
  return toFoodItem(data.product);
}
