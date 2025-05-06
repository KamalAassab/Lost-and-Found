import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number | string) {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  return new Intl.NumberFormat('fr-MA', {
    style: 'currency',
    currency: 'MAD',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(numPrice);
}

export function createSlug(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export function applyHoodiePromotion(items: any[]) {
  const hoodieItems = items.filter(item => item.category === 'hoodie')
    .sort((a, b) => Number(b.price) - Number(a.price));
  
  let remainingItems = [...hoodieItems];
  const freeItems = [];
  
  while (remainingItems.length >= 4) {
    // Take the first 3 items (most expensive)
    const paidItems = remainingItems.splice(0, 3);
    // Take the next item (least expensive of the group) as free
    const freeItem = remainingItems.shift();
    if (freeItem) {
      freeItems.push(freeItem);
    }
  }
  
  return { paidItems: remainingItems, freeItems };
}

export function applyTshirtPromotion(items: any[]) {
  const tshirtItems = items.filter(item => item.category === 'tshirt')
    .sort((a, b) => Number(b.price) - Number(a.price));
  
  let remainingItems = [...tshirtItems];
  const freeItems = [];
  
  while (remainingItems.length >= 3) {
    // Take the first 2 items (most expensive)
    const paidItems = remainingItems.splice(0, 2);
    // Take the next item (least expensive of the group) as free
    const freeItem = remainingItems.shift();
    if (freeItem) {
      freeItems.push(freeItem);
    }
  }
  
  return { paidItems: remainingItems, freeItems };
}

export function hasValue<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}
