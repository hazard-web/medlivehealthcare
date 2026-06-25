import { Product } from "./types";

const local = (file: string) => `/products/${file}`;
const nitrile = (file: string) => `/products/medlive/nitrile/${file}`;
const latex = (file: string) => `/products/medlive/latex/${file}`;
const respect = (file: string) => `/products/medlive/respect/${file}`;
const adultChoice = (file: string) => `/products/medlive/adult-choice/${file}`;
const wipes = (file: string) => `/products/medlive/wipes/${file}`;

const NITRILE_GALLERY = [
  nitrile("medlive-nitrile-01-hero.png"),
  nitrile("medlive-nitrile-02-packshot.png"),
  nitrile("medlive-nitrile-03-bedside.png"),
  nitrile("medlive-nitrile-04-elderly.png"),
  nitrile("medlive-nitrile-05-kid.png"),
];

const LATEX_GALLERY = [
  latex("medlive-latex-01-hero.png"),
  latex("medlive-latex-02-packshot.png"),
  latex("medlive-latex-03-bedside.png"),
  latex("medlive-latex-04-elderly.png"),
  latex("medlive-latex-05-homecare.png"),
];

const RESPECT_GALLERY = [
  respect("medlive-respect-01-hero.png"),
  respect("medlive-respect-02-packshot.png"),
  respect("medlive-respect-03-bedside.png"),
  respect("medlive-respect-04-elderly.png"),
  respect("medlive-respect-05-stack.png"),
];

const ADULT_CHOICE_GALLERY = [
  adultChoice("medlive-adult-choice-01-hero.png"),
  adultChoice("medlive-adult-choice-02-packshot.png"),
  adultChoice("medlive-adult-choice-03-recovery.png"),
  adultChoice("medlive-adult-choice-04-caregiver.png"),
  adultChoice("medlive-adult-choice-05-stack.png"),
];

const WIPES_GALLERY = [
  wipes("medlive-wipes-01-hero.png"),
  wipes("medlive-wipes-02-packshot.png"),
  wipes("medlive-wipes-03-surface.png"),
  wipes("medlive-wipes-04-medical.png"),
  wipes("medlive-wipes-05-stack.png"),
];

const RESPECT_IDS = [
  "respect-adult-pants-s",
  "respect-adult-pants-m",
  "respect-adult-pants-l",
  "respect-adult-pants-xl",
  "respect-adult-pants-xxl",
  "respect-adult-pants-xxxl",
] as const;

const ADULT_CHOICE_IDS = [
  "adult-choice-pants-m",
  "adult-choice-pants-l",
  "adult-choice-pants-xl",
  "adult-choice-pants-xxl",
] as const;

/** Product images */
export const productImageById: Record<string, string> = {
  // Gloves — MedLive nitrile (packshot for all sizes)
  "nitrile-gloves-small": NITRILE_GALLERY[1],
  "nitrile-gloves-medium": NITRILE_GALLERY[1],
  "nitrile-gloves-large": NITRILE_GALLERY[1],

  // Gloves — MedLive latex (packshot for all sizes)
  "latex-exam-gloves-small": LATEX_GALLERY[1],
  "latex-exam-gloves-medium": LATEX_GALLERY[1],
  "latex-exam-gloves-large": LATEX_GALLERY[1],

  // Adult diapers — RESPECT (packshot on card; distinct hover per size)
  "respect-adult-pants-s": RESPECT_GALLERY[1],
  "respect-adult-pants-m": RESPECT_GALLERY[1],
  "respect-adult-pants-l": RESPECT_GALLERY[1],
  "respect-adult-pants-xl": RESPECT_GALLERY[1],
  "respect-adult-pants-xxl": RESPECT_GALLERY[1],
  "respect-adult-pants-xxxl": RESPECT_GALLERY[1],

  // Adult diapers — ADULT CHOICE (packshot on card; distinct hover per size)
  "adult-choice-pants-m": ADULT_CHOICE_GALLERY[1],
  "adult-choice-pants-l": ADULT_CHOICE_GALLERY[1],
  "adult-choice-pants-xl": ADULT_CHOICE_GALLERY[1],
  "adult-choice-pants-xxl": ADULT_CHOICE_GALLERY[1],

  // Hygiene — Core Clean wipes
  "disinfectant-wipes-80": WIPES_GALLERY[0],
};

export const productHoverImageById: Record<string, string> = {
  "nitrile-gloves-small": NITRILE_GALLERY[0],
  "nitrile-gloves-medium": NITRILE_GALLERY[2],
  "nitrile-gloves-large": NITRILE_GALLERY[3],

  "latex-exam-gloves-small": LATEX_GALLERY[0],
  "latex-exam-gloves-medium": LATEX_GALLERY[2],
  "latex-exam-gloves-large": LATEX_GALLERY[3],

  "respect-adult-pants-s": RESPECT_GALLERY[0],
  "respect-adult-pants-m": RESPECT_GALLERY[2],
  "respect-adult-pants-l": RESPECT_GALLERY[3],
  "respect-adult-pants-xl": RESPECT_GALLERY[4],
  "respect-adult-pants-xxl": RESPECT_GALLERY[0],
  "respect-adult-pants-xxxl": RESPECT_GALLERY[2],

  "adult-choice-pants-m": ADULT_CHOICE_GALLERY[0],
  "adult-choice-pants-l": ADULT_CHOICE_GALLERY[2],
  "adult-choice-pants-xl": ADULT_CHOICE_GALLERY[3],
  "adult-choice-pants-xxl": ADULT_CHOICE_GALLERY[4],

  "disinfectant-wipes-80": WIPES_GALLERY[1],
};

export const productGalleryById: Record<string, string[]> = Object.fromEntries([
  ...RESPECT_IDS.map((id) => [id, [...RESPECT_GALLERY]]),
  ...ADULT_CHOICE_IDS.map((id) => [id, [...ADULT_CHOICE_GALLERY]]),
]) as Record<string, string[]>;

Object.assign(productGalleryById, {
  "nitrile-gloves-small": [...NITRILE_GALLERY],
  "nitrile-gloves-medium": [...NITRILE_GALLERY],
  "nitrile-gloves-large": [...NITRILE_GALLERY],
  "latex-exam-gloves-small": [...LATEX_GALLERY],
  "latex-exam-gloves-medium": [...LATEX_GALLERY],
  "latex-exam-gloves-large": [...LATEX_GALLERY],
  "disinfectant-wipes-80": [...WIPES_GALLERY],
});

export const imageFallbacks: Record<string, string> = {};

export const FALLBACK_PRODUCT_IMAGE = "/products/medical-supplies.svg";

export function resolveOrderProductImage(productId: string, storedImage?: string): string {
  return productImageById[productId] ?? storedImage ?? FALLBACK_PRODUCT_IMAGE;
}

export function getProductImage(product: Product): string {
  return productImageById[product.id] ?? FALLBACK_PRODUCT_IMAGE;
}

/** Lifestyle card images need a logo badge; packshots/stacks already show branding. */
export function showCardLogoOverlay(src: string): boolean {
  if (!src.includes("/products/medlive/")) return false;
  if (src.includes("-packshot") || src.includes("-stack")) return false;
  return true;
}
