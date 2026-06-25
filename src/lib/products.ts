import { Product } from "./types";
import { productImageById } from "./product-images";

const img = (id: string) => productImageById[id]!;

export const categories = ["All", "Gloves", "Adult Diapers", "Hygiene"] as const;

export const products: Product[] = [
  // —— Nitrile Gloves (MedLive) ——
  {
    id: "nitrile-gloves-small",
    name: "Nitrile Examination Gloves – Powder Free (Small)",
    description:
      "MedLive nitrile gloves with high tear resistance, latex-free protection and strong grip for longer wear. Powder-free disposable gloves for home patient care and medical examination.",
    price: 249,
    originalPrice: 1905,
    category: "Gloves",
    brand: "MedLive",
    unit: "per box of 100 gloves",
    image: img("nitrile-gloves-small"),
    rating: 4.88,
    reviews: 203,
    inStock: true,
    features: ["Latex-free", "Powder-free", "Textured fingertips"],
  },
  {
    id: "nitrile-gloves-medium",
    name: "Nitrile Examination Gloves – Powder Free (Medium)",
    description:
      "MedLive nitrile gloves with high tear resistance, latex-free protection and strong grip for longer wear. Powder-free disposable gloves for home patient care and medical examination.",
    price: 249,
    originalPrice: 1905,
    category: "Gloves",
    brand: "MedLive",
    unit: "per box of 100 gloves",
    image: img("nitrile-gloves-medium"),
    rating: 4.91,
    reviews: 254,
    inStock: true,
    features: ["Latex-free", "Powder-free", "Ambidextrous"],
  },
  {
    id: "nitrile-gloves-large",
    name: "Nitrile Examination Gloves – Powder Free (Large)",
    description:
      "MedLive nitrile gloves with high tear resistance, latex-free protection and strong grip for longer wear. Powder-free disposable gloves for home patient care and medical examination.",
    price: 249,
    originalPrice: 1905,
    category: "Gloves",
    brand: "MedLive",
    unit: "per box of 100 gloves",
    image: img("nitrile-gloves-large"),
    rating: 4.83,
    reviews: 149,
    inStock: true,
    features: ["Latex-free", "Chemo-rated option", "Box of 100"],
  },

  // —— Latex Examination Gloves (MedLive) ——
  {
    id: "latex-exam-gloves-small",
    name: "Latex Examination Gloves – Powdered (Small)",
    description:
      "MedLive latex gloves with light powder for easy donning and comfortable everyday use. Ideal for home care and clinics.",
    price: 239,
    originalPrice: 1905,
    category: "Gloves",
    brand: "MedLive",
    unit: "per box of 100 gloves",
    image: img("latex-exam-gloves-small"),
    rating: 4.69,
    reviews: 97,
    inStock: true,
    features: ["Light powdered", "Comfortable fit", "100 gloves per box"],
  },
  {
    id: "latex-exam-gloves-medium",
    name: "Latex Examination Gloves – Powdered (Medium)",
    description:
      "MedLive latex gloves with light powder for easy donning and comfortable everyday use. Ideal for home care and clinics.",
    price: 239,
    originalPrice: 1905,
    category: "Gloves",
    brand: "MedLive",
    unit: "per box of 100 gloves",
    image: img("latex-exam-gloves-medium"),
    rating: 4.87,
    reviews: 236,
    inStock: true,
    features: ["Light powdered", "Comfortable fit", "100 gloves per box"],
  },
  {
    id: "latex-exam-gloves-large",
    name: "Latex Examination Gloves – Powdered (Large)",
    description:
      "MedLive latex gloves with light powder for easy donning and comfortable everyday use. Ideal for home care and clinics.",
    price: 239,
    originalPrice: 1905,
    category: "Gloves",
    brand: "MedLive",
    unit: "per box of 100 gloves",
    image: img("latex-exam-gloves-large"),
    rating: 4.75,
    reviews: 132,
    inStock: true,
    features: ["Light powdered", "Comfortable fit", "100 gloves per box"],
  },

  // —— RESPECT Adult Diapers (Entealth) ——
  {
    id: "respect-adult-pants-s",
    name: "RESPECT Unisex Adult Pants – Pack of 10 Pcs | Size : (S)",
    description:
      "Premium adult care pants with super absorbent core, leak guards and breathable outer layer. Up to 10 hours of dryness with wetness indicator.",
    price: 175,
    originalPrice: 476,
    category: "Adult Diapers",
    brand: "RESPECT",
    unit: "pack of 10 pcs",
    image: img("respect-adult-pants-s"),
    rating: 4.81,
    reviews: 165,
    inStock: true,
    features: ["Super absorbent", "Leak guards", "Wetness indicator"],
  },
  {
    id: "respect-adult-pants-m",
    name: "RESPECT Unisex Adult Pants – Pack of 10 Pcs | Size : (M)",
    description:
      "Premium adult care pants with super absorbent core, leak guards and breathable outer layer. Up to 10 hours of dryness with wetness indicator.",
    price: 188,
    originalPrice: 524,
    category: "Adult Diapers",
    brand: "RESPECT",
    unit: "pack of 10 pcs",
    image: img("respect-adult-pants-m"),
    rating: 4.73,
    reviews: 178,
    inStock: true,
    features: ["Super absorbent", "Leak guards", "Odour lock"],
  },
  {
    id: "respect-adult-pants-l",
    name: "RESPECT Unisex Adult Pants – Pack of 10 Pcs | Size : (L)",
    description:
      "Premium adult care pants with super absorbent core, leak guards and breathable outer layer. Up to 10 hours of dryness with wetness indicator.",
    price: 200,
    originalPrice: 571,
    category: "Adult Diapers",
    brand: "RESPECT",
    unit: "pack of 10 pcs",
    image: img("respect-adult-pants-l"),
    rating: 4.84,
    reviews: 194,
    inStock: true,
    features: ["Overnight protection", "Pull-up style", "Size L"],
  },
  {
    id: "respect-adult-pants-xl",
    name: "RESPECT Unisex Adult Pants – Pack of 10 Pcs | Size : (XL)",
    description:
      "Premium adult care pants with super absorbent core, leak guards and breathable outer layer. Up to 10 hours of dryness with wetness indicator.",
    price: 213,
    originalPrice: 619,
    category: "Adult Diapers",
    brand: "RESPECT",
    unit: "pack of 10 pcs",
    image: img("respect-adult-pants-xl"),
    rating: 4.65,
    reviews: 182,
    inStock: true,
    features: ["Extra large fit", "360° leak protection", "Pack of 10"],
  },
  {
    id: "respect-adult-pants-xxl",
    name: "RESPECT Unisex Adult Pants – Pack of 10 Pcs | Size : (XXL)",
    description:
      "Premium adult care pants with super absorbent core, leak guards and breathable outer layer. Up to 10 hours of dryness with wetness indicator.",
    price: 225,
    originalPrice: 667,
    category: "Adult Diapers",
    brand: "RESPECT",
    unit: "pack of 10 pcs",
    image: img("respect-adult-pants-xxl"),
    rating: 4.43,
    reviews: 147,
    inStock: true,
    features: ["XXL size", "Breathable", "Unisex fit"],
  },
  {
    id: "respect-adult-pants-xxxl",
    name: "RESPECT Unisex Adult Pants – Pack of 10 Pcs | Size : (XXXL)",
    description:
      "Premium adult care pants with super absorbent core, leak guards and breathable outer layer. Up to 10 hours of dryness with wetness indicator.",
    price: 238,
    originalPrice: 714,
    category: "Adult Diapers",
    brand: "RESPECT",
    unit: "pack of 10 pcs",
    image: img("respect-adult-pants-xxxl"),
    rating: 4.88,
    reviews: 126,
    inStock: true,
    features: ["XXXL size", "10-hour protection", "Pack of 10"],
  },

  // —— ADULT CHOICE Adult Diapers (Entealth) ——
  {
    id: "adult-choice-pants-m",
    name: "ADULT CHOICE Unisex Adult Pants – Pack of 10 Pcs | Size : (M)",
    description:
      "Affordable adult care pants for elderly and post-surgery recovery. Soft, breathable and highly absorbent pull-up style diapers.",
    price: 181,
    originalPrice: 429,
    category: "Adult Diapers",
    brand: "ADULT CHOICE",
    unit: "pack of 10 pcs",
    image: img("adult-choice-pants-m"),
    rating: 4.66,
    reviews: 173,
    inStock: true,
    features: ["Value pack", "Breathable", "Easy tear sides"],
  },
  {
    id: "adult-choice-pants-l",
    name: "ADULT CHOICE Unisex Adult Pants – Pack of 10 Pcs | Size : (L)",
    description:
      "Affordable adult care pants for elderly and post-surgery recovery. Soft, breathable and highly absorbent pull-up style diapers.",
    price: 194,
    originalPrice: 476,
    category: "Adult Diapers",
    brand: "ADULT CHOICE",
    unit: "pack of 10 pcs",
    image: img("adult-choice-pants-l"),
    rating: 4.78,
    reviews: 168,
    inStock: true,
    features: ["Size L", "Wetness indicator", "Pack of 10"],
  },
  {
    id: "adult-choice-pants-xl",
    name: "ADULT CHOICE Unisex Adult Pants – Pack of 10 Pcs | Size : (XL)",
    description:
      "Affordable adult care pants for elderly and post-surgery recovery. Soft, breathable and highly absorbent pull-up style diapers.",
    price: 206,
    originalPrice: 524,
    category: "Adult Diapers",
    brand: "ADULT CHOICE",
    unit: "pack of 10 pcs",
    image: img("adult-choice-pants-xl"),
    rating: 4.87,
    reviews: 155,
    inStock: true,
    features: ["XL size", "Odour control", "Pack of 10"],
  },
  {
    id: "adult-choice-pants-xxl",
    name: "ADULT CHOICE Unisex Adult Pants – Pack of 10 Pcs | Size : (XXL)",
    description:
      "Affordable adult care pants for elderly and post-surgery recovery. Soft, breathable and highly absorbent pull-up style diapers.",
    price: 219,
    originalPrice: 571,
    category: "Adult Diapers",
    brand: "ADULT CHOICE",
    unit: "pack of 10 pcs",
    image: img("adult-choice-pants-xxl"),
    rating: 4.58,
    reviews: 187,
    inStock: true,
    features: ["XXL size", "Pull-up style", "Pack of 10"],
  },

  // —— Hygiene (Entealth) ——
  {
    id: "disinfectant-wipes-80",
    name: "Disinfectant Wet Wipes – Pack of 80 Wipes",
    description:
      "Core Clean sanitising multipurpose wet wipes for surfaces, hands and medical equipment. Helps eliminate 99.99% of bacteria and viruses.",
    price: 100,
    originalPrice: 169,
    category: "Hygiene",
    brand: "Core Clean",
    unit: "pack of 80 wipes",
    image: img("disinfectant-wipes-80"),
    rating: 4.67,
    reviews: 224,
    inStock: true,
    features: ["99.99% germ kill", "Multipurpose", "Resealable pack"],
  },
];

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getProductsByCategory(category: string): Product[] {
  if (category === "All") return products;
  return products.filter((p) => p.category === category);
}

export function getDiscountPercent(product: Product): number | null {
  if (!product.originalPrice || product.originalPrice <= product.price) return null;
  return Math.round((1 - product.price / product.originalPrice) * 100);
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

/** INR with paise — for bulk save badges and discount breakdowns. */
export function formatPriceDetailed(price: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

export const homeSections = [
  { title: "Nitrile Gloves for Home Care", category: "Gloves", filter: "nitrile", cardLogoBadge: true },
  { title: "RESPECT Premium Adult Care Pants", category: "Adult Diapers", filter: "respect" },
  { title: "ADULT CHOICE Adult Care Pants", category: "Adult Diapers", filter: "adult-choice" },
  { title: "Sanitising Multipurpose Wet Wipes", category: "Hygiene", filter: "wipes" },
  { title: "Latex Gloves for Home Care", category: "Gloves", filter: "latex" },
] as const;

export function getProductsForSection(
  category: string,
  filter?: string,
  limit = 4
): Product[] {
  let result = getProductsByCategory(category);
  if (filter === "nitrile") result = result.filter((p) => p.id.includes("nitrile"));
  else if (filter === "latex") result = result.filter((p) => p.id.includes("latex-exam"));
  else if (filter === "respect") result = result.filter((p) => p.id.includes("respect"));
  else if (filter === "adult-choice") result = result.filter((p) => p.id.includes("adult-choice"));
  else if (filter === "wipes") result = result.filter((p) => p.id.includes("wipes"));
  return result.slice(0, limit);
}
