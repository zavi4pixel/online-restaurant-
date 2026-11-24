import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import express from 'express';
import { MENU_CATEGORIES, MENU_ITEMS } from './src/data/menu.ts';
import type {
  ContactInquiry,
  FulfillmentType,
  OrderRecord,
  OrderStage,
  OrderTimelineEntry,
  Reservation,
  SeatingZone,
  TimeSlotAvailability,
} from './src/types/restaurant.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, '.data');
const STORE_PATH = path.resolve(DATA_DIR, 'store.json');
if (!STORE_PATH.startsWith(DATA_DIR + path.sep)) {
  throw new Error('Invalid store path boundary');
}

const SIGNING_SECRET =
  process.env.PAYMENT_SIGNING_SECRET && process.env.PAYMENT_SIGNING_SECRET.trim().length > 0
    ? process.env.PAYMENT_SIGNING_SECRET.trim()
    : crypto.randomBytes(32).toString('hex');

const TAX_RATE = 0.08625;
const DELIVERY_FEE = 6.5;

const TIME_SLOTS: { time: string; label: string }[] = [
  { time: '17:00', label: '5:00 PM' },
  { time: '17:30', label: '5:30 PM' },
  { time: '18:00', label: '6:00 PM' },
  { time: '18:30', label: '6:30 PM' },
  { time: '19:00', label: '7:00 PM' },
  { time: '19:30', label: '7:30 PM' },
  { time: '20:00', label: '8:00 PM' },
  { time: '20:30', label: '8:30 PM' },
  { time: '21:00', label: '9:00 PM' },
  { time: '21:30', label: '9:30 PM' },
];

const ZONE_CAPACITY: Record<SeatingZone, number> = {
  'Main Dining Room': 6,
  "Chef's Counter": 3,
  'Garden Courtyard': 4,
};

interface PaymentTokenRecord {
  token: string;
  method: 'card' | 'express_wallet';
  brand: string;
  last4: string;
  createdAt: number;
  used: boolean;
}

interface PersistedStore {
  reservations: Reservation[];
  orders: OrderRecord[];
  inquiries?: ContactInquiry[];
}

const tokenVault = new Map<string, PaymentTokenRecord>();

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function buildOrderTimeline(
  fulfillmentType: FulfillmentType,
  createdAtIso: string,
  stageIndex: number
): OrderTimelineEntry[] {
  const baseMs = new Date(createdAtIso).getTime();
  const stages: { stage: OrderStage; label: string; description: string; offsetSec: number }[] = [
    {
      stage: 'confirmed',
      label: 'Payment Confirmed',
      description: 'Tokenized payment authorized and ticket transmitted to the hearth pass.',
      offsetSec: 0,
    },
    {
      stage: 'preparing',
      label: 'Kitchen Preparing',
      description: 'Cold larder and pasta station prepping seasonal garnishes to order.',
      offsetSec: 25,
    },
    {
      stage: 'wood_fired',
      label: 'Wood-Fired & Plating',
      description: 'Finishing proteins over white oak embers and plating on warmed stoneware.',
      offsetSec: 75,
    },
    {
      stage: 'ready_or_out',
      label: fulfillmentType === 'pickup' ? 'Ready for Pickup' : 'Out for Delivery',
      description:
        fulfillmentType === 'pickup'
          ? 'Packed in insulated linen carriers at the host counter on Jackson St.'
          : 'Courier departed the bistro with temperature-sealed packaging.',
      offsetSec: 150,
    },
    {
      stage: 'completed',
      label: fulfillmentType === 'pickup' ? 'Collected' : 'Delivered',
      description:
        fulfillmentType === 'pickup'
          ? 'Order collected. Enjoy your evening with Arden & Hearth.'
          : 'Order delivered to your specified drop-off point.',
      offsetSec: 240,
    },
  ];

  return stages.map((entry, idx) => ({
    stage: entry.stage,
    label: entry.label,
    description: entry.description,
    completedAt:
      idx <= stageIndex ? new Date(baseMs + entry.offsetSec * 1000).toISOString() : null,
  }));
}

function createInitialStore(): PersistedStore {
  const today = new Date().toISOString().slice(0, 10);
  const sampleCreatedAt = new Date(Date.now() - 85 * 1000).toISOString();
  const sampleReceiptSig = crypto
    .createHmac('sha256', SIGNING_SECRET)
    .update('ORD-4092|106.56')
    .digest('hex')
    .slice(0, 16)
    .toUpperCase();

  return {
    reservations: [
      {
        code: 'RES-4821',
        date: today,
        time: '19:00',
        partySize: 2,
        seatingZone: "Chef's Counter",
        guestName: 'Clara Vance',
        guestEmail: 'c.vance@example.com',
        guestPhone: '(415) 555-0148',
        occasion: 'Anniversary',
        dietaryNotes: 'No shellfish',
        status: 'confirmed',
        createdAt: new Date(Date.now() - 3600 * 1000).toISOString(),
      },
      {
        code: 'RES-4822',
        date: today,
        time: '19:30',
        partySize: 4,
        seatingZone: 'Main Dining Room',
        guestName: 'Marcus Sterling',
        guestEmail: 'm.sterling@example.com',
        guestPhone: '(415) 555-0192',
        status: 'confirmed',
        createdAt: new Date(Date.now() - 7200 * 1000).toISOString(),
      },
    ],
    orders: [
      {
        orderNumber: 'ORD-4092',
        trackingToken: 'demo-track-4092',
        fulfillmentType: 'pickup',
        status: 'wood_fired',
        estimatedMinutesRemaining: 9,
        estimatedReadyAt: new Date(Date.now() + 9 * 60 * 1000).toISOString(),
        createdAt: sampleCreatedAt,
        items: [
          {
            menuItemId: 'hearth-sea-bass',
            name: 'Wood-Roasted Black Sea Bass',
            quantity: 1,
            unitPrice: 44,
            lineTotal: 44,
            modifiersLabel: 'Saffron Beurre Blanc',
          },
          {
            menuItemId: 'truffle-agnolotti',
            name: 'Chanterelle & Black Truffle Agnolotti',
            quantity: 1,
            unitPrice: 36,
            lineTotal: 36,
            modifiersLabel: 'Standard Shaved Black Truffle',
          },
        ],
        pricing: {
          subtotal: 80,
          tax: 6.9,
          deliveryFee: 0,
          tip: 14.4,
          total: 101.3,
        },
        payment: {
          method: 'card',
          brand: 'Visa',
          last4: '4242',
          transactionId: 'ch_hearth_4092a8',
          receiptSignature: sampleReceiptSig,
        },
        customer: {
          name: 'Elena Rostova',
          email: 'e***@example.com',
          phone: '(415) ***-0183',
          addressSummary: 'Counter Pickup · 418 Jackson St',
        },
        timeline: buildOrderTimeline('pickup', sampleCreatedAt, 2),
      },
    ],
    inquiries: [],
  };
}

function loadStore(): PersistedStore {
  ensureDataDir();
  if (!fs.existsSync(STORE_PATH)) {
    const initial = createInitialStore();
    fs.writeFileSync(STORE_PATH, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }
  try {
    const raw = fs.readFileSync(STORE_PATH, 'utf-8');
    const parsed = JSON.parse(raw) as PersistedStore;
    if (!Array.isArray(parsed.reservations) || !Array.isArray(parsed.orders)) {
      throw new Error('Corrupt store format');
    }
    return parsed;
  } catch {
    const fallback = createInitialStore();
    fs.writeFileSync(STORE_PATH, JSON.stringify(fallback, null, 2), 'utf-8');
    return fallback;
  }
}

function saveStore(store: PersistedStore): void {
  ensureDataDir();
  const tmpPath = path.resolve(DATA_DIR, `store.${process.pid}.tmp`);
  if (!tmpPath.startsWith(DATA_DIR + path.sep)) {
    throw new Error('Invalid temp path boundary');
  }
  fs.writeFileSync(tmpPath, JSON.stringify(store, null, 2), 'utf-8');
  fs.renameSync(tmpPath, STORE_PATH);
}

function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function passesLuhn(digits: string): boolean {
  if (!/^\d{13,19}$/.test(digits)) return false;
  let sum = 0;
  let shouldDouble = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = Number.parseInt(digits[i], 10);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

function detectCardBrand(digits: string): string {
  if (/^4/.test(digits)) return 'Visa';
  if (/^(5[1-5]|2[2-7])/.test(digits)) return 'Mastercard';
  if (/^3[47]/.test(digits)) return 'American Express';
  if (/^6(?:011|5)/.test(digits)) return 'Discover';
  return 'Card';
}

function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!local || !domain) return '***';
  return `${local.slice(0, 1)}***@${domain}`;
}

function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 4) return '***';
  return `***-***-${digits.slice(-4)}`;
}

function getStageIndex(stage: OrderStage): number {
  const order: OrderStage[] = [
    'confirmed',
    'preparing',
    'wood_fired',
    'ready_or_out',
    'completed',
  ];
  return Math.max(0, order.indexOf(stage));
}

function syncOrderTimeProgression(order: OrderRecord): OrderRecord {
  const elapsedSeconds = (Date.now() - new Date(order.createdAt).getTime()) / 1000;
  let autoIndex = 0;
  if (elapsedSeconds >= 240) autoIndex = 4;
  else if (elapsedSeconds >= 150) autoIndex = 3;
  else if (elapsedSeconds >= 75) autoIndex = 2;
  else if (elapsedSeconds >= 25) autoIndex = 1;

  const currentIndex = getStageIndex(order.status);
  const nextIndex = Math.max(currentIndex, autoIndex);
  const stages: OrderStage[] = [
    'confirmed',
    'preparing',
    'wood_fired',
    'ready_or_out',
    'completed',
  ];
  const nextStage = stages[nextIndex];
  const remainingMinutesMap = [18, 13, 8, 3, 0];

  return {
    ...order,
    status: nextStage,
    estimatedMinutesRemaining: remainingMinutesMap[nextIndex],
    timeline: order.timeline.map((step, idx) => {
      if (idx <= nextIndex && !step.completedAt) {
        return { ...step, completedAt: new Date().toISOString() };
      }
      return step;
    }),
  };
}

function sanitizePublicOrder(order: OrderRecord, includePrivateDetails: boolean): OrderRecord {
  const clone: OrderRecord = {
    ...order,
    trackingToken: undefined,
    customer: {
      name: order.customer.name,
      email: includePrivateDetails ? order.customer.email : maskEmail(order.customer.email),
      phone: includePrivateDetails ? order.customer.phone : maskPhone(order.customer.phone),
      addressSummary: order.customer.addressSummary,
      deliveryNotes: includePrivateDetails ? order.customer.deliveryNotes : undefined,
    },
  };
  return clone;
}

const app = express();
app.use(express.json({ limit: '256kb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'arden-and-hearth' });
});

app.get('/api/app-url', (req, res) => {
  const configured = process.env.APP_URL?.trim();
  const hasRealAppUrl =
    Boolean(configured) &&
    configured !== 'MY_APP_URL' &&
    /^https?:\/\//i.test(configured ?? '');

  const protoHeader = req.headers['x-forwarded-proto'];
  const proto =
    typeof protoHeader === 'string' && protoHeader.length > 0
      ? protoHeader.split(',')[0].trim()
      : req.protocol;
  const host = req.get('x-forwarded-host') || req.get('host') || 'localhost:3000';
  const fallbackOrigin = `${proto}://${host}`;

  const rawUrl = hasRealAppUrl ? (configured as string) : fallbackOrigin;
  const sharedUrl = rawUrl.replace('://ais-dev-', '://ais-pre-');

  res.json({
    appUrl: sharedUrl,
    devUrl: rawUrl,
  });
});

app.get('/api/menu', (_req, res) => {
  res.json({
    categories: MENU_CATEGORIES,
    items: MENU_ITEMS,
  });
});

app.get('/api/reservations/availability', (req, res) => {
  const date = typeof req.query.date === 'string' ? req.query.date.trim() : '';
  const guests = Number.parseInt(String(req.query.guests ?? '2'), 10);
  const zoneParam =
    typeof req.query.zone === 'string' ? (req.query.zone.trim() as SeatingZone) : 'Main Dining Room';

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    res.status(400).json({ error: 'Please provide a valid date (YYYY-MM-DD).' });
    return;
  }
  if (!Number.isFinite(guests) || guests < 1 || guests > 8) {
    res.status(400).json({ error: 'Party size must be between 1 and 8 guests.' });
    return;
  }
  const zone: SeatingZone =
    zoneParam in ZONE_CAPACITY ? zoneParam : 'Main Dining Room';

  const store = loadStore();
  const maxTables = ZONE_CAPACITY[zone];

  const slots: TimeSlotAvailability[] = TIME_SLOTS.map((slot) => {
    const bookedCount = store.reservations.filter(
      (r) =>
        r.status === 'confirmed' &&
        r.date === date &&
        r.time === slot.time &&
        r.seatingZone === zone
    ).length;
    const remainingTables = Math.max(0, maxTables - bookedCount);
    return {
      time: slot.time,
      label: slot.label,
      remainingTables,
      available: remainingTables > 0,
    };
  });

  res.json({ date, guests, seatingZone: zone, slots });
});

app.post('/api/reservations', (req, res) => {
  const body = req.body ?? {};
  const date = typeof body.date === 'string' ? body.date.trim() : '';
  const time = typeof body.time === 'string' ? body.time.trim() : '';
  const partySize = Number.parseInt(String(body.partySize ?? ''), 10);
  const seatingZone =
    typeof body.seatingZone === 'string' ? (body.seatingZone.trim() as SeatingZone) : 'Main Dining Room';
  const guestName = typeof body.guestName === 'string' ? body.guestName.trim() : '';
  const guestEmail = typeof body.guestEmail === 'string' ? body.guestEmail.trim() : '';
  const guestPhone = typeof body.guestPhone === 'string' ? body.guestPhone.trim() : '';
  const occasion = typeof body.occasion === 'string' ? body.occasion.trim().slice(0, 80) : '';
  const dietaryNotes =
    typeof body.dietaryNotes === 'string' ? body.dietaryNotes.trim().slice(0, 240) : '';

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    res.status(400).json({ error: 'Valid reservation date is required.' });
    return;
  }
  if (!TIME_SLOTS.some((s) => s.time === time)) {
    res.status(400).json({ error: 'Please select a valid dining time slot.' });
    return;
  }
  if (!Number.isFinite(partySize) || partySize < 1 || partySize > 8) {
    res.status(400).json({ error: 'Party size must be between 1 and 8 guests.' });
    return;
  }
  if (!(seatingZone in ZONE_CAPACITY)) {
    res.status(400).json({ error: 'Please select a valid seating zone.' });
    return;
  }
  if (guestName.length < 2 || guestName.length > 80) {
    res.status(400).json({ error: 'Please enter the primary guest name.' });
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)) {
    res.status(400).json({ error: 'Please enter a valid email address.' });
    return;
  }
  if (guestPhone.replace(/\D/g, '').length < 7) {
    res.status(400).json({ error: 'Please enter a valid contact phone number.' });
    return;
  }

  const store = loadStore();
  const bookedCount = store.reservations.filter(
    (r) =>
      r.status === 'confirmed' &&
      r.date === date &&
      r.time === time &&
      r.seatingZone === seatingZone
  ).length;

  if (bookedCount >= ZONE_CAPACITY[seatingZone]) {
    res.status(409).json({
      error: 'That seating time just filled up. Please choose another time or seating zone.',
    });
    return;
  }

  let code = `RES-${crypto.randomInt(1000, 9999)}`;
  while (store.reservations.some((r) => r.code === code)) {
    code = `RES-${crypto.randomInt(1000, 9999)}`;
  }

  const reservation: Reservation = {
    code,
    date,
    time,
    partySize,
    seatingZone,
    guestName,
    guestEmail,
    guestPhone,
    occasion: occasion || undefined,
    dietaryNotes: dietaryNotes || undefined,
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  };

  store.reservations.unshift(reservation);
  saveStore(store);

  res.status(201).json({ reservation });
});

app.get('/api/reservations/:code', (req, res) => {
  const code = String(req.params.code ?? '').trim().toUpperCase();
  if (!/^RES-\d{4}$/.test(code)) {
    res.status(400).json({ error: 'Reservation codes follow the format RES-0000.' });
    return;
  }
  const store = loadStore();
  const found = store.reservations.find((r) => r.code === code);
  if (!found) {
    res.status(404).json({ error: 'No reservation matched that confirmation code.' });
    return;
  }
  res.json({
    reservation: {
      ...found,
      guestEmail: maskEmail(found.guestEmail),
      guestPhone: maskPhone(found.guestPhone),
    },
  });
});

app.post('/api/reservations/:code/cancel', (req, res) => {
  const code = String(req.params.code ?? '').trim().toUpperCase();
  const store = loadStore();
  const idx = store.reservations.findIndex((r) => r.code === code);
  if (idx === -1) {
    res.status(404).json({ error: 'Reservation not found.' });
    return;
  }
  store.reservations[idx] = { ...store.reservations[idx], status: 'cancelled' };
  saveStore(store);
  const updated = store.reservations[idx];
  res.json({
    reservation: {
      ...updated,
      guestEmail: maskEmail(updated.guestEmail),
      guestPhone: maskPhone(updated.guestPhone),
    },
  });
});

app.post('/api/payments/tokenize', (req, res) => {
  const body = req.body ?? {};
  const method = body.method === 'express_wallet' ? 'express_wallet' : 'card';

  if (method === 'express_wallet') {
    const token = `tok_wallet_${crypto.randomBytes(12).toString('hex')}`;
    tokenVault.set(token, {
      token,
      method: 'express_wallet',
      brand: 'Apple Pay',
      last4: '8841',
      createdAt: Date.now(),
      used: false,
    });
    res.status(201).json({
      paymentToken: token,
      method: 'express_wallet',
      brand: 'Apple Pay',
      last4: '8841',
    });
    return;
  }

  const cardholderName =
    typeof body.cardholderName === 'string' ? body.cardholderName.trim() : '';
  const rawNumber = typeof body.cardNumber === 'string' ? body.cardNumber.replace(/\D/g, '') : '';
  const expMonth = Number.parseInt(String(body.expMonth ?? ''), 10);
  const expYear = Number.parseInt(String(body.expYear ?? ''), 10);
  const cvc = typeof body.cvc === 'string' ? body.cvc.trim() : '';
  const billingZip = typeof body.billingZip === 'string' ? body.billingZip.trim() : '';

  if (cardholderName.length < 2) {
    res.status(400).json({ error: 'Cardholder name is required.' });
    return;
  }
  if (!passesLuhn(rawNumber)) {
    res.status(400).json({ error: 'Invalid card number. Please verify the digits entered.' });
    return;
  }
  if (!Number.isFinite(expMonth) || expMonth < 1 || expMonth > 12) {
    res.status(400).json({ error: 'Invalid expiration month.' });
    return;
  }
  const normalizedYear = expYear < 100 ? 2000 + expYear : expYear;
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  if (
    !Number.isFinite(normalizedYear) ||
    normalizedYear < currentYear ||
    (normalizedYear === currentYear && expMonth < currentMonth) ||
    normalizedYear > currentYear + 20
  ) {
    res.status(400).json({ error: 'This card appears to be expired or has an invalid year.' });
    return;
  }
  if (!/^\d{3,4}$/.test(cvc)) {
    res.status(400).json({ error: 'Security code (CVC) must be 3 or 4 digits.' });
    return;
  }
  if (billingZip.length < 3 || billingZip.length > 12) {
    res.status(400).json({ error: 'Please provide a valid billing postal code.' });
    return;
  }

  const brand = detectCardBrand(rawNumber);
  const last4 = rawNumber.slice(-4);
  const token = `tok_live_${crypto.randomBytes(12).toString('hex')}`;

  tokenVault.set(token, {
    token,
    method: 'card',
    brand,
    last4,
    createdAt: Date.now(),
    used: false,
  });

  res.status(201).json({
    paymentToken: token,
    method: 'card',
    brand,
    last4,
  });
});

app.post('/api/orders/checkout', (req, res) => {
  const body = req.body ?? {};
  const paymentToken = typeof body.paymentToken === 'string' ? body.paymentToken.trim() : '';
  const tokenRecord = tokenVault.get(paymentToken);

  if (!tokenRecord || tokenRecord.used || Date.now() - tokenRecord.createdAt > 15 * 60 * 1000) {
    res.status(402).json({
      error: 'Payment authorization expired or invalid. Please re-authorize your payment method.',
    });
    return;
  }

  const fulfillmentType: FulfillmentType =
    body.fulfillmentType === 'delivery' ? 'delivery' : 'pickup';
  const rawItems = Array.isArray(body.items) ? body.items : [];
  if (rawItems.length === 0 || rawItems.length > 30) {
    res.status(400).json({ error: 'Your order bag cannot be empty.' });
    return;
  }

  const customer = body.customer ?? {};
  const name = typeof customer.name === 'string' ? customer.name.trim() : '';
  const email = typeof customer.email === 'string' ? customer.email.trim() : '';
  const phone = typeof customer.phone === 'string' ? customer.phone.trim() : '';
  const address = typeof customer.address === 'string' ? customer.address.trim() : '';
  const apartment = typeof customer.apartment === 'string' ? customer.apartment.trim() : '';
  const city = typeof customer.city === 'string' ? customer.city.trim() : '';
  const postalCode = typeof customer.postalCode === 'string' ? customer.postalCode.trim() : '';
  const deliveryNotes =
    typeof customer.deliveryNotes === 'string' ? customer.deliveryNotes.trim().slice(0, 200) : '';

  if (name.length < 2 || name.length > 80) {
    res.status(400).json({ error: 'Please enter a recipient name.' });
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({ error: 'Please enter a valid email for your receipt.' });
    return;
  }
  if (phone.replace(/\D/g, '').length < 7) {
    res.status(400).json({ error: 'Please enter a valid mobile number for order updates.' });
    return;
  }
  if (
    fulfillmentType === 'delivery' &&
    (address.length < 5 || city.length < 2 || postalCode.length < 3)
  ) {
    res.status(400).json({
      error: 'Street address, city, and postal code are required for courier delivery.',
    });
    return;
  }

  let subtotal = 0;
  let maxPrep = 12;
  const authoritativeItems: OrderRecord['items'] = [];

  for (const itemInput of rawItems) {
    const menuItemId =
      typeof itemInput?.menuItemId === 'string' ? itemInput.menuItemId.trim() : '';
    const quantity = Number.parseInt(String(itemInput?.quantity ?? ''), 10);
    const catalogItem = MENU_ITEMS.find((m) => m.id === menuItemId);

    if (!catalogItem) {
      res.status(400).json({ error: `Unknown menu item: ${menuItemId}` });
      return;
    }
    if (!Number.isFinite(quantity) || quantity < 1 || quantity > 20) {
      res.status(400).json({ error: `Invalid quantity for ${catalogItem.name}.` });
      return;
    }

    let optionsDelta = 0;
    const selectedLabels: string[] = [];
    const requestedOptions = Array.isArray(itemInput?.selectedOptionIds)
      ? itemInput.selectedOptionIds
      : [];

    if (catalogItem.options) {
      for (const group of catalogItem.options) {
        const chosen = group.choices.find((c) => requestedOptions.includes(c.id));
        if (chosen) {
          optionsDelta += chosen.priceDelta;
          selectedLabels.push(chosen.label);
        } else if (group.required && group.choices[0]) {
          optionsDelta += group.choices[0].priceDelta;
          selectedLabels.push(group.choices[0].label);
        }
      }
    }

    const unitPrice = roundCurrency(catalogItem.price + optionsDelta);
    const lineTotal = roundCurrency(unitPrice * quantity);
    subtotal = roundCurrency(subtotal + lineTotal);
    maxPrep = Math.max(maxPrep, catalogItem.prepMinutes);

    authoritativeItems.push({
      menuItemId: catalogItem.id,
      name: catalogItem.name,
      quantity,
      unitPrice,
      lineTotal,
      modifiersLabel: selectedLabels.length > 0 ? selectedLabels.join(' · ') : undefined,
      specialInstructions:
        typeof itemInput?.specialInstructions === 'string'
          ? itemInput.specialInstructions.trim().slice(0, 140) || undefined
          : undefined,
    });
  }

  const tipPercent = Number(body.tipPercent ?? 18);
  const safeTipPercent =
    Number.isFinite(tipPercent) && tipPercent >= 0 && tipPercent <= 50 ? tipPercent : 18;
  const tax = roundCurrency(subtotal * TAX_RATE);
  const deliveryFee = fulfillmentType === 'delivery' ? DELIVERY_FEE : 0;
  const tip = roundCurrency(subtotal * (safeTipPercent / 100));
  const total = roundCurrency(subtotal + tax + deliveryFee + tip);

  tokenRecord.used = true;

  const store = loadStore();
  let orderNumber = `ORD-${crypto.randomInt(1000, 9999)}`;
  while (store.orders.some((o) => o.orderNumber === orderNumber)) {
    orderNumber = `ORD-${crypto.randomInt(1000, 9999)}`;
  }

  const trackingToken = crypto.randomBytes(16).toString('hex');
  const createdAt = new Date().toISOString();
  const estimatedMinutes = maxPrep + (fulfillmentType === 'delivery' ? 14 : 4);
  const estimatedReadyAt = new Date(Date.now() + estimatedMinutes * 60 * 1000).toISOString();
  const transactionId = `ch_hearth_${crypto.randomBytes(5).toString('hex')}`;
  const receiptSignature = crypto
    .createHmac('sha256', SIGNING_SECRET)
    .update(`${orderNumber}|${total.toFixed(2)}|${transactionId}`)
    .digest('hex')
    .slice(0, 16)
    .toUpperCase();

  const order: OrderRecord = {
    orderNumber,
    trackingToken,
    fulfillmentType,
    status: 'confirmed',
    estimatedMinutesRemaining: estimatedMinutes,
    estimatedReadyAt,
    createdAt,
    items: authoritativeItems,
    pricing: {
      subtotal,
      tax,
      deliveryFee,
      tip,
      total,
    },
    payment: {
      method: tokenRecord.method,
      brand: tokenRecord.brand,
      last4: tokenRecord.last4,
      transactionId,
      receiptSignature,
    },
    customer: {
      name,
      email,
      phone,
      addressSummary:
        fulfillmentType === 'delivery'
          ? [address, apartment, city, postalCode].filter(Boolean).join(', ')
          : 'Counter Pickup · 418 Jackson St',
      deliveryNotes: deliveryNotes || undefined,
    },
    timeline: buildOrderTimeline(fulfillmentType, createdAt, 0),
  };

  store.orders.unshift(order);
  saveStore(store);

  res.status(201).json({
    order: sanitizePublicOrder(order, true),
    trackingToken,
  });
});

app.get('/api/orders/:orderNumber', (req, res) => {
  const orderNumber = String(req.params.orderNumber ?? '').trim().toUpperCase();
  const token = typeof req.query.token === 'string' ? req.query.token.trim() : '';

  if (!/^ORD-\d{4}$/.test(orderNumber)) {
    res.status(400).json({ error: 'Order numbers follow the format ORD-0000.' });
    return;
  }

  const store = loadStore();
  const idx = store.orders.findIndex((o) => o.orderNumber === orderNumber);
  if (idx === -1) {
    res.status(404).json({ error: 'No order matched that order number.' });
    return;
  }

  const synced = syncOrderTimeProgression(store.orders[idx]);
  if (synced.status !== store.orders[idx].status) {
    store.orders[idx] = synced;
    saveStore(store);
  }

  const authorized =
    orderNumber === 'ORD-4092' || (Boolean(token) && synced.trackingToken === token);
  res.json({ order: sanitizePublicOrder(synced, authorized) });
});

app.post('/api/orders/:orderNumber/advance', (req, res) => {
  const orderNumber = String(req.params.orderNumber ?? '').trim().toUpperCase();
  const token = typeof req.body?.trackingToken === 'string' ? req.body.trackingToken.trim() : '';

  const store = loadStore();
  const idx = store.orders.findIndex((o) => o.orderNumber === orderNumber);
  if (idx === -1) {
    res.status(404).json({ error: 'Order not found.' });
    return;
  }

  const current = store.orders[idx];
  const authorized =
    orderNumber === 'ORD-4092' || (Boolean(token) && current.trackingToken === token);
  if (!authorized) {
    res.status(403).json({ error: 'Valid tracking token required to advance this order.' });
    return;
  }

  const stages: OrderStage[] = [
    'confirmed',
    'preparing',
    'wood_fired',
    'ready_or_out',
    'completed',
  ];
  const currentIdx = getStageIndex(current.status);
  const nextIdx = Math.min(stages.length - 1, currentIdx + 1);
  const remainingMinutesMap = [18, 13, 8, 3, 0];

  const updated: OrderRecord = {
    ...current,
    status: stages[nextIdx],
    estimatedMinutesRemaining: remainingMinutesMap[nextIdx],
    timeline: current.timeline.map((step, i) =>
      i <= nextIdx && !step.completedAt
        ? { ...step, completedAt: new Date().toISOString() }
        : step
    ),
  };

  store.orders[idx] = updated;
  saveStore(store);

  res.json({ order: sanitizePublicOrder(updated, true) });
});

app.post('/api/contact', (req, res) => {
  const body = req.body ?? {};
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const allowedTopics: ContactInquiry['topic'][] = [
    'General Inquiry',
    'Private Dining & Events',
    'Dietary & Allergies',
    'Press & Careers',
  ];
  const rawTopic = typeof body.topic === 'string' ? body.topic.trim() : '';
  const topic: ContactInquiry['topic'] = allowedTopics.includes(
    rawTopic as ContactInquiry['topic']
  )
    ? (rawTopic as ContactInquiry['topic'])
    : 'General Inquiry';
  const message = typeof body.message === 'string' ? body.message.trim() : '';

  if (name.length < 2 || name.length > 80) {
    res.status(400).json({ error: 'Please provide your name.' });
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({ error: 'Please provide a valid email address.' });
    return;
  }
  if (message.length < 10 || message.length > 1200) {
    res.status(400).json({
      error: 'Please enter a message between 10 and 1,200 characters.',
    });
    return;
  }

  const store = loadStore();
  const inquiry: ContactInquiry = {
    id: `INQ-${crypto.randomInt(1000, 9999)}`,
    name,
    email,
    topic,
    message,
    createdAt: new Date().toISOString(),
  };

  store.inquiries = [inquiry, ...(store.inquiries ?? [])].slice(0, 100);
  saveStore(store);

  res.status(201).json({ inquiry });
});

async function startServer(): Promise<void> {
  const PORT = 3000;
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Arden & Hearth server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
