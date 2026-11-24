import {
  ArrowLeft,
  CreditCard,
  Lock,
  Minus,
  Plus,
  ShieldCheck,
  Smartphone,
  Trash2,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import type { CartItem, FulfillmentType, OrderRecord } from '../types/restaurant.ts';

interface CheckoutDrawerProps {
  open: boolean;
  cart: CartItem[];
  onClose: () => void;
  onBrowseMenu: () => void;
  onUpdateQty: (cartKey: string, delta: number) => void;
  onRemoveItem: (cartKey: string) => void;
  onOrderComplete: (order: OrderRecord, trackingToken: string) => void;
}

const TAX_RATE = 0.08625;
const DELIVERY_FEE = 6.5;

function formatCardDisplay(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
}

function detectBrand(digits: string): string {
  if (/^4/.test(digits)) return 'Visa';
  if (/^(5[1-5]|2[2-7])/.test(digits)) return 'Mastercard';
  if (/^3[47]/.test(digits)) return 'Amex';
  return 'Card';
}

export function CheckoutDrawer({
  open,
  cart,
  onClose,
  onBrowseMenu,
  onUpdateQty,
  onRemoveItem,
  onOrderComplete,
}: CheckoutDrawerProps) {
  const [step, setStep] = useState<'bag' | 'payment'>('bag');
  const [fulfillmentType, setFulfillmentType] = useState<FulfillmentType>('pickup');
  const [tipPercent, setTipPercent] = useState<number>(18);

  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [apartment, setApartment] = useState('');
  const [city, setCity] = useState('San Francisco');
  const [postalCode, setPostalCode] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'express_wallet'>('card');
  const [cardholderName, setCardholderName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expInput, setExpInput] = useState('');
  const [cvc, setCvc] = useState('');
  const [billingZip, setBillingZip] = useState('');

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (cart.length === 0 && step === 'payment') {
      setStep('bag');
    }
  }, [cart.length, step]);

  if (!open) return null;

  const subtotal =
    Math.round(
      cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0) * 100
    ) / 100;
  const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
  const deliveryFee = fulfillmentType === 'delivery' && cart.length > 0 ? DELIVERY_FEE : 0;
  const tip = Math.round(subtotal * (tipPercent / 100) * 100) / 100;
  const total = Math.round((subtotal + tax + deliveryFee + tip) * 100) / 100;

  const cardDigits = cardNumber.replace(/\D/g, '');
  const detectedBrand = detectBrand(cardDigits);

  const fillDemoPayment = () => {
    setCustomerName((v) => v || 'Alex Morgan');
    setCustomerEmail((v) => v || 'alex.morgan@example.com');
    setCustomerPhone((v) => v || '(415) 555-0174');
    if (fulfillmentType === 'delivery') {
      setStreetAddress((v) => v || '742 Montgomery St');
      setPostalCode((v) => v || '94111');
    }
    setCardholderName('Alex Morgan');
    setCardNumber('4242 4242 4242 4242');
    setExpInput('11/29');
    setCvc('842');
    setBillingZip('94111');
    setError(null);
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setError(null);

    try {
      let tokenPayload: Record<string, unknown>;
      if (paymentMethod === 'express_wallet') {
        tokenPayload = { method: 'express_wallet' };
      } else {
        const [mm, yy] = expInput.split('/').map((s) => s.trim());
        tokenPayload = {
          method: 'card',
          cardholderName,
          cardNumber: cardDigits,
          expMonth: mm,
          expYear: yy,
          cvc,
          billingZip,
        };
      }

      const tokenRes = await fetch('/api/payments/tokenize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tokenPayload),
      });
      const tokenData = await tokenRes.json();
      if (!tokenRes.ok) {
        throw new Error(tokenData.error || 'Card authorization failed.');
      }

      const checkoutRes = await fetch('/api/orders/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentToken: tokenData.paymentToken,
          fulfillmentType,
          tipPercent,
          items: cart.map((item) => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            specialInstructions: item.specialInstructions,
            selectedOptionIds: item.selectedOptionIds,
          })),
          customer: {
            name: customerName,
            email: customerEmail,
            phone: customerPhone,
            address: streetAddress,
            apartment,
            city,
            postalCode,
            deliveryNotes,
          },
        }),
      });
      const checkoutData = await checkoutRes.json();
      if (!checkoutRes.ok) {
        throw new Error(checkoutData.error || 'Checkout failed.');
      }

      setCardNumber('');
      setCvc('');
      setStep('bag');
      onOrderComplete(checkoutData.order, checkoutData.trackingToken);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment processing failed.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/45"
      role="dialog"
      aria-modal="true"
      aria-label="Order Bag and Secure Checkout"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex h-full w-full max-w-lg flex-col border-l border-[#E5E3DD] bg-[#FAFAF8] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#E5E3DD] px-6 py-4">
          <div className="flex items-center gap-3">
            {step === 'payment' && (
              <button
                type="button"
                onClick={() => {
                  setStep('bag');
                  setError(null);
                }}
                aria-label="Back to Order Bag"
                className="rounded-md p-1.5 text-[#57554F] hover:bg-[#EAE7DF] hover:text-[#141413] cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <h2 className="font-display text-2xl font-semibold text-[#141413]">
              {step === 'bag' ? 'Your Order Bag' : 'Secure Payment Gateway'}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Order Bag"
            className="rounded-md p-1.5 text-[#57554F] hover:bg-[#EAE7DF] hover:text-[#141413] cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <p className="font-display text-2xl font-semibold text-[#141413]">
              Your bag is empty
            </p>
            <p className="mt-2 max-w-xs text-sm text-[#57554F]">
              Add wood-fired dishes, handmade pasta, or cellar desserts from our seasonal
              menu to begin your order.
            </p>
            <button
              type="button"
              onClick={() => {
                onClose();
                onBrowseMenu();
              }}
              className="mt-6 rounded-md bg-[#1C3B2B] px-5 py-2.5 text-sm font-medium text-[#FAFAF8] hover:bg-[#142B1F] cursor-pointer"
            >
              Browse Seasonal Menu
            </button>
          </div>
        ) : step === 'bag' ? (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <div className="grid grid-cols-2 gap-1 rounded-lg bg-[#EAE7DF] p-1">
                <button
                  type="button"
                  onClick={() => setFulfillmentType('pickup')}
                  className={`rounded-md py-2 text-xs font-medium transition-colors cursor-pointer ${
                    fulfillmentType === 'pickup'
                      ? 'bg-white text-[#141413] shadow-xs'
                      : 'text-[#57554F] hover:text-[#141413]'
                  }`}
                >
                  Counter Pickup · Free
                </button>
                <button
                  type="button"
                  onClick={() => setFulfillmentType('delivery')}
                  className={`rounded-md py-2 text-xs font-medium transition-colors cursor-pointer ${
                    fulfillmentType === 'delivery'
                      ? 'bg-white text-[#141413] shadow-xs'
                      : 'text-[#57554F] hover:text-[#141413]'
                  }`}
                >
                  Courier Delivery · $6.50
                </button>
              </div>

              <div className="mt-5 divide-y divide-[#E5E3DD]">
                {cart.map((item) => (
                  <div key={item.cartKey} className="flex items-start justify-between gap-4 py-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[#141413]">{item.name}</p>
                      {item.selectedOptions.length > 0 && (
                        <p className="mt-0.5 text-xs text-[#737068]">
                          {item.selectedOptions.map((o) => o.choiceLabel).join(' · ')}
                        </p>
                      )}
                      {item.specialInstructions && (
                        <p className="mt-0.5 text-xs italic text-[#737068]">
                          Note: {item.specialInstructions}
                        </p>
                      )}
                      <div className="mt-2.5 flex items-center gap-3">
                        <div className="inline-flex items-center rounded-md border border-[#D4D1C8] bg-white">
                          <button
                            type="button"
                            onClick={() => onUpdateQty(item.cartKey, -1)}
                            aria-label={`Decrease quantity of ${item.name}`}
                            className="p-1.5 text-[#141413] hover:bg-[#F3F1EC] cursor-pointer"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-7 text-center text-xs font-semibold tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQty(item.cartKey, 1)}
                            aria-label={`Increase quantity of ${item.name}`}
                            className="p-1.5 text-[#141413] hover:bg-[#F3F1EC] cursor-pointer"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => onRemoveItem(item.cartKey)}
                          aria-label={`Remove ${item.name}`}
                          className="text-xs text-[#737068] hover:text-[#8B261D] cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <span className="tabular-nums text-sm font-semibold text-[#141413]">
                      ${(item.unitPrice * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 border-t border-[#E5E3DD] pt-4">
                <p className="text-xs font-semibold text-[#141413]">
                  Hospitality Team Tip
                </p>
                <div className="mt-2 grid grid-cols-4 gap-2">
                  {[15, 18, 20, 0].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setTipPercent(pct)}
                      className={`rounded-md border py-2 text-xs font-medium tabular-nums transition-colors cursor-pointer ${
                        tipPercent === pct
                          ? 'border-[#1C3B2B] bg-[#1C3B2B] text-[#FAFAF8]'
                          : 'border-[#D4D1C8] bg-white text-[#141413] hover:border-[#1C3B2B]'
                      }`}
                    >
                      {pct === 0 ? 'None' : `${pct}%`}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t border-[#E5E3DD] bg-white px-6 py-5">
              <dl className="space-y-1.5 text-sm">
                <div className="flex justify-between text-[#57554F]">
                  <dt>Subtotal</dt>
                  <dd className="tabular-nums">${subtotal.toFixed(2)}</dd>
                </div>
                <div className="flex justify-between text-[#57554F]">
                  <dt>Estimated Tax (8.625%)</dt>
                  <dd className="tabular-nums">${tax.toFixed(2)}</dd>
                </div>
                {deliveryFee > 0 && (
                  <div className="flex justify-between text-[#57554F]">
                    <dt>Local Courier Delivery</dt>
                    <dd className="tabular-nums">${deliveryFee.toFixed(2)}</dd>
                  </div>
                )}
                <div className="flex justify-between text-[#57554F]">
                  <dt>Team Tip ({tipPercent}%)</dt>
                  <dd className="tabular-nums">${tip.toFixed(2)}</dd>
                </div>
                <div className="flex justify-between border-t border-[#E5E3DD] pt-2 text-base font-semibold text-[#141413]">
                  <dt>Total</dt>
                  <dd className="tabular-nums">${total.toFixed(2)}</dd>
                </div>
              </dl>

              <button
                type="button"
                onClick={() => setStep('payment')}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-[#1C3B2B] px-5 py-3 text-sm font-medium text-[#FAFAF8] transition-colors hover:bg-[#142B1F] cursor-pointer"
              >
                <Lock className="h-4 w-4" aria-hidden="true" />
                <span>Proceed to Secure Payment</span>
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={handleCheckoutSubmit} className="flex flex-1 flex-col overflow-hidden">
            <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
              <div className="flex items-center justify-between rounded-md border border-[#E5E3DD] bg-white px-3.5 py-2.5">
                <span className="inline-flex items-center gap-2 text-xs font-medium text-[#1C3B2B]">
                  <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                  <span>Tokenized Gateway · TLS Encrypted</span>
                </span>
                <button
                  type="button"
                  onClick={fillDemoPayment}
                  className="text-xs font-medium text-[#1C3B2B] underline underline-offset-4 cursor-pointer"
                >
                  Fill Test Visa 4242
                </button>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-[#141413]">
                  Guest Contact Information
                </h3>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Full Name"
                  aria-label="Full Name"
                  className="w-full rounded-md border border-[#D4D1C8] bg-white px-3 py-2 text-sm text-[#141413] focus:border-[#1C3B2B] focus:outline-none"
                />
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="Email for Receipt"
                    aria-label="Email Address"
                    className="w-full rounded-md border border-[#D4D1C8] bg-white px-3 py-2 text-sm text-[#141413] focus:border-[#1C3B2B] focus:outline-none"
                  />
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Mobile Number"
                    aria-label="Mobile Number"
                    className="w-full rounded-md border border-[#D4D1C8] bg-white px-3 py-2 text-sm text-[#141413] focus:border-[#1C3B2B] focus:outline-none"
                  />
                </div>
              </div>

              {fulfillmentType === 'delivery' && (
                <div className="space-y-3 border-t border-[#E5E3DD] pt-4">
                  <h3 className="text-xs font-semibold text-[#141413]">
                    San Francisco Courier Delivery Address
                  </h3>
                  <input
                    type="text"
                    required
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    placeholder="Street Address"
                    aria-label="Street Address"
                    className="w-full rounded-md border border-[#D4D1C8] bg-white px-3 py-2 text-sm text-[#141413] focus:border-[#1C3B2B] focus:outline-none"
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={apartment}
                      onChange={(e) => setApartment(e.target.value)}
                      placeholder="Apt / Suite"
                      aria-label="Apartment or Suite"
                      className="w-full rounded-md border border-[#D4D1C8] bg-white px-3 py-2 text-sm text-[#141413] focus:border-[#1C3B2B] focus:outline-none"
                    />
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="City"
                      aria-label="City"
                      className="w-full rounded-md border border-[#D4D1C8] bg-white px-3 py-2 text-sm text-[#141413] focus:border-[#1C3B2B] focus:outline-none"
                    />
                    <input
                      type="text"
                      required
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="ZIP"
                      aria-label="Postal Code"
                      className="w-full rounded-md border border-[#D4D1C8] bg-white px-3 py-2 text-sm text-[#141413] focus:border-[#1C3B2B] focus:outline-none"
                    />
                  </div>
                  <input
                    type="text"
                    value={deliveryNotes}
                    onChange={(e) => setDeliveryNotes(e.target.value)}
                    placeholder="Gate code or drop-off instructions (optional)"
                    aria-label="Delivery Instructions"
                    className="w-full rounded-md border border-[#D4D1C8] bg-white px-3 py-2 text-sm text-[#141413] focus:border-[#1C3B2B] focus:outline-none"
                  />
                </div>
              )}

              <div className="space-y-3 border-t border-[#E5E3DD] pt-4">
                <h3 className="text-xs font-semibold text-[#141413]">Payment Method</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`flex items-center justify-center gap-2 rounded-md border py-2.5 text-xs font-medium cursor-pointer ${
                      paymentMethod === 'card'
                        ? 'border-[#1C3B2B] bg-[#F5F7F5] text-[#141413]'
                        : 'border-[#D4D1C8] bg-white text-[#57554F]'
                    }`}
                  >
                    <CreditCard className="h-4 w-4" aria-hidden="true" />
                    <span>Credit / Debit Card</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('express_wallet')}
                    className={`flex items-center justify-center gap-2 rounded-md border py-2.5 text-xs font-medium cursor-pointer ${
                      paymentMethod === 'express_wallet'
                        ? 'border-[#1C3B2B] bg-[#F5F7F5] text-[#141413]'
                        : 'border-[#D4D1C8] bg-white text-[#57554F]'
                    }`}
                  >
                    <Smartphone className="h-4 w-4" aria-hidden="true" />
                    <span>Apple Pay Wallet</span>
                  </button>
                </div>

                {paymentMethod === 'card' ? (
                  <div className="space-y-3 pt-1">
                    <input
                      type="text"
                      required
                      value={cardholderName}
                      onChange={(e) => setCardholderName(e.target.value)}
                      placeholder="Name on Card"
                      aria-label="Name on Card"
                      className="w-full rounded-md border border-[#D4D1C8] bg-white px-3 py-2 text-sm text-[#141413] focus:border-[#1C3B2B] focus:outline-none"
                    />
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="numeric"
                        required
                        value={cardNumber}
                        onChange={(e) => setCardNumber(formatCardDisplay(e.target.value))}
                        placeholder="Card Number (e.g. 4242 4242 4242 4242)"
                        aria-label="Card Number"
                        className="w-full rounded-md border border-[#D4D1C8] bg-white py-2 pl-3 pr-16 font-mono text-sm tabular-nums text-[#141413] focus:border-[#1C3B2B] focus:outline-none"
                      />
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#57554F]">
                        {cardDigits.length > 0 ? detectedBrand : ''}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        inputMode="numeric"
                        required
                        maxLength={5}
                        value={expInput}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/[^\d/]/g, '');
                          if (raw.length === 2 && !raw.includes('/') && expInput.length === 1) {
                            setExpInput(`${raw}/`);
                          } else {
                            setExpInput(raw);
                          }
                        }}
                        placeholder="MM/YY"
                        aria-label="Expiration Date"
                        className="w-full rounded-md border border-[#D4D1C8] bg-white px-3 py-2 font-mono text-sm tabular-nums text-[#141413] focus:border-[#1C3B2B] focus:outline-none"
                      />
                      <input
                        type="password"
                        inputMode="numeric"
                        required
                        maxLength={4}
                        value={cvc}
                        onChange={(e) => setCvc(e.target.value.replace(/\D/g, ''))}
                        placeholder="CVC"
                        aria-label="Security Code CVC"
                        className="w-full rounded-md border border-[#D4D1C8] bg-white px-3 py-2 font-mono text-sm tabular-nums text-[#141413] focus:border-[#1C3B2B] focus:outline-none"
                      />
                      <input
                        type="text"
                        required
                        value={billingZip}
                        onChange={(e) => setBillingZip(e.target.value)}
                        placeholder="Billing ZIP"
                        aria-label="Billing Postal Code"
                        className="w-full rounded-md border border-[#D4D1C8] bg-white px-3 py-2 font-mono text-sm tabular-nums text-[#141413] focus:border-[#1C3B2B] focus:outline-none"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="rounded-md border border-[#E5E3DD] bg-white p-4 text-xs leading-relaxed text-[#57554F]">
                    Express biometric authorization issues a single-use encrypted token
                    bound to Apple Pay (•••• 8841). Your card credentials are never exposed
                    to the merchant server.
                  </div>
                )}
              </div>

              {error && (
                <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
                  {error}
                </p>
              )}
            </div>

            <div className="border-t border-[#E5E3DD] bg-white px-6 py-5">
              <button
                type="submit"
                disabled={processing}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-[#1C3B2B] px-5 py-3 text-sm font-medium text-[#FAFAF8] transition-colors hover:bg-[#142B1F] disabled:opacity-60 cursor-pointer"
              >
                <Lock className="h-4 w-4" aria-hidden="true" />
                <span>
                  {processing
                    ? 'Authorizing & Placing Order...'
                    : `Pay $${total.toFixed(2)} & Track Order`}
                </span>
              </button>
              <p className="mt-2.5 text-center text-[11px] text-[#737068]">
                Luhn-checked tokenization · Server-verified pricing · Instant receipt
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
