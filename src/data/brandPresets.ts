import { BrandPreset } from '../types/card';

// SVG Helper to generate realistic physical card background patterns
const createFidatyCardDesign = () => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="380" viewBox="0 0 600 380">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0b5336" />
        <stop offset="50%" stop-color="#073a26" />
        <stop offset="100%" stop-color="#032014" />
      </linearGradient>
      <pattern id="pat" width="20" height="20" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="1" fill="#d4af37" opacity="0.15" />
      </pattern>
    </defs>
    <rect width="600" height="380" rx="24" fill="url(#g)" />
    <rect width="600" height="380" rx="24" fill="url(#pat)" />
    <path d="M450,-50 L650,200 L550,450 Z" fill="#d4af37" opacity="0.08" />
    <g transform="translate(480, 50)">
      <!-- Golden Strawberry emblem -->
      <path d="M0,20 C-10,35 -20,60 0,85 C20,60 10,35 0,20 Z" fill="#d4af37" opacity="0.85" />
      <circle cx="-3" cy="40" r="1.5" fill="#0b5336" />
      <circle cx="3" cy="45" r="1.5" fill="#0b5336" />
      <circle cx="-1" cy="55" r="1.5" fill="#0b5336" />
      <path d="M-8,22 Q0,10 8,22" stroke="#d4af37" stroke-width="3" fill="none" />
    </g>
    <text x="40" y="70" font-family="'Plus Jakarta Sans', sans-serif" font-weight="900" font-size="28" fill="#d4af37" letter-spacing="2">FÌDATY</text>
    <text x="40" y="95" font-family="'Plus Jakarta Sans', sans-serif" font-weight="600" font-size="12" fill="#ffffff" opacity="0.75" letter-spacing="4">ESSELUNGA</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const createConadCardDesign = () => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="380" viewBox="0 0 600 380">
    <defs>
      <linearGradient id="cg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fdb913" />
        <stop offset="60%" stop-color="#f59c00" />
        <stop offset="100%" stop-color="#e07b00" />
      </linearGradient>
    </defs>
    <rect width="600" height="380" rx="24" fill="url(#cg)" />
    <!-- Daisy flowers graphic -->
    <g transform="translate(490, 70)" opacity="0.35">
      <circle cx="0" cy="0" r="28" fill="#ffffff" />
      <circle cx="0" cy="0" r="12" fill="#fdb913" />
    </g>
    <g transform="translate(540, 130)" opacity="0.25">
      <circle cx="0" cy="0" r="20" fill="#ffffff" />
      <circle cx="0" cy="0" r="8" fill="#fdb913" />
    </g>
    <rect x="0" y="270" width="600" height="110" fill="#d6001c" rx="0" />
    <text x="40" y="65" font-family="'Plus Jakarta Sans', sans-serif" font-weight="900" font-size="28" fill="#d6001c" letter-spacing="1">CONAD</text>
    <text x="40" y="90" font-family="'Plus Jakarta Sans', sans-serif" font-weight="700" font-size="16" fill="#1f2937">Carta Insieme</text>
    <text x="40" y="325" font-family="'Plus Jakarta Sans', sans-serif" font-weight="800" font-size="18" fill="#ffffff" letter-spacing="2">PERSONE OLTRE LE COSE</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const createCoopCardDesign = () => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="380" viewBox="0 0 600 380">
    <rect width="600" height="380" rx="24" fill="#ffffff" />
    <path d="M0,0 L600,0 L600,160 L0,120 Z" fill="#e2001a" />
    <text x="40" y="90" font-family="'Plus Jakarta Sans', sans-serif" font-weight="900" font-size="44" fill="#ffffff" letter-spacing="-1">coop</text>
    <text x="40" y="220" font-family="'Plus Jakarta Sans', sans-serif" font-weight="800" font-size="22" fill="#e2001a">Carta Socio Coop</text>
    <text x="40" y="245" font-family="'Plus Jakarta Sans', sans-serif" font-weight="500" font-size="13" fill="#64748b">La tua cooperativa di consumatori</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const createCartaFrecciaDesign = () => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="380" viewBox="0 0 600 380">
    <defs>
      <linearGradient id="fg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#1e2229" />
        <stop offset="100%" stop-color="#0a0c0e" />
      </linearGradient>
    </defs>
    <rect width="600" height="380" rx="24" fill="url(#fg)" />
    <!-- Dynamic Red Arrow -->
    <path d="M-50,220 L380,80 L650,80 L650,110 L370,110 L-50,250 Z" fill="#d90429" opacity="0.95" />
    <path d="M-50,260 L420,120 L650,120 L650,135 L410,135 L-50,275 Z" fill="#ffffff" opacity="0.25" />
    <text x="40" y="65" font-family="'Plus Jakarta Sans', sans-serif" font-weight="800" font-size="24" fill="#ffffff" letter-spacing="1">CARTA<tspan fill="#d90429">FRECCIA</tspan></text>
    <text x="40" y="90" font-family="'Plus Jakarta Sans', sans-serif" font-weight="600" font-size="11" fill="#94a3b8" letter-spacing="3">TRENITALIA GRUPPO FS</text>
    <text x="40" y="325" font-family="'Plus Jakarta Sans', sans-serif" font-weight="700" font-size="14" fill="#d90429">FRECCIAROSSA</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const createCarrefourDesign = () => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="380" viewBox="0 0 600 380">
    <defs>
      <linearGradient id="car" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#004691" />
        <stop offset="100%" stop-color="#002347" />
      </linearGradient>
    </defs>
    <rect width="600" height="380" rx="24" fill="url(#car)" />
    <!-- Payback bubble circles -->
    <circle cx="500" cy="90" r="32" fill="#0077c8" opacity="0.6" />
    <circle cx="530" cy="130" r="24" fill="#ffffff" opacity="0.3" />
    <text x="40" y="70" font-family="'Plus Jakarta Sans', sans-serif" font-weight="900" font-size="30" fill="#ffffff">Carrefour</text>
    <text x="40" y="100" font-family="'Plus Jakarta Sans', sans-serif" font-weight="700" font-size="16" fill="#facc15">SpesAmica PAYBACK</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const createDecathlonDesign = () => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="380" viewBox="0 0 600 380">
    <defs>
      <linearGradient id="dec" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0082c3" />
        <stop offset="100%" stop-color="#005885" />
      </linearGradient>
    </defs>
    <rect width="600" height="380" rx="24" fill="url(#dec)" />
    <path d="M420,-40 L640,160 L500,420 Z" fill="#ffffff" opacity="0.08" />
    <text x="40" y="75" font-family="'Plus Jakarta Sans', sans-serif" font-weight="900" font-size="32" fill="#ffffff" letter-spacing="1">DECATHLON</text>
    <text x="40" y="105" font-family="'Plus Jakarta Sans', sans-serif" font-weight="700" font-size="14" fill="#ffffff" opacity="0.85">CLUB ITALIA</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const createTigotaDesign = () => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="380" viewBox="0 0 600 380">
    <defs>
      <linearGradient id="tig" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#00805a" />
        <stop offset="100%" stop-color="#004d36" />
      </linearGradient>
    </defs>
    <rect width="600" height="380" rx="24" fill="url(#tig)" />
    <circle cx="510" cy="80" r="60" fill="#e3007f" opacity="0.85" />
    <text x="40" y="75" font-family="'Plus Jakarta Sans', sans-serif" font-weight="900" font-size="34" fill="#ffffff">Tigotà</text>
    <text x="40" y="105" font-family="'Plus Jakarta Sans', sans-serif" font-weight="600" font-size="14" fill="#ffffff" opacity="0.9">FideliTì Club</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const createAcquaSaponeDesign = () => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="380" viewBox="0 0 600 380">
    <defs>
      <linearGradient id="as" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#00a3e0" />
        <stop offset="100%" stop-color="#006599" />
      </linearGradient>
    </defs>
    <rect width="600" height="380" rx="24" fill="url(#as)" />
    <!-- Soap bubble circles -->
    <circle cx="480" cy="70" r="30" fill="#ffffff" opacity="0.25" />
    <circle cx="530" cy="110" r="18" fill="#ffffff" opacity="0.3" />
    <circle cx="450" cy="130" r="12" fill="#ffffff" opacity="0.2" />
    <text x="40" y="70" font-family="'Plus Jakarta Sans', sans-serif" font-weight="900" font-size="26" fill="#ffffff">ACQUA &amp; SAPONE</text>
    <text x="40" y="98" font-family="'Plus Jakarta Sans', sans-serif" font-weight="600" font-size="13" fill="#ffffff" opacity="0.9">Club Fedeltà</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const createMediaWorldDesign = () => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="380" viewBox="0 0 600 380">
    <defs>
      <linearGradient id="mw" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#df0000" />
        <stop offset="100%" stop-color="#8f0000" />
      </linearGradient>
    </defs>
    <rect width="600" height="380" rx="24" fill="url(#mw)" />
    <!-- MediaWorld swirling orbit -->
    <circle cx="510" cy="80" r="45" stroke="#ffffff" stroke-width="4" fill="none" opacity="0.4" />
    <text x="40" y="75" font-family="'Plus Jakarta Sans', sans-serif" font-weight="900" font-size="30" fill="#ffffff">MediaWorld</text>
    <text x="40" y="105" font-family="'Plus Jakarta Sans', sans-serif" font-weight="700" font-size="15" fill="#facc15">Club Member</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const createUnieuroDesign = () => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="380" viewBox="0 0 600 380">
    <defs>
      <linearGradient id="uni" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#002b49" />
        <stop offset="100%" stop-color="#001828" />
      </linearGradient>
    </defs>
    <rect width="600" height="380" rx="24" fill="url(#uni)" />
    <!-- Orange Heart -->
    <path d="M510,70 C510,50 490,40 475,55 C460,40 440,50 440,70 C440,95 475,120 475,120 C475,120 510,95 510,70 Z" fill="#ff6600" />
    <text x="40" y="75" font-family="'Plus Jakarta Sans', sans-serif" font-weight="900" font-size="30" fill="#ffffff">unieuro</text>
    <text x="40" y="105" font-family="'Plus Jakarta Sans', sans-serif" font-weight="700" font-size="14" fill="#ff6600">Club Fedeltà</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const createLidlPlusDesign = () => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="380" viewBox="0 0 600 380">
    <defs>
      <linearGradient id="lid" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0050aa" />
        <stop offset="100%" stop-color="#002d62" />
      </linearGradient>
    </defs>
    <rect width="600" height="380" rx="24" fill="url(#lid)" />
    <circle cx="510" cy="80" r="38" fill="#fff000" stroke="#d50000" stroke-width="4" />
    <text x="510" y="88" font-family="'Plus Jakarta Sans', sans-serif" font-weight="900" font-size="18" fill="#0050aa" text-anchor="middle">LIDL</text>
    <text x="40" y="75" font-family="'Plus Jakarta Sans', sans-serif" font-weight="900" font-size="30" fill="#ffffff">Lidl <tspan fill="#fff000">Plus</tspan></text>
    <text x="40" y="105" font-family="'Plus Jakarta Sans', sans-serif" font-weight="600" font-size="13" fill="#ffffff" opacity="0.9">Carta Digitale Italia</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const createIkeaDesign = () => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="380" viewBox="0 0 600 380">
    <defs>
      <linearGradient id="ik" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0058a3" />
        <stop offset="100%" stop-color="#003566" />
      </linearGradient>
    </defs>
    <rect width="600" height="380" rx="24" fill="url(#ik)" />
    <ellipse cx="500" cy="75" rx="50" ry="28" fill="#ffcc00" />
    <text x="500" y="83" font-family="'Plus Jakarta Sans', sans-serif" font-weight="900" font-size="20" fill="#0058a3" text-anchor="middle" letter-spacing="1">IKEA</text>
    <text x="40" y="75" font-family="'Plus Jakarta Sans', sans-serif" font-weight="900" font-size="28" fill="#ffffff">IKEA Family</text>
    <text x="40" y="105" font-family="'Plus Jakarta Sans', sans-serif" font-weight="600" font-size="13" fill="#ffcc00">Italia</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const createFarmacapRomaDesign = () => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="380" viewBox="0 0 600 380">
    <defs>
      <linearGradient id="fc" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#00836b" />
        <stop offset="100%" stop-color="#00473a" />
      </linearGradient>
    </defs>
    <rect width="600" height="380" rx="24" fill="url(#fc)" />
    <!-- Pharmacy Cross -->
    <g transform="translate(490, 75)">
      <rect x="-8" y="-24" width="16" height="48" fill="#ffffff" opacity="0.3" rx="4" />
      <rect x="-24" y="-8" width="48" height="16" fill="#ffffff" opacity="0.3" rx="4" />
    </g>
    <text x="40" y="65" font-family="'Plus Jakarta Sans', sans-serif" font-weight="900" font-size="24" fill="#ffffff">FARMACAP</text>
    <text x="40" y="90" font-family="'Plus Jakarta Sans', sans-serif" font-weight="700" font-size="14" fill="#facc15">Farmacie Comunali di Roma</text>
    <text x="40" y="115" font-family="'Plus Jakarta Sans', sans-serif" font-weight="500" font-size="12" fill="#ffffff" opacity="0.8">Carta Salute Fedeltà</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const POPULAR_BRANDS: BrandPreset[] = [
  // --- POPULAR ITALIAN & ROME STORES ---
  {
    id: 'esselunga-fidaty',
    name: 'Esselunga Fìdaty',
    category: 'grocery',
    barcodeFormat: 'EAN13',
    color: '#073a26',
    gradientTo: '#032014',
    textColor: 'light',
    logoPlaceholder: 'ESSE',
    sampleNumberPattern: '0401829482910',
    website: 'esselunga.it',
    country: 'IT',
    cardDesignUrl: createFidatyCardDesign(),
  },
  {
    id: 'conad-insieme',
    name: 'Conad Carta Insieme',
    category: 'grocery',
    barcodeFormat: 'EAN13',
    color: '#f59c00',
    gradientTo: '#d6001c',
    textColor: 'light',
    logoPlaceholder: 'CND',
    sampleNumberPattern: '2401829481029',
    website: 'conad.it',
    country: 'IT',
    cardDesignUrl: createConadCardDesign(),
  },
  {
    id: 'coop-socio',
    name: 'Coop Carta Socio',
    category: 'grocery',
    barcodeFormat: 'EAN13',
    color: '#e2001a',
    gradientTo: '#990010',
    textColor: 'light',
    logoPlaceholder: 'COOP',
    sampleNumberPattern: '2981048291038',
    website: 'coop.it',
    country: 'IT',
    cardDesignUrl: createCoopCardDesign(),
  },
  {
    id: 'carrefour-italia',
    name: 'Carrefour SpesAmica PAYBACK',
    category: 'grocery',
    barcodeFormat: 'EAN13',
    color: '#004691',
    gradientTo: '#002347',
    textColor: 'light',
    logoPlaceholder: 'CRF',
    sampleNumberPattern: '2401829482019',
    website: 'carrefour.it',
    country: 'IT',
    cardDesignUrl: createCarrefourDesign(),
  },
  {
    id: 'trenitalia-cartafreccia',
    name: 'CartaFRECCIA Trenitalia',
    category: 'travel',
    barcodeFormat: 'CODE128',
    color: '#1e2229',
    gradientTo: '#d90429',
    textColor: 'light',
    logoPlaceholder: 'FR',
    sampleNumberPattern: 'CF19284019',
    website: 'trenitalia.com',
    country: 'IT',
    cardDesignUrl: createCartaFrecciaDesign(),
  },
  {
    id: 'decathlon-italia',
    name: 'Decathlon Club Italia',
    category: 'sports',
    barcodeFormat: 'EAN13',
    color: '#0082c3',
    gradientTo: '#005885',
    textColor: 'light',
    logoPlaceholder: 'DECA',
    sampleNumberPattern: '2093847291038',
    website: 'decathlon.it',
    country: 'IT',
    cardDesignUrl: createDecathlonDesign(),
  },
  {
    id: 'acqua-sapone',
    name: 'Acqua & Sapone Club',
    category: 'pharmacy',
    barcodeFormat: 'EAN13',
    color: '#00a3e0',
    gradientTo: '#006599',
    textColor: 'light',
    logoPlaceholder: 'A&S',
    sampleNumberPattern: '9820481928310',
    website: 'acquaesapone.it',
    country: 'IT',
    cardDesignUrl: createAcquaSaponeDesign(),
  },
  {
    id: 'tigota-fideliti',
    name: 'Tigotà FideliTì',
    category: 'pharmacy',
    barcodeFormat: 'EAN13',
    color: '#00805a',
    gradientTo: '#e3007f',
    textColor: 'light',
    logoPlaceholder: 'TIG',
    sampleNumberPattern: '2981048291041',
    website: 'tigota.it',
    country: 'IT',
    cardDesignUrl: createTigotaDesign(),
  },
  {
    id: 'mediaworld-club',
    name: 'MediaWorld Club',
    category: 'retail',
    barcodeFormat: 'CODE128',
    color: '#df0000',
    gradientTo: '#8f0000',
    textColor: 'light',
    logoPlaceholder: 'MW',
    sampleNumberPattern: '719284019284',
    website: 'mediaworld.it',
    country: 'IT',
    cardDesignUrl: createMediaWorldDesign(),
  },
  {
    id: 'unieuro-club',
    name: 'Unieuro Club',
    category: 'retail',
    barcodeFormat: 'CODE128',
    color: '#002b49',
    gradientTo: '#ff6600',
    textColor: 'light',
    logoPlaceholder: 'UNI',
    sampleNumberPattern: '891028471928',
    website: 'unieuro.it',
    country: 'IT',
    cardDesignUrl: createUnieuroDesign(),
  },
  {
    id: 'lidl-plus-it',
    name: 'Lidl Plus Italia',
    category: 'grocery',
    barcodeFormat: 'QR_CODE',
    color: '#0050aa',
    gradientTo: '#002d62',
    textColor: 'light',
    logoPlaceholder: 'LIDL',
    sampleNumberPattern: 'LIDL-IT-9820194',
    website: 'lidl.it',
    country: 'IT',
    cardDesignUrl: createLidlPlusDesign(),
  },
  {
    id: 'ikea-family-it',
    name: 'IKEA Family Italia',
    category: 'home',
    barcodeFormat: 'CODE128',
    color: '#0058a3',
    gradientTo: '#003566',
    textColor: 'light',
    logoPlaceholder: 'IKEA',
    sampleNumberPattern: '601234567890',
    website: 'ikea.it',
    country: 'IT',
    cardDesignUrl: createIkeaDesign(),
  },
  {
    id: 'farmacap-roma',
    name: 'Farmacap Farmacie Roma',
    category: 'pharmacy',
    barcodeFormat: 'CODE128',
    color: '#00836b',
    gradientTo: '#00473a',
    textColor: 'light',
    logoPlaceholder: 'FCAP',
    sampleNumberPattern: 'FC-94810294',
    website: 'farmacap.it',
    country: 'IT',
    cardDesignUrl: createFarmacapRomaDesign(),
  },
  {
    id: 'sephora-italia',
    name: 'Sephora Beauty Pass',
    category: 'fashion',
    barcodeFormat: 'CODE128',
    color: '#1a1a1a',
    gradientTo: '#2d2d2d',
    textColor: 'light',
    logoPlaceholder: 'SEPH',
    sampleNumberPattern: '100488293012',
    website: 'sephora.it',
    country: 'IT',
  },
  {
    id: 'feltrinelli-carta',
    name: 'la Feltrinelli Carta Più',
    category: 'retail',
    barcodeFormat: 'EAN13',
    color: '#cc0000',
    gradientTo: '#800000',
    textColor: 'light',
    logoPlaceholder: 'FELT',
    sampleNumberPattern: '2849102948190',
    website: 'lafeltrinelli.it',
    country: 'IT',
  },
  {
    id: 'eurospin-it',
    name: 'Eurospin',
    category: 'grocery',
    barcodeFormat: 'EAN13',
    color: '#004691',
    gradientTo: '#facc15',
    textColor: 'light',
    logoPlaceholder: 'SPIN',
    sampleNumberPattern: '2019481029481',
    website: 'eurospin.it',
    country: 'IT',
  },
  {
    id: 'pam-panorama',
    name: 'Pam Panorama Carta Per Te',
    category: 'grocery',
    barcodeFormat: 'EAN13',
    color: '#15803d',
    gradientTo: '#b91c1c',
    textColor: 'light',
    logoPlaceholder: 'PAM',
    sampleNumberPattern: '2491048291024',
    website: 'pampanorama.it',
    country: 'IT',
  },
  {
    id: 'nespresso-italia',
    name: 'Nespresso Club Italia',
    category: 'dining',
    barcodeFormat: 'CODE128',
    color: '#3e2723',
    gradientTo: '#1b0000',
    textColor: 'light',
    logoPlaceholder: 'NESP',
    sampleNumberPattern: '8910482019',
    website: 'nespresso.com',
    country: 'IT',
  },
];
