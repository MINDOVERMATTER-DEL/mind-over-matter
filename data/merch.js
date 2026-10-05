// Merch catalogue. To set a price, replace `price: null` with the amount in Kenyan shillings, e.g. `price: 2500`.
// While a price is null the shop shows "Price coming soon" and the club confirms the price when it contacts the
// buyer. Images live in assets/images/merch/ (front first; the back view is optional).
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

const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

const hoodieDetails = ['Pullover hoodie with drawstring hood', 'Front kangaroo pocket', 'Emblem printed on the left upper chest'];
const teeDetails = ['Classic crew-neck T-shirt', 'Emblem printed on the left upper chest'];

export const merchProducts = [
  {
    id: 'hoodie-black',
    name: 'Black hoodie',
    category: 'Hoodies',
    price: null,
    sizes: SIZES,
    images: [
      { src: hoodieBlackFront, label: 'Front' },
      { src: hoodieBlackBack, label: 'Back' },
    ],
    description: 'A classic black hoodie with the Mind Over Matter emblem on the chest and the bold “Mind over Matter” wordmark across the upper back.',
    details: [...hoodieDetails, 'Mind over Matter wordmark on the upper back'],
  },
  {
    id: 'hoodie-green',
    name: 'Green hoodie',
    category: 'Hoodies',
    price: null,
    sizes: SIZES,
    images: [{ src: hoodieGreenFront, label: 'Front' }],
    description: 'Our signature green, with the Mind Over Matter emblem on the chest. Simple, warm, and easy to wear every day.',
    details: hoodieDetails,
  },
  {
    id: 'hoodie-white',
    name: 'White hoodie',
    category: 'Hoodies',
    price: null,
    sizes: SIZES,
    images: [
      { src: hoodieWhiteFront, label: 'Front' },
      { src: hoodieWhiteBack, label: 'Back' },
    ],
    description: 'A clean white hoodie with the emblem on the chest and the colourful “Mind over Matter” wordmark across the upper back.',
    details: [...hoodieDetails, 'Mind over Matter wordmark on the upper back'],
  },
  {
    id: 'tee-black',
    name: 'Black T-shirt',
    category: 'T-shirts',
    price: null,
    sizes: SIZES,
    images: [
      { src: teeBlackFront, label: 'Front' },
      { src: teeBlackBack, label: 'Back' },
    ],
    description: `A black T-shirt with the emblem on the chest and our motto on the back: “Mind over Matter: ${merchTagline}”.`,
    details: [...teeDetails, 'Script motto in white on the upper back'],
  },
  {
    id: 'tee-green-white-print',
    name: 'Green T-shirt, white print',
    category: 'T-shirts',
    price: null,
    sizes: SIZES,
    images: [
      { src: teeGreenWhiteFront, label: 'Front' },
      { src: teeGreenWhiteBack, label: 'Back' },
    ],
    description: `Signature green with a crisp white emblem on the chest and our motto on the back: “${merchTagline}”.`,
    details: [...teeDetails, 'White script motto on the upper back'],
  },
  {
    id: 'tee-green-black-print',
    name: 'Green T-shirt, black print',
    category: 'T-shirts',
    price: null,
    sizes: SIZES,
    images: [
      { src: teeGreenBlackFront, label: 'Front' },
      { src: teeGreenBlackBack, label: 'Back' },
    ],
    description: `Signature green with a bold black emblem on the chest and our motto on the back: “${merchTagline}”.`,
    details: [...teeDetails, 'Black script motto on the upper back'],
  },
];

export function findProduct(id) {
  return merchProducts.find((product) => product.id === id) ?? null;
}

const shillings = new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 });

export function formatPrice(amount) {
  return amount === null || amount === undefined ? 'Price coming soon' : shillings.format(amount);
}

// Total for a list of { price, quantity } lines, or null if any line has no price yet.
export function orderTotal(lines) {
  if (lines.some((line) => line.price === null || line.price === undefined)) return null;
  return lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
}
