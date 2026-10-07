// Merch catalogue helpers.
//
// Products are managed in the admin dashboard (Merch tab) and stored in Firebase. Until products have been
// imported there, the shop shows the starter catalogue below. Product photos are either the site's own images
// (stored as "asset:<key>", see builtInImages) or photos uploaded in the dashboard (stored inside the product).
import hoodieBlackFront from '../assets/images/merch/hoodie-black-front.webp';
import hoodieBlackBack from '../assets/images/merch/hoodie-black-back.webp';
import hoodieGreenFront from '../assets/images/merch/hoodie-green-front.webp';
import hoodieWhiteFront from '../assets/images/merch/hoodie-white-front.webp';
import hoodieWhiteBack from '../assets/images/merch/hoodie-white-back.webp';
import teeBlackFront from '../assets/images/merch/tee-black-front.webp';
import teeBlackBack from '../assets/images/merch/tee-black-back.webp';
import teeGreenWhiteFront from '../assets/images/merch/tee-green-white-print-front.webp';
import teeGreenWhiteBack from '../assets/images/merch/tee-green-white-print-back.webp';
import teeGreenBlackFront from '../assets/images/merch/tee-green-black-print-front.webp';
import teeGreenBlackBack from '../assets/images/merch/tee-green-black-print-back.webp';
import teeWhiteBlackFront from '../assets/images/merch/tee-white-black-print-front.webp';
import teeWhiteBlackBack from '../assets/images/merch/tee-white-black-print-back.webp';
import teeWhiteGreenFront from '../assets/images/merch/tee-white-green-print-front.webp';
import teeWhiteGreenBack from '../assets/images/merch/tee-white-green-print-back.webp';
import capEmblem from '../assets/images/merch/cap-emblem.webp';
import capWordmark from '../assets/images/merch/cap-wordmark.webp';
import bucketHatEmblem from '../assets/images/merch/buckethat-emblem.webp';
import bucketHatWordmark from '../assets/images/merch/buckethat-wordmark.webp';

export const merchTagline = 'Cultivating a Calm Amidst the Chaos';

// Must match the list in firestore.rules (isValidProduct).
export const productCategories = ['Hoodies', 'T-shirts', 'Caps', 'Bucket hats', 'Other'];
export const sizeOptions = ['S', 'M', 'L', 'XL', 'XXL', 'One size'];
export const imageLabels = ['Front', 'Back', 'Side', 'Detail'];
export const MAX_PRODUCT_IMAGES = 4;
export const MAX_PRODUCT_COLORS = 8;

const builtInImages = {
  'hoodie-black-front': hoodieBlackFront,
  'hoodie-black-back': hoodieBlackBack,
  'hoodie-green-front': hoodieGreenFront,
  'hoodie-white-front': hoodieWhiteFront,
  'hoodie-white-back': hoodieWhiteBack,
  'tee-black-front': teeBlackFront,
  'tee-black-back': teeBlackBack,
  'tee-green-white-print-front': teeGreenWhiteFront,
  'tee-green-white-print-back': teeGreenWhiteBack,
  'tee-green-black-print-front': teeGreenBlackFront,
  'tee-green-black-print-back': teeGreenBlackBack,
  'tee-white-black-print-front': teeWhiteBlackFront,
  'tee-white-black-print-back': teeWhiteBlackBack,
  'tee-white-green-print-front': teeWhiteGreenFront,
  'tee-white-green-print-back': teeWhiteGreenBack,
  'cap-emblem': capEmblem,
  'cap-wordmark': capWordmark,
  'buckethat-emblem': bucketHatEmblem,
  'buckethat-wordmark': bucketHatWordmark,
};

// Turns a stored image reference into something an <img> can show.
export function resolveImage(src) {
  return src.startsWith('asset:') ? builtInImages[src.slice('asset:'.length)] ?? '' : src;
}

const CLOTHING_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];
const HOODIE_PRICE = 2000;
const TEE_PRICE = 550;
const CAP_PRICE = 350;
const BUCKET_HAT_PRICE = 500;
const ONE_SIZE = ['One size'];
const hoodieDetails = ['Pullover hoodie with drawstring hood', 'Front kangaroo pocket', 'Emblem printed on the left upper chest'];
const teeDetails = ['Classic crew-neck T-shirt', 'Emblem printed on the left upper chest'];
const capDetails = ['Structured six-panel cap with a curved peak', 'Adjustable strap at the back'];
const bucketHatDetails = ['Soft cotton bucket hat with a stitched brim', 'Side air vents'];
const view = (key, label) => ({ src: `asset:${key}`, label });
// A colour option with its own photos. `legacyId` is the separate product this colour used to be, before colours
// were combined into one product (see the "Combine colours" tool in the dashboard).
const color = (name, legacyId, ...images) => ({ name, legacyId, images });

// The starter catalogue: shown until products are imported in the dashboard, then used for that import.
export const starterProducts = [
  {
    id: 'hoodie',
    name: 'Hoodie',
    category: 'Hoodies',
    price: HOODIE_PRICE,
    sizes: CLOTHING_SIZES,
    colors: [
      color('Black', 'hoodie-black', view('hoodie-black-front', 'Front'), view('hoodie-black-back', 'Back')),
      color('Green', 'hoodie-green', view('hoodie-green-front', 'Front')),
      color('White', 'hoodie-white', view('hoodie-white-front', 'Front'), view('hoodie-white-back', 'Back')),
    ],
    description: 'A warm pullover hoodie with the Mind Over Matter emblem on the chest. The black and white hoodies also carry the bold “Mind over Matter” wordmark across the upper back.',
    details: hoodieDetails,
  },
  {
    id: 'tee',
    name: 'T-shirt',
    category: 'T-shirts',
    price: TEE_PRICE,
    sizes: CLOTHING_SIZES,
    colors: [
      color('Black', 'tee-black', view('tee-black-front', 'Front'), view('tee-black-back', 'Back')),
      color('Green, white print', 'tee-green-white-print', view('tee-green-white-print-front', 'Front'), view('tee-green-white-print-back', 'Back')),
      color('Green, black print', 'tee-green-black-print', view('tee-green-black-print-front', 'Front'), view('tee-green-black-print-back', 'Back')),
      color('White, black print', 'tee-white-black-print', view('tee-white-black-print-front', 'Front'), view('tee-white-black-print-back', 'Back')),
      color('White, green print', 'tee-white-green-print', view('tee-white-green-print-front', 'Front'), view('tee-white-green-print-back', 'Back')),
    ],
    description: `A classic crew-neck T-shirt with the emblem on the chest and our motto on the back: “Mind over Matter: ${merchTagline}”.`,
    details: [...teeDetails, 'Script motto on the upper back'],
  },
  {
    id: 'cap-emblem',
    name: 'White cap, emblem',
    category: 'Caps',
    price: CAP_PRICE,
    sizes: ONE_SIZE,
    images: [view('cap-emblem', 'Front')],
    description: `A white cap with the full Mind Over Matter emblem on the front, ringed with our motto: “${merchTagline}”.`,
    details: [...capDetails, 'Circular emblem printed on the front'],
  },
  {
    id: 'cap-wordmark',
    name: 'White cap, wordmark',
    category: 'Caps',
    price: CAP_PRICE,
    sizes: ONE_SIZE,
    images: [view('cap-wordmark', 'Front')],
    description: 'A white cap with the colourful “Mind over Matter” wordmark across the front.',
    details: [...capDetails, 'Mind over Matter wordmark printed on the front'],
  },
  {
    id: 'buckethat-emblem',
    name: 'Bucket hat, emblem',
    category: 'Bucket hats',
    price: BUCKET_HAT_PRICE,
    sizes: ONE_SIZE,
    images: [view('buckethat-emblem', 'Front')],
    description: 'A light grey bucket hat with the Mind Over Matter emblem on the front. Easy shade for days on campus.',
    details: [...bucketHatDetails, 'Circular emblem printed on the front'],
  },
  {
    id: 'buckethat-wordmark',
    name: 'Bucket hat, wordmark',
    category: 'Bucket hats',
    price: BUCKET_HAT_PRICE,
    sizes: ONE_SIZE,
    images: [view('buckethat-wordmark', 'Front')],
    description: 'A light grey bucket hat with the colourful “Mind over Matter” wordmark across the front.',
    details: [...bucketHatDetails, 'Mind over Matter wordmark printed on the front'],
  },
].map((product, index) => ({
  ...product,
  images: product.colors?.[0].images ?? product.images,
  colors: product.colors ?? [],
  available: true,
  sortOrder: index,
}));

const shillings = new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 });

export function formatPrice(amount) {
  return amount === null || amount === undefined ? 'Price coming soon' : shillings.format(amount);
}

// Total for a list of { price, quantity } lines, or null if any line has no price.
export function orderTotal(lines) {
  if (lines.some((line) => line.price === null || line.price === undefined)) return null;
  return lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
}
