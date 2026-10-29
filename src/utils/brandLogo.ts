/**
 * Brand Logo & Brandfetch Integration Utility
 * Leverages Brandfetch (https://brandfetch.com/developers) CDN for high-resolution brand logos,
 * with multi-tier fallback (Google Favicon CDN and crisp monogram badges).
 */

const KNOWN_DOMAINS: Record<string, string> = {
  // Supermarket & Grocery (Italy & International)
  esselunga: 'esselunga.it',
  fidaty: 'esselunga.it',
  conad: 'conad.it',
  coop: 'coop.it',
  unicoop: 'coop.it',
  carrefour: 'carrefour.it',
  lidl: 'lidl.it',
  eurospin: 'eurospin.it',
  pam: 'pampanorama.it',
  panorama: 'pampanorama.it',
  md: 'mdspa.it',
  penny: 'penny.it',
  despar: 'despar.it',
  spar: 'despar.it',
  crai: 'crai-supermercati.it',
  todis: 'todis.it',
  tuodi: 'tuodi.it',
  sigma: 'supersigma.com',
  ins: 'insmercato.it',
  bennet: 'bennet.com',
  albi: 'aldi.it',
  aldi: 'aldi.it',

  // Travel & Transport
  trenitalia: 'trenitalia.com',
  cartafreccia: 'trenitalia.com',
  frecciarossa: 'trenitalia.com',
  frecciargento: 'trenitalia.com',
  italo: 'italotreno.it',
  italotreno: 'italotreno.it',
  atac: 'atac.roma.it',
  telepass: 'telepass.com',
  ita: 'ita-airways.com',
  alitalia: 'ita-airways.com',
  ryanair: 'ryanair.com',
  easyjet: 'easyjet.com',
  wizz: 'wizzair.com',
  wizzair: 'wizzair.com',
  flixbus: 'flixbus.it',

  // Sports & Outdoors
  decathlon: 'decathlon.it',
  cisalfa: 'cisalfasport.it',
  nike: 'nike.com',
  adidas: 'adidas.it',
  footlocker: 'footlocker.it',
  awlab: 'aw-lab.com',

  // Electronics & Retail
  mediaworld: 'mediaworld.it',
  mediamarkt: 'mediamarkt.de',
  unieuro: 'unieuro.it',
  euronics: 'euronics.it',
  trony: 'trony.it',
  expert: 'expert.it',
  apple: 'apple.com',
  amazon: 'amazon.it',

  // Personal Care, Drugstore & Pharmacy
  acquasapone: 'acquaesapone.it',
  acqua: 'acquaesapone.it',
  tigota: 'tigota.it',
  sephora: 'sephora.it',
  douglas: 'douglas.it',
  kiko: 'kikocosmetics.com',
  mac: 'maccosmetics.it',
  bottegaverde: 'bottegaverde.it',
  farmacap: 'farmacap.it',
  benu: 'benu.it',
  lloyds: 'benu.it',

  // Fashion & Apparel
  zara: 'zara.com',
  hm: 'hm.com',
  mango: 'mango.com',
  ovs: 'ovs.it',
  calzedonia: 'calzedonia.com',
  intimissimi: 'intimissimi.com',
  tezenis: 'tezenis.com',
  stradivarius: 'stradivarius.com',
  pullandbear: 'pullandbear.com',
  bershka: 'bershka.com',
  massimodutti: 'massimodutti.com',
  geox: 'geox.com',
  benetton: 'benetton.com',

  // Home, Furniture & DIY
  ikea: 'ikea.it',
  leroymerlin: 'leroymerlin.it',
  bricofer: 'bricofer.it',
  bricocenter: 'bricocenter.it',
  obi: 'obi-italia.it',
  maisonsdumonde: 'maisonsdumonde.com',
  kasanova: 'kasanova.com',

  // Dining & Coffee
  nespresso: 'nespresso.com',
  starbucks: 'starbucks.it',
  eataly: 'eataly.net',
  mcdonalds: 'mcdonalds.it',
  mcdonald: 'mcdonalds.it',
  burgerking: 'burgerking.it',
  kfc: 'kfc.it',
  autogrill: 'autogrill.it',

  // Books & Entertainment
  feltrinelli: 'lafeltrinelli.it',
  lafeltrinelli: 'lafeltrinelli.it',
  mondadori: 'mondadoristore.it',

  // Pet Care
  arcaplanet: 'arcaplanet.it',
  isoladeitesori: 'isoladeitesori.it',

  // Fuel & Loyalty programs
  payback: 'payback.it',
  eni: 'eni.com',
  q8: 'q8.it',
  esso: 'esso.it',
  tamoil: 'tamoil.it',
  ip: 'gruppoapi.com',
};

/**
 * Returns the Brandfetch Client ID configured by the user (if any)
 */
export function getBrandfetchClientId(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('cazzocard_brandfetch_client_id') || '';
}

/**
 * Saves or clears the user's Brandfetch Client ID
 */
export function setBrandfetchClientId(clientId: string): void {
  if (typeof window === 'undefined') return;
  if (!clientId.trim()) {
    localStorage.removeItem('cazzocard_brandfetch_client_id');
  } else {
    localStorage.setItem('cazzocard_brandfetch_client_id', clientId.trim());
  }
}

/**
 * Resolves a store or brand name to a domain
 */
export function resolveBrandDomain(storeName: string, customWebsite?: string): string {
  if (customWebsite && customWebsite.includes('.')) {
    return customWebsite.replace(/^https?:\/\//, '').replace(/\/.*$/, '').trim();
  }

  const raw = storeName.toLowerCase().trim();

  // If the raw name already looks like a domain (e.g. conad.it)
  if (raw.includes('.') && !raw.includes(' ')) {
    return raw;
  }

  // Check known keyword matches
  for (const [key, domain] of Object.entries(KNOWN_DOMAINS)) {
    if (raw.includes(key)) {
      return domain;
    }
  }

  // Strip generic filler words: "carta", "club", "fidelity", "italia", "roma", "insieme", "card", "supermercati"
  const cleaned = raw
    .replace(/\b(carta|club|fidelity|italia|roma|insieme|card|supermercati|supermercato|farmacie|famila|plus|spesamica)\b/g, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();

  if (cleaned.length >= 2) {
    if (KNOWN_DOMAINS[cleaned]) {
      return KNOWN_DOMAINS[cleaned];
    }
    return `${cleaned}.it`;
  }

  const fallback = raw.replace(/[^a-z0-9]/g, '');
  return fallback ? `${fallback}.it` : 'brand.com';
}

/**
 * Generates brand logo URLs using Brandfetch CDN and Google Favicon fallback
 */
export function getBrandLogoSources(storeName: string, customWebsite?: string): {
  brandfetchUrl: string;
  googleFaviconUrl: string;
  domain: string;
} {
  const domain = resolveBrandDomain(storeName, customWebsite);
  const clientId = getBrandfetchClientId();

  // Brandfetch CDN endpoint (https://cdn.brandfetch.io/{domain})
  // Optional client ID parameter ?c={clientId} if user provided one
  const brandfetchUrl = clientId
    ? `https://cdn.brandfetch.io/${domain}?c=${encodeURIComponent(clientId)}`
    : `https://cdn.brandfetch.io/${domain}`;

  // High-res Google Favicon CDN backup
  const googleFaviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;

  return {
    brandfetchUrl,
    googleFaviconUrl,
    domain,
  };
}

/**
 * Extracts 2-3 uppercase initials from a store name for the fallback avatar
 */
export function getBrandInitials(name: string): string {
  if (!name) return 'CD';
  const clean = name
    .replace(/\b(carta|club|fidelity|per te|insieme)\b/gi, '')
    .trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return clean.slice(0, 3).toUpperCase();
}
