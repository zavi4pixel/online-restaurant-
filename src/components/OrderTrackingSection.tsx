import {
  CheckCircle2,
  ChefHat,
  Clock,
  Flame,
  PackageCheck,
  Search,
  Share2,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import type { OrderRecord, OrderStage } from '../types/restaurant.ts';

interface TrackedOrderRef {
  orderNumber: string;
  trackingToken?: string;
}

interface OrderTrackingSectionProps {
  activeOrderRef: TrackedOrderRef | null;
  recentOrderRefs: TrackedOrderRef[];
  onSelectOrderRef: (ref: TrackedOrderRef) => void;
  onShareOrder?: (orderNumber: string) => void;
}

function StageIcon({ stage, done }: { stage: OrderStage; done: boolean }) {
  const cls = `h-4 w-4 ${done ? 'text-[#FAFAF8]' : 'text-[#737068]'}`;
  switch (stage) {
    case 'confirmed':
      return <ShieldCheck className={cls} aria-hidden="true" />;
    case 'preparing':
      return <ChefHat className={cls} aria-hidden="true" />;
    case 'wood_fired':
      return <Flame className={cls} aria-hidden="true" />;
    case 'ready_or_out':
      return <Truck className={cls} aria-hidden="true" />;
    case 'completed':
      return <PackageCheck className={cls} aria-hidden="true" />;
  }
}

export function OrderTrackingSection({
  activeOrderRef,
  recentOrderRefs,
  onSelectOrderRef,
  onShareOrder,
}: OrderTrackingSectionProps) {
  const [searchInput, setSearchInput] = useState(
    activeOrderRef?.orderNumber ?? 'ORD-4092'
  );
  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [advancing, setAdvancing] = useState(false);

  const targetOrderNumber = activeOrderRef?.orderNumber ?? 'ORD-4092';
  const targetToken = activeOrderRef?.trackingToken ?? '';

  useEffect(() => {
    if (activeOrderRef?.orderNumber) {
      setSearchInput(activeOrderRef.orderNumber);
    }
  }, [activeOrderRef]);

  const fetchOrder = useCallback(
    async (ordNum: string, token?: string, silent = false) => {
      if (!silent) setLoading(true);
      setError(null);
      try {
        const query = token ? `?token=${encodeURIComponent(token)}` : '';
        const res = await fetch(`/api/orders/${encodeURIComponent(ordNum)}${query}`);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Could not locate order.');
        }
        setOrder(data.order);
      } catch (err) {
        if (!silent) {
          setError(err instanceof Error ? err.message : 'Unable to fetch order.');
        }
      } finally {
        if (!silent) setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchOrder(targetOrderNumber, targetToken);
  }, [targetOrderNumber, targetToken, fetchOrder]);

  useEffect(() => {
    if (!order || order.status === 'completed') return;
    const interval = window.setInterval(() => {
      fetchOrder(order.orderNumber, targetToken, true);
    }, 4000);
    return () => window.clearInterval(interval);
  }, [order, targetToken, fetchOrder]);

  const handleLookupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = searchInput.trim().toUpperCase();
    if (!cleaned) return;
    const matchedSession = recentOrderRefs.find((r) => r.orderNumber === cleaned);
    onSelectOrderRef({
      orderNumber: cleaned,
      trackingToken: matchedSession?.trackingToken,
    });
    fetchOrder(cleaned, matchedSession?.trackingToken);
  };

  const handleAdvanceStage = async () => {
    if (!order) return;
    setAdvancing(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/orders/${encodeURIComponent(order.orderNumber)}/advance`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ trackingToken: targetToken }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Unable to advance order stage.');
      }
      setOrder(data.order);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to advance stage.');
    } finally {
      setAdvancing(false);
    }
  };

  const formatShortTime = (iso: string | null) => {
    if (!iso) return 'Pending';
    return new Date(iso).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const currentStageEntry = order?.timeline.find((t) => t.stage === order.status);

  return (
    <section className="bg-[#FAFAF8] py-12 lg:py-16">
      <div className="mx-auto max-w-[1280px] px-6">
        <div className="flex flex-col justify-between gap-4 border-b border-[#E5E3DD] pb-8 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-medium text-[#57554F]">
              Kitchen Pass Synchronization · Verified Receipts
            </p>
            <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-[#141413] lg:text-5xl">
              Live Order Tracking
            </h1>
          </div>

          <form onSubmit={handleLookupSubmit} className="flex w-full max-w-md gap-2">
            <div className="relative flex-1">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#737068]"
                aria-hidden="true"
              />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value.toUpperCase())}
                placeholder="Enter order number (e.g. ORD-4092)"
                aria-label="Order tracking number"
                className="w-full rounded-md border border-[#D4D1C8] bg-white py-2.5 pl-9 pr-3 font-mono text-sm uppercase text-[#141413] placeholder:text-[#8E8B82] focus:border-[#1C3B2B] focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-[#1C3B2B] px-4 py-2.5 text-sm font-medium text-[#FAFAF8] transition-colors hover:bg-[#142B1F] cursor-pointer whitespace-nowrap"
            >
              {loading ? 'Loading...' : 'Track Order'}
            </button>
          </form>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-[#57554F]">
          <span>Quick Track:</span>
          <button
            type="button"
            onClick={() => {
              setSearchInput('ORD-4092');
              onSelectOrderRef({ orderNumber: 'ORD-4092' });
            }}
            className={`font-mono underline underline-offset-4 cursor-pointer ${
              order?.orderNumber === 'ORD-4092'
                ? 'font-semibold text-[#1C3B2B]'
                : 'text-[#57554F] hover:text-[#141413]'
            }`}
          >
            ORD-4092 (Sample)
          </button>
          {recentOrderRefs
            .filter((r) => r.orderNumber !== 'ORD-4092')
            .map((ref) => (
              <button
                key={ref.orderNumber}
                type="button"
                onClick={() => {
                  setSearchInput(ref.orderNumber);
                  onSelectOrderRef(ref);
                }}
                className={`font-mono underline underline-offset-4 cursor-pointer ${
                  order?.orderNumber === ref.orderNumber
                    ? 'font-semibold text-[#1C3B2B]'
                    : 'text-[#57554F] hover:text-[#141413]'
                }`}
              >
                {ref.orderNumber} (Your Order)
              </button>
            ))}
        </div>

        {error && (
          <div className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}

        {order && (
          <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="rounded-lg border border-[#E5E3DD] bg-white p-6 lg:col-span-7 lg:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#E5E3DD] pb-5">
                <div>
                  <p className="font-mono text-xs font-medium text-[#57554F]">
                    {order.orderNumber} ·{' '}
                    {order.fulfillmentType === 'pickup'
                      ? 'Counter Pickup'
                      : 'Courier Delivery'}
                  </p>
                  <h3 className="mt-1 font-display text-3xl font-semibold text-[#141413]">
                    {currentStageEntry?.label ?? 'Order Confirmed'}
                  </h3>
                  <p className="mt-1 text-sm text-[#57554F]">
                    {currentStageEntry?.description}
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <div className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1C3B2B]">
                    <Clock className="h-4 w-4" aria-hidden="true" />
                    <span className="tabular-nums">
                      {order.status === 'completed'
                        ? 'Completed'
                        : `~${order.estimatedMinutesRemaining} mins remaining`}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[#737068] tabular-nums">
                    Target {formatShortTime(order.estimatedReadyAt)}
                  </p>
                  {onShareOrder && (
                    <button
                      type="button"
                      onClick={() => onShareOrder(order.orderNumber)}
                      className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-[#1C3B2B] underline underline-offset-4 hover:text-[#142B1F] cursor-pointer"
                    >
                      <Share2 className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Open on Another Device</span>
                    </button>
                  )}
                </div>
              </div>

              <ol className="mt-6 space-y-5">
                {order.timeline.map((step, index) => {
                  const done = Boolean(step.completedAt);
                  const isCurrent = order.status === step.stage;
                  return (
                    <li key={step.stage} className="flex items-start gap-4">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${
                          done
                            ? 'border-[#1C3B2B] bg-[#1C3B2B]'
                            : 'border-[#D4D1C8] bg-[#F3F1EC]'
                        }`}
                      >
                        <StageIcon stage={step.stage} done={done} />
                      </div>
                      <div className="min-w-0 flex-1 border-b border-[#F2F0EA] pb-4 last:border-none last:pb-0">
                        <div className="flex items-center justify-between gap-2">
                          <p
                            className={`text-sm font-semibold ${
                              isCurrent
                                ? 'text-[#1C3B2B]'
                                : done
                                ? 'text-[#141413]'
                                : 'text-[#737068]'
                            }`}
                          >
                            0{index + 1}. {step.label}
                          </p>
                          <span className="font-mono text-xs tabular-nums text-[#737068]">
                            {formatShortTime(step.completedAt)}
                          </span>
                        </div>
                        <p className="mt-1 text-xs leading-relaxed text-[#57554F]">
                          {step.description}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>

              {order.status !== 'completed' && (
                <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#E5E3DD] pt-5">
                  <p className="text-xs text-[#737068]">
                    Kitchen pass refreshes automatically every 4 seconds.
                  </p>
                  <button
                    type="button"
                    disabled={advancing}
                    onClick={handleAdvanceStage}
                    className="rounded-md border border-[#1C3B2B] px-3.5 py-2 text-xs font-medium text-[#1C3B2B] transition-colors hover:bg-[#1C3B2B] hover:text-[#FAFAF8] cursor-pointer whitespace-nowrap"
                  >
                    {advancing ? 'Updating...' : 'Simulate Next Kitchen Stage'}
                  </button>
                </div>
              )}
            </div>

            <div className="rounded-lg border border-[#E5E3DD] bg-white p-6 lg:col-span-5 lg:p-8">
              <div className="flex items-center justify-between border-b border-[#E5E3DD] pb-4">
                <h3 className="font-display text-2xl font-semibold text-[#141413]">
                  Verified Receipt
                </h3>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#1C3B2B]">
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  <span>Paid</span>
                </span>
              </div>

              <div className="mt-4 space-y-2 text-xs text-[#57554F]">
                <p>
                  <span className="font-semibold text-[#141413]">Recipient:</span>{' '}
                  {order.customer.name} · {order.customer.phone}
                </p>
                <p>
                  <span className="font-semibold text-[#141413]">Fulfillment:</span>{' '}
                  {order.customer.addressSummary}
                </p>
              </div>

              <div className="mt-5 space-y-3 border-t border-[#E5E3DD] pt-4">
                {order.items.map((item, idx) => (
                  <div
                    key={`${item.menuItemId}-${idx}`}
                    className="flex items-start justify-between gap-3 text-sm"
                  >
                    <div>
                      <p className="font-medium text-[#141413]">
                        <span className="tabular-nums font-semibold">
                          {item.quantity}x
                        </span>{' '}
                        {item.name}
                      </p>
                      {item.modifiersLabel && (
                        <p className="text-xs text-[#737068]">{item.modifiersLabel}</p>
                      )}
                      {item.specialInstructions && (
                        <p className="text-xs italic text-[#737068]">
                          Note: {item.specialInstructions}
                        </p>
                      )}
                    </div>
                    <span className="tabular-nums font-medium text-[#141413]">
                      ${item.lineTotal.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <dl className="mt-5 space-y-2 border-t border-[#E5E3DD] pt-4 text-sm">
                <div className="flex justify-between text-[#57554F]">
                  <dt>Subtotal</dt>
                  <dd className="tabular-nums">${order.pricing.subtotal.toFixed(2)}</dd>
                </div>
                <div className="flex justify-between text-[#57554F]">
                  <dt>CA Sales Tax (8.625%)</dt>
                  <dd className="tabular-nums">${order.pricing.tax.toFixed(2)}</dd>
                </div>
                {order.pricing.deliveryFee > 0 && (
                  <div className="flex justify-between text-[#57554F]">
                    <dt>Local Courier Fee</dt>
                    <dd className="tabular-nums">
                      ${order.pricing.deliveryFee.toFixed(2)}
                    </dd>
                  </div>
                )}
                <div className="flex justify-between text-[#57554F]">
                  <dt>Hospitality Tip</dt>
                  <dd className="tabular-nums">${order.pricing.tip.toFixed(2)}</dd>
                </div>
                <div className="flex justify-between border-t border-[#E5E3DD] pt-2.5 text-base font-semibold text-[#141413]">
                  <dt>Total Charged</dt>
                  <dd className="tabular-nums">${order.pricing.total.toFixed(2)}</dd>
                </div>
              </dl>

              <div className="mt-5 rounded-md border border-[#E5E3DD] bg-[#F7F6F3] p-3.5 text-xs text-[#57554F]">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-[#141413]">
                    {order.payment.brand} •••• {order.payment.last4}
                  </span>
                  <span className="font-mono">{order.payment.transactionId}</span>
                </div>
                <p className="mt-1.5 font-mono text-[11px] text-[#737068]">
                  HMAC Digest: {order.payment.receiptSignature}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
