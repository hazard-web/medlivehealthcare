export interface ProductCompliance {
  hsn: string;
  mrp: number;
  gstRate: number;
  manufacturer: string;
  countryOfOrigin: string;
  storage: string;
  shelfLife?: string;
  certifications: string[];
  disclaimer: string;
}

const DEFAULT_DISCLAIMER =
  "For home care and general hygiene use only. Not a substitute for professional medical advice, diagnosis, or treatment.";

export const productComplianceById: Record<string, ProductCompliance> = {
  "nitrile-gloves-small": {
    hsn: "40151900",
    mrp: 1905,
    gstRate: 0.12,
    manufacturer: "MedLive Healthcare Pvt. Ltd.",
    countryOfOrigin: "India",
    storage: "Store in a cool, dry place away from direct sunlight.",
    shelfLife: "36 months from date of manufacture",
    certifications: ["ISO 13485", "CE Marked", "Latex-free"],
    disclaimer: DEFAULT_DISCLAIMER,
  },
  "nitrile-gloves-medium": {
    hsn: "40151900",
    mrp: 1905,
    gstRate: 0.12,
    manufacturer: "MedLive Healthcare Pvt. Ltd.",
    countryOfOrigin: "India",
    storage: "Store in a cool, dry place away from direct sunlight.",
    shelfLife: "36 months from date of manufacture",
    certifications: ["ISO 13485", "CE Marked", "Latex-free"],
    disclaimer: DEFAULT_DISCLAIMER,
  },
  "nitrile-gloves-large": {
    hsn: "40151900",
    mrp: 1905,
    gstRate: 0.12,
    manufacturer: "MedLive Healthcare Pvt. Ltd.",
    countryOfOrigin: "India",
    storage: "Store in a cool, dry place away from direct sunlight.",
    shelfLife: "36 months from date of manufacture",
    certifications: ["ISO 13485", "CE Marked", "Latex-free"],
    disclaimer: DEFAULT_DISCLAIMER,
  },
  "latex-exam-gloves-small": {
    hsn: "40151900",
    mrp: 1905,
    gstRate: 0.12,
    manufacturer: "MedLive Healthcare Pvt. Ltd.",
    countryOfOrigin: "India",
    storage: "Store in a cool, dry place away from direct sunlight.",
    shelfLife: "36 months from date of manufacture",
    certifications: ["ISO 13485", "CE Marked"],
    disclaimer: DEFAULT_DISCLAIMER,
  },
  "latex-exam-gloves-medium": {
    hsn: "40151900",
    mrp: 1905,
    gstRate: 0.12,
    manufacturer: "MedLive Healthcare Pvt. Ltd.",
    countryOfOrigin: "India",
    storage: "Store in a cool, dry place away from direct sunlight.",
    shelfLife: "36 months from date of manufacture",
    certifications: ["ISO 13485", "CE Marked"],
    disclaimer: DEFAULT_DISCLAIMER,
  },
  "latex-exam-gloves-large": {
    hsn: "40151900",
    mrp: 1905,
    gstRate: 0.12,
    manufacturer: "MedLive Healthcare Pvt. Ltd.",
    countryOfOrigin: "India",
    storage: "Store in a cool, dry place away from direct sunlight.",
    shelfLife: "36 months from date of manufacture",
    certifications: ["ISO 13485", "CE Marked"],
    disclaimer: DEFAULT_DISCLAIMER,
  },
  "respect-adult-pants-s": {
    hsn: "96190030",
    mrp: 476,
    gstRate: 0.12,
    manufacturer: "Entealth Hygiene Pvt. Ltd.",
    countryOfOrigin: "India",
    storage: "Store in a dry, hygienic place. Keep pack sealed until use.",
    certifications: ["ISO 9001", "Dermatologically tested"],
    disclaimer: DEFAULT_DISCLAIMER,
  },
  "respect-adult-pants-m": {
    hsn: "96190030",
    mrp: 524,
    gstRate: 0.12,
    manufacturer: "Entealth Hygiene Pvt. Ltd.",
    countryOfOrigin: "India",
    storage: "Store in a dry, hygienic place. Keep pack sealed until use.",
    certifications: ["ISO 9001", "Dermatologically tested"],
    disclaimer: DEFAULT_DISCLAIMER,
  },
  "respect-adult-pants-l": {
    hsn: "96190030",
    mrp: 571,
    gstRate: 0.12,
    manufacturer: "Entealth Hygiene Pvt. Ltd.",
    countryOfOrigin: "India",
    storage: "Store in a dry, hygienic place. Keep pack sealed until use.",
    certifications: ["ISO 9001", "Dermatologically tested"],
    disclaimer: DEFAULT_DISCLAIMER,
  },
  "respect-adult-pants-xl": {
    hsn: "96190030",
    mrp: 619,
    gstRate: 0.12,
    manufacturer: "Entealth Hygiene Pvt. Ltd.",
    countryOfOrigin: "India",
    storage: "Store in a dry, hygienic place. Keep pack sealed until use.",
    certifications: ["ISO 9001", "Dermatologically tested"],
    disclaimer: DEFAULT_DISCLAIMER,
  },
  "respect-adult-pants-xxl": {
    hsn: "96190030",
    mrp: 667,
    gstRate: 0.12,
    manufacturer: "Entealth Hygiene Pvt. Ltd.",
    countryOfOrigin: "India",
    storage: "Store in a dry, hygienic place. Keep pack sealed until use.",
    certifications: ["ISO 9001", "Dermatologically tested"],
    disclaimer: DEFAULT_DISCLAIMER,
  },
  "respect-adult-pants-xxxl": {
    hsn: "96190030",
    mrp: 714,
    gstRate: 0.12,
    manufacturer: "Entealth Hygiene Pvt. Ltd.",
    countryOfOrigin: "India",
    storage: "Store in a dry, hygienic place. Keep pack sealed until use.",
    certifications: ["ISO 9001", "Dermatologically tested"],
    disclaimer: DEFAULT_DISCLAIMER,
  },
  "adult-choice-pants-m": {
    hsn: "96190030",
    mrp: 429,
    gstRate: 0.12,
    manufacturer: "Entealth Hygiene Pvt. Ltd.",
    countryOfOrigin: "India",
    storage: "Store in a dry, hygienic place. Keep pack sealed until use.",
    certifications: ["ISO 9001"],
    disclaimer: DEFAULT_DISCLAIMER,
  },
  "adult-choice-pants-l": {
    hsn: "96190030",
    mrp: 476,
    gstRate: 0.12,
    manufacturer: "Entealth Hygiene Pvt. Ltd.",
    countryOfOrigin: "India",
    storage: "Store in a dry, hygienic place. Keep pack sealed until use.",
    certifications: ["ISO 9001"],
    disclaimer: DEFAULT_DISCLAIMER,
  },
  "adult-choice-pants-xl": {
    hsn: "96190030",
    mrp: 524,
    gstRate: 0.12,
    manufacturer: "Entealth Hygiene Pvt. Ltd.",
    countryOfOrigin: "India",
    storage: "Store in a dry, hygienic place. Keep pack sealed until use.",
    certifications: ["ISO 9001"],
    disclaimer: DEFAULT_DISCLAIMER,
  },
  "adult-choice-pants-xxl": {
    hsn: "96190030",
    mrp: 571,
    gstRate: 0.12,
    manufacturer: "Entealth Hygiene Pvt. Ltd.",
    countryOfOrigin: "India",
    storage: "Store in a dry, hygienic place. Keep pack sealed until use.",
    certifications: ["ISO 9001"],
    disclaimer: DEFAULT_DISCLAIMER,
  },
  "disinfectant-wipes-80": {
    hsn: "38089400",
    mrp: 169,
    gstRate: 0.12,
    manufacturer: "Core Clean Hygiene",
    countryOfOrigin: "India",
    storage: "Store below 30°C. Reseal after each use.",
    shelfLife: "24 months from date of manufacture",
    certifications: ["ISO 9001", "99.99% germ kill tested"],
    disclaimer: DEFAULT_DISCLAIMER,
  },
};

export function getProductCompliance(productId: string): ProductCompliance | null {
  return productComplianceById[productId] ?? null;
}

/** MedLive seller GSTIN for tax invoices */
export const SELLER_GSTIN = "27AABCM1234F1Z5";
export const SELLER_LEGAL_NAME = "MedLive Healthcare Pvt. Ltd.";
export const SELLER_ADDRESS =
  "42, Healthcare Park, Andheri East, Mumbai, Maharashtra 400069, India";
