export interface PincodeCheckResult {
  serviceable: boolean;
  message: string;
  /** Town / post office (when known). */
  city?: string;
  /** District / sorting district (when known). */
  district?: string;
  state?: string;
  eta?: string;
  region?: string;
}

export function isValidPincode(pincode: string): boolean {
  return /^\d{6}$/.test(pincode.trim());
}

/** Format as Town (District, State) — e.g. Khair (Aligarh, Uttar Pradesh). */
export function formatPincodeLocation(parts: {
  town?: string;
  district?: string;
  state?: string;
}): string {
  const { town, district, state } = parts;
  const districtState = [district, state].filter(Boolean).join(", ");

  if (town && districtState) return `${town} (${districtState})`;
  if (town) return town;
  if (district && state) return `${district} (${state})`;
  if (district) return district;
  return state ?? "your area";
}

/** 3-digit PIN prefix → city (India Post sorting districts). */
const CITY_BY_PREFIX3: Record<string, { city: string; state: string }> = {
  "110": { city: "New Delhi", state: "Delhi" },
  "111": { city: "New Delhi", state: "Delhi" },
  "122": { city: "Gurugram", state: "Haryana" },
  "123": { city: "Faridabad", state: "Haryana" },
  "201": { city: "Ghaziabad", state: "Uttar Pradesh" },
  "202": { city: "Aligarh", state: "Uttar Pradesh" },
  "203": { city: "Meerut", state: "Uttar Pradesh" },
  "208": { city: "Kanpur", state: "Uttar Pradesh" },
  "226": { city: "Lucknow", state: "Uttar Pradesh" },
  "221": { city: "Varanasi", state: "Uttar Pradesh" },
  "302": { city: "Jaipur", state: "Rajasthan" },
  "380": { city: "Ahmedabad", state: "Gujarat" },
  "390": { city: "Vadodara", state: "Gujarat" },
  "400": { city: "Mumbai", state: "Maharashtra" },
  "411": { city: "Pune", state: "Maharashtra" },
  "440": { city: "Nagpur", state: "Maharashtra" },
  "500": { city: "Hyderabad", state: "Telangana" },
  "560": { city: "Bengaluru", state: "Karnataka" },
  "570": { city: "Mysuru", state: "Karnataka" },
  "600": { city: "Chennai", state: "Tamil Nadu" },
  "641": { city: "Coimbatore", state: "Tamil Nadu" },
  "682": { city: "Kochi", state: "Kerala" },
  "700": { city: "Kolkata", state: "West Bengal" },
  "751": { city: "Bhubaneswar", state: "Odisha" },
  "800": { city: "Patna", state: "Bihar" },
  "834": { city: "Ranchi", state: "Jharkhand" },
  "160": { city: "Chandigarh", state: "Chandigarh" },
  "141": { city: "Ludhiana", state: "Punjab" },
  "143": { city: "Amritsar", state: "Punjab" },
};

/** 2-digit PIN prefix → state fallback. */
const STATE_BY_PREFIX2: Record<string, string> = {
  "11": "Delhi",
  "12": "Haryana",
  "13": "Haryana",
  "14": "Punjab",
  "15": "Punjab",
  "16": "Chandigarh",
  "17": "Himachal Pradesh",
  "18": "Jammu & Kashmir",
  "20": "Uttar Pradesh",
  "21": "Uttar Pradesh",
  "22": "Uttar Pradesh",
  "23": "Uttar Pradesh",
  "24": "Uttar Pradesh",
  "25": "Uttar Pradesh",
  "26": "Uttar Pradesh",
  "27": "Uttar Pradesh",
  "28": "Uttar Pradesh",
  "30": "Rajasthan",
  "31": "Rajasthan",
  "32": "Rajasthan",
  "33": "Rajasthan",
  "34": "Rajasthan",
  "36": "Gujarat",
  "37": "Gujarat",
  "38": "Gujarat",
  "39": "Gujarat",
  "40": "Maharashtra",
  "41": "Maharashtra",
  "42": "Maharashtra",
  "43": "Maharashtra",
  "44": "Maharashtra",
  "45": "Madhya Pradesh",
  "46": "Madhya Pradesh",
  "47": "Madhya Pradesh",
  "48": "Madhya Pradesh",
  "49": "Chhattisgarh",
  "50": "Telangana",
  "51": "Andhra Pradesh",
  "52": "Andhra Pradesh",
  "53": "Andhra Pradesh",
  "56": "Karnataka",
  "57": "Karnataka",
  "58": "Karnataka",
  "59": "Karnataka",
  "60": "Tamil Nadu",
  "61": "Tamil Nadu",
  "62": "Tamil Nadu",
  "63": "Tamil Nadu",
  "64": "Tamil Nadu",
  "67": "Kerala",
  "68": "Kerala",
  "69": "Kerala",
  "70": "West Bengal",
  "71": "West Bengal",
  "72": "West Bengal",
  "73": "West Bengal",
  "74": "West Bengal",
  "75": "Odisha",
  "76": "Odisha",
  "78": "Assam",
  "79": "North East",
  "80": "Bihar",
  "81": "Bihar",
  "82": "Bihar",
  "83": "Jharkhand",
  "84": "Bihar",
};

const METRO_PREFIXES3 = new Set([
  "110", "122", "400", "411", "500", "560", "600", "700",
]);

/**
 * 6-digit PIN → exact town/post office + district.
 * Keep this small (demo) and extend as needed for your catalog/regions.
 */
const EXACT_BY_PIN: Record<
  string,
  { town: string; district: string; state: string; office?: string }
> = {
  // Uttar Pradesh
  "202138": { town: "Khair", district: "Aligarh", state: "Uttar Pradesh" },
};

function resolveLocation(pincode: string): {
  town?: string;
  district?: string;
  state: string;
} {
  const exact = EXACT_BY_PIN[pincode];
  if (exact) {
    return { town: exact.town, district: exact.district, state: exact.state };
  }

  const prefix3 = pincode.slice(0, 3);
  const districtHit = CITY_BY_PREFIX3[prefix3];
  if (districtHit) {
    return { district: districtHit.city, state: districtHit.state };
  }

  const prefix2 = pincode.slice(0, 2);
  const state = STATE_BY_PREFIX2[prefix2] ?? "India";
  return { state };
}

/** Demo pincode serviceability — pan-India with city lookup. */
export function checkPincode(pincode: string): PincodeCheckResult {
  const code = pincode.trim();

  if (!code) {
    return { serviceable: false, message: "Enter your 6-digit PIN code" };
  }

  if (!isValidPincode(code)) {
    return { serviceable: false, message: "PIN code must be exactly 6 digits" };
  }

  if (code === "999999") {
    return {
      serviceable: false,
      message: "Sorry, we do not deliver to this PIN code yet",
    };
  }

  const { town, district, state } = resolveLocation(code);
  const prefix3 = code.slice(0, 3);
  const isMetro = METRO_PREFIXES3.has(prefix3) || ["11", "12", "13"].includes(code.slice(0, 2));

  const locationLabel = formatPincodeLocation({ town, district, state });

  return {
    serviceable: true,
    message: `Delivery available in ${locationLabel}`,
    city: town,
    district,
    state,
    eta: isMetro ? "2–4 business days" : "4–7 business days",
    region: isMetro ? "Metro / Tier-1" : "Pan India",
  };
}
