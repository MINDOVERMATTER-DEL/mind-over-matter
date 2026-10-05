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

export const merchTagline = 'Cultivating a Calm Amidst the Chaos';

// Must match the list in firestore.rules (isValidProduct).
export const productCategories = ['Hoodies', 'T-shirts', 'Caps', 'Bucket hats', 'Other'];
export const sizeOptions = ['S', 'M', 'L', 'XL', 'XXL', 'One size'];
export const imageLabels = ['Front', 'Back', 'Side', 'Detail'];
export const MAX_PRODUCT_IMAGES = 4;

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
};

// Turns a stored image reference into something an <img> can show.
export function resolveImage(src) {
  return src.startsWith('asset:') ? builtInImages[src.slice('asset:'.length)] ?? '' : src;
}

const CLOTHING_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];
const HOODIE_PRICE = 2000;
const TEE_PRICE = 550;
const hoodieDetails = ['Pullover hoodie with drawstring hood', 'Front kangaroo pocket', 'Emblem printed on the left upper chest'];
const teeDetails = ['Classic crew-neck T-shirt', 'Emblem printed on the left upper chest'];
const view = (key, label) => ({ src: `asset:${key}`, label });

// The starter catalogue: shown until products are imported in the dashboard, then used for that import.
export const starterProducts = [
  {
    id: 'hoodie-black',
    name: 'Black hoodie',
    category: 'Hoodies',
    price: HOODIE_PRICE,
    sizes: CLOTHING_SIZES,
    images: [view('hoodie-black-front', 'Front'), view('hoodie-black-back', 'Back')],
    description: 'A classic black hoodie with the Mind Over Matter emblem on the chest and the bold “Mind over Matter” wordmark across the upper back.',
    details: [...hoodieDetails, 'Mind over Matter wordmark on the upper back'],
  },
  {
    id: 'hoodie-green',
    name: 'Green hoodie',
    category: 'Hoodies',
    price: HOODIE_PRICE,
    sizes: CLOTHING_SIZES,
    images: [view('hoodie-green-front', 'Front')],
    description: 'Our signature green, with the Mind Over Matter emblem on the chest. Simple, warm, and easy to wear every day.',
    details: hoodieDetails,
  },
  {
    id: 'hoodie-white',
    name: 'White hoodie',
    category: 'Hoodies',
    price: HOODIE_PRICE,
    sizes: CLOTHING_SIZES,
    images: [view('hoodie-white-front', 'Front'), view('hoodie-white-back', 'Back')],
    description: 'A clean white hoodie with the emblem on the chest and the colourful “Mind over Matter” wordmark across the upper back.',
    details: [...hoodieDetails, 'Mind over Matter wordmark on the upper back'],
  },
  {
    id: 'tee-black',
    name: 'Black T-shirt',
    category: 'T-shirts',
    price: TEE_PRICE,
    sizes: CLOTHING_SIZES,
    images: [view('tee-black-front', 'Front'), view('tee-black-back', 'Back')],
    description: `A black T-shirt with the emblem on the chest and our motto on the back: “Mind over Matter: ${merchTagline}”.`,
    details: [...teeDetails, 'Script motto in white on the upper back'],
  },
  {
    id: 'tee-green-white-print',
    name: 'Green T-shirt, white print',
    category: 'T-shirts',
    price: TEE_PRICE,
    sizes: CLOTHING_SIZES,
    images: [view('tee-green-white-print-front', 'Front'), view('tee-green-white-print-back', 'Back')],
    description: `Signature green with a crisp white emblem on the chest and our motto on the back: “${merchTagline}”.`,
    details: [...teeDetails, 'White script motto on the upper back'],
  },
  {
    id: 'tee-green-black-print',
    name: 'Green T-shirt, black print',
    category: 'T-shirts',
    price: TEE_PRICE,
    sizes: CLOTHING_SIZES,
    images: [view('tee-green-black-print-front', 'Front'), view('tee-green-black-print-back', 'Back')],
    description: `Signature green with a bold black emblem on the chest and our motto on the back: “${merchTagline}”.`,
    details: [...teeDetails, 'Black script motto on the upper back'],
  },
].map((product, index) => ({ ...product, available: true, sortOrder: index }));

const shillings = new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 });

export function formatPrice(amount) {
  return amount === null || amount === undefined ? 'Price coming soon' : shillings.format(amount);
}

// Total for a list of { price, quantity } lines, or null if any line has no price.
export function orderTotal(lines) {
  if (lines.some((line) => line.price === null || line.price === undefined)) return null;
  return lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
}
