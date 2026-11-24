export type MenuCategory =
  | 'Starters'
  | 'Handmade Pasta'
  | 'Wood-Fired Mains'
  | 'Desserts & Cellar';

export type DietaryTag = 'Gluten-Free' | 'Vegetarian' | 'Dairy-Free' | 'Shellfish';

export interface DishOptionGroup {
  id: string;
  label: string;
  required: boolean;
  choices: {
    id: string;
    label: string;
    priceDelta: number;
  }[];
}

export interface MenuItem {
  id: string;
  name: string;
  category: MenuCategory;
  description: string;
  price: number;
  prepMinutes: number;
  dietary: DietaryTag[];
  featured: boolean;
  imageUrl?: string;
  ingredients: string[];
  allergens?: string[];
  pairingNote?: string;
  chefNotes?: string;
  options?: DishOptionGroup[];
}

export interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  topic: 'General Inquiry' | 'Private Dining & Events' | 'Dietary & Allergies' | 'Press & Careers';
  message: string;
  createdAt: string;
}

export interface CartItem {
  cartKey: string;
  menuItemId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  selectedOptionIds: string[];
  selectedOptions: {
    groupLabel: string;
    choiceLabel: string;
    priceDelta: number;
  }[];
  specialInstructions?: string;
  imageUrl?: string;
}

export type SeatingZone = 'Main Dining Room' | "Chef's Counter" | 'Garden Courtyard';

export interface TimeSlotAvailability {
  time: string;
  label: string;
  remainingTables: number;
  available: boolean;
}

export interface Reservation {
  code: string;
  date: string;
  time: string;
  partySize: number;
  seatingZone: SeatingZone;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  occasion?: string;
  dietaryNotes?: string;
  status: 'confirmed' | 'cancelled';
  createdAt: string;
}

export type FulfillmentType = 'pickup' | 'delivery';

export type OrderStage =
  | 'confirmed'
  | 'preparing'
  | 'wood_fired'
  | 'ready_or_out'
  | 'completed';

export interface OrderTimelineEntry {
  stage: OrderStage;
  label: string;
  description: string;
  completedAt: string | null;
}

export interface OrderSummaryItem {
  menuItemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  modifiersLabel?: string;
  specialInstructions?: string;
}

export interface OrderRecord {
  orderNumber: string;
  trackingToken?: string;
  fulfillmentType: FulfillmentType;
  status: OrderStage;
  estimatedMinutesRemaining: number;
  estimatedReadyAt: string;
  createdAt: string;
  items: OrderSummaryItem[];
  pricing: {
    subtotal: number;
    tax: number;
    deliveryFee: number;
    tip: number;
    total: number;
  };
  payment: {
    method: 'card' | 'express_wallet';
    brand: string;
    last4: string;
    transactionId: string;
    receiptSignature: string;
  };
  customer: {
    name: string;
    email: string;
    phone: string;
    addressSummary?: string;
    deliveryNotes?: string;
  };
  timeline: OrderTimelineEntry[];
}
