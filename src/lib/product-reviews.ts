export interface ProductReview {
  id: string;
  name: string;
  city: string;
  rating: number;
  date: string;
  title: string;
  body: string;
}

const GLOVE_REVIEWS: ProductReview[] = [
  {
    id: "g1",
    name: "Priya Sharma",
    city: "Noida",
    rating: 5,
    date: "8 March 2026",
    title: "Perfect for home patient care",
    body: "We use these daily while caring for my father at home. Powder-free, easy to wear, and no latex allergy issues. Delivery was quick too.",
  },
  {
    id: "g2",
    name: "Rajesh Kumar",
    city: "Mumbai",
    rating: 5,
    date: "2 March 2026",
    title: "Good grip and sturdy",
    body: "MedLive gloves feel thicker than local pharmacy packs. Textured fingertips help when handling medicines and feeding tubes.",
  },
  {
    id: "g3",
    name: "Ananya Iyer",
    city: "Bengaluru",
    rating: 4,
    date: "24 February 2026",
    title: "Comfortable fit for long use",
    body: "Small size fits well. Wore them through a full night shift for home nursing. Only wish the box had a dispense slot.",
  },
  {
    id: "g4",
    name: "Mohammad Faizan",
    city: "Lucknow",
    rating: 5,
    date: "14 February 2026",
    title: "Value for money in bulk",
    body: "Ordered 50 packets for our clinic store. Quality is consistent across boxes and the bulk discount made sense for us.",
  },
];

const DIAPER_REVIEWS: ProductReview[] = [
  {
    id: "d1",
    name: "Sunita Devi",
    city: "Patna",
    rating: 5,
    date: "6 March 2026",
    title: "Reliable for overnight use",
    body: "Bought for my mother-in-law. No leakage through the night and the waistband sits comfortably without redness.",
  },
  {
    id: "d2",
    name: "Vikram Singh",
    city: "Jaipur",
    rating: 5,
    date: "28 February 2026",
    title: "Easy for caregivers to change",
    body: "Tear-away sides are helpful when we assist at home. Absorbency is good and the pack size lasts the whole month.",
  },
  {
    id: "d3",
    name: "Lakshmi Nair",
    city: "Kochi",
    rating: 4,
    date: "18 February 2026",
    title: "Soft and discreet",
    body: "RESPECT pants fit my father well in XL. Material feels soft on skin. Delivery to Kerala was within the promised window.",
  },
];

const HYGIENE_REVIEWS: ProductReview[] = [
  {
    id: "h1",
    name: "Arjun Mehta",
    city: "Ahmedabad",
    rating: 5,
    date: "5 March 2026",
    title: "Handy for bedside cleaning",
    body: "Wipes are moist enough for bedside tables and wheelchair handles. Mild smell and good size for home care routines.",
  },
  {
    id: "h2",
    name: "Kavita Reddy",
    city: "Hyderabad",
    rating: 5,
    date: "20 February 2026",
    title: "Keeps surfaces germ-free",
    body: "We keep a pack near the patient room. Useful for quick wipe-downs between nurse visits. Will reorder.",
  },
];

const DEFAULT_REVIEWS: ProductReview[] = [
  {
    id: "x1",
    name: "Deepak Joshi",
    city: "Pune",
    rating: 5,
    date: "1 March 2026",
    title: "Exactly as described",
    body: "Product matched the listing. Packaging was neat and MedLive support answered my PIN code query before I ordered.",
  },
  {
    id: "x2",
    name: "Meera Kulkarni",
    city: "Nagpur",
    rating: 4,
    date: "22 February 2026",
    title: "Happy with the purchase",
    body: "Good quality for home healthcare needs. Checkout was simple and the order arrived in good condition.",
  },
];

export function getProductReviews(productId: string, category: string): ProductReview[] {
  if (productId.includes("nitrile") || productId.includes("latex")) {
    return GLOVE_REVIEWS;
  }
  if (category === "Adult Diapers" || productId.includes("pants")) {
    return DIAPER_REVIEWS;
  }
  if (category === "Hygiene" || productId.includes("wipes")) {
    return HYGIENE_REVIEWS;
  }
  return DEFAULT_REVIEWS;
}
