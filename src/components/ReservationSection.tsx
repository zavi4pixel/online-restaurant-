import { CalendarCheck, CheckCircle2, Clock, Search, Users, XCircle } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Reservation, SeatingZone, TimeSlotAvailability } from '../types/restaurant.ts';

const SEATING_ZONES: { zone: SeatingZone; note: string }[] = [
  { zone: 'Main Dining Room', note: 'White linen tables facing the hearth' },
  { zone: "Chef's Counter", note: 'Front-row marble pass seating' },
  { zone: 'Garden Courtyard', note: 'Heated olive-tree terrace' },
];

function getUpcomingDates(): { value: string; label: string }[] {
  const dates: { value: string; label: string }[] = [];
  const base = new Date();
  for (let i = 0; i < 14; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    const formatted = d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
    dates.push({
      value: iso,
      label: i === 0 ? `Today · ${formatted}` : i === 1 ? `Tomorrow · ${formatted}` : formatted,
    });
  }
  return dates;
}

interface ReservationSectionProps {
  initialZone?: SeatingZone;
}

export function ReservationSection({ initialZone }: ReservationSectionProps) {
  const dateOptions = useMemo(() => getUpcomingDates(), []);
  const [date, setDate] = useState(dateOptions[0].value);
  const [partySize, setPartySize] = useState(2);
  const [seatingZone, setSeatingZone] = useState<SeatingZone>(
    initialZone ?? 'Main Dining Room'
  );

  useEffect(() => {
    if (initialZone) {
      setSeatingZone(initialZone);
    }
  }, [initialZone]);
  const [slots, setSlots] = useState<TimeSlotAvailability[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');

  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [occasion, setOccasion] = useState('');
  const [dietaryNotes, setDietaryNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [activeReservation, setActiveReservation] = useState<Reservation | null>(null);

  const [lookupCode, setLookupCode] = useState('');
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const fetchAvailability = useCallback(async () => {
    setLoadingSlots(true);
    setSlotsError(null);
    try {
      const params = new URLSearchParams({
        date,
        guests: String(partySize),
        zone: seatingZone,
      });
      const res = await fetch(`/api/reservations/availability?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Could not load table availability.');
      }
      setSlots(data.slots);
      setSelectedTime((prev) => {
        const stillAvailable = data.slots.some(
          (s: TimeSlotAvailability) => s.time === prev && s.available
        );
        if (stillAvailable) return prev;
        const firstOpen = data.slots.find((s: TimeSlotAvailability) => s.available);
        return firstOpen ? firstOpen.time : '';
      });
    } catch (err) {
      setSlotsError(
        err instanceof Error ? err.message : 'Unable to check table availability.'
      );
    } finally {
      setLoadingSlots(false);
    }
  }, [date, partySize, seatingZone]);

  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability]);

  const handleBookTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTime) {
      setSubmitError('Please select an available dining time.');
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date,
          time: selectedTime,
          partySize,
          seatingZone,
          guestName,
          guestEmail,
          guestPhone,
          occasion,
          dietaryNotes,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Could not confirm reservation.');
      }
      setActiveReservation(data.reservation);
      setLookupCode(data.reservation.code);
      setGuestName('');
      setGuestEmail('');
      setGuestPhone('');
      setOccasion('');
      setDietaryNotes('');
      fetchAvailability();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Reservation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLookup = async (codeToFetch: string) => {
    const cleaned = codeToFetch.trim().toUpperCase();
    if (!cleaned) return;
    setLookupLoading(true);
    setLookupError(null);
    try {
      const res = await fetch(`/api/reservations/${encodeURIComponent(cleaned)}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Reservation not found.');
      }
      setActiveReservation(data.reservation);
    } catch (err) {
      setLookupError(err instanceof Error ? err.message : 'Lookup failed.');
    } finally {
      setLookupLoading(false);
    }
  };

  const handleCancelReservation = async (code: string) => {
    setCancelling(true);
    setLookupError(null);
    try {
      const res = await fetch(
        `/api/reservations/${encodeURIComponent(code)}/cancel`,
        { method: 'POST' }
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Unable to cancel reservation.');
      }
      setActiveReservation(data.reservation);
      fetchAvailability();
    } catch (err) {
      setLookupError(err instanceof Error ? err.message : 'Cancellation failed.');
    } finally {
      setCancelling(false);
    }
  };

  const formatTimeLabel = (time24: string) => {
    const [hStr, mStr] = time24.split(':');
    const h = Number.parseInt(hStr, 10);
    const suffix = h >= 12 ? 'PM' : 'AM';
    const hour12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return `${hour12}:${mStr} ${suffix}`;
  };

  return (
      <section className="bg-[#F3F1EC] py-12 lg:py-16">
      <div className="mx-auto max-w-[1280px] px-6">
        <div className="flex flex-col justify-between gap-4 border-b border-[#DFDCD2] pb-8 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-medium text-[#57554F]">
              Real-Time Table Inventory · Instant Confirmation
            </p>
            <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-[#141413] lg:text-5xl">
              Table Reservations
            </h1>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-[#57554F]">
            Select your preferred dining room zone and live seating time. Reservations
            up to 8 guests confirm immediately with no booking fee.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 items-stretch gap-8 lg:grid-cols-12">
          <form
            onSubmit={handleBookTable}
            className="flex flex-col justify-between rounded-lg border border-[#E5E3DD] bg-white p-6 lg:col-span-7 lg:p-8"
          >
            <div>
              <h3 className="font-display text-2xl font-semibold text-[#141413]">
                Book a Table
              </h3>

              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="res-date"
                    className="block text-xs font-semibold text-[#141413]"
                  >
                    Dining Date
                  </label>
                  <select
                    id="res-date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="mt-1.5 w-full rounded-md border border-[#D4D1C8] bg-white px-3 py-2.5 text-sm text-[#141413] focus:border-[#1C3B2B] focus:outline-none"
                  >
                    {dateOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="res-guests"
                    className="block text-xs font-semibold text-[#141413]"
                  >
                    Party Size
                  </label>
                  <div className="relative mt-1.5">
                    <Users
                      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#57554F]"
                      aria-hidden="true"
                    />
                    <select
                      id="res-guests"
                      value={partySize}
                      onChange={(e) => setPartySize(Number(e.target.value))}
                      className="w-full rounded-md border border-[#D4D1C8] bg-white py-2.5 pl-9 pr-3 text-sm text-[#141413] tabular-nums focus:border-[#1C3B2B] focus:outline-none"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                        <option key={n} value={n}>
                          {n} {n === 1 ? 'Guest' : 'Guests'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="mt-5">
                <span className="block text-xs font-semibold text-[#141413]">
                  Seating Zone
                </span>
                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {SEATING_ZONES.map((item) => {
                    const active = seatingZone === item.zone;
                    return (
                      <button
                        key={item.zone}
                        type="button"
                        onClick={() => setSeatingZone(item.zone)}
                        className={`rounded-md border p-3 text-left transition-colors cursor-pointer ${
                          active
                            ? 'border-[#1C3B2B] bg-[#F5F7F5]'
                            : 'border-[#E5E3DD] bg-white hover:border-[#C5C1B6]'
                        }`}
                      >
                        <p className="text-xs font-semibold text-[#141413]">
                          {item.zone}
                        </p>
                        <p className="mt-0.5 text-[11px] text-[#57554F]">{item.note}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#141413]">
                    Available Seating Times
                  </span>
                  <span className="text-xs text-[#57554F]">{seatingZone}</span>
                </div>

                {loadingSlots ? (
                  <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-5">
                    {Array.from({ length: 10 }).map((_, idx) => (
                      <div
                        key={idx}
                        className="h-12 animate-pulse rounded-md border border-[#E5E3DD] bg-[#F3F1EC]"
                      />
                    ))}
                  </div>
                ) : slotsError ? (
                  <p className="mt-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
                    {slotsError}
                  </p>
                ) : (
                  <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-5">
                    {slots.map((slot) => {
                      const active = selectedTime === slot.time;
                      return (
                        <button
                          key={slot.time}
                          type="button"
                          disabled={!slot.available}
                          onClick={() => setSelectedTime(slot.time)}
                          className={`rounded-md border px-2.5 py-2 text-center transition-colors ${
                            !slot.available
                              ? 'cursor-not-allowed border-[#EAE7DF] bg-[#F7F6F3] text-[#A29F96]'
                              : active
                              ? 'cursor-pointer border-[#1C3B2B] bg-[#1C3B2B] text-[#FAFAF8]'
                              : 'cursor-pointer border-[#D4D1C8] bg-white text-[#141413] hover:border-[#1C3B2B]'
                          }`}
                        >
                          <span className="block text-xs font-semibold tabular-nums whitespace-nowrap">
                            {slot.label}
                          </span>
                          <span
                            className={`mt-0.5 block text-[11px] tabular-nums ${
                              active ? 'text-[#DCE5DF]' : 'text-[#737068]'
                            }`}
                          >
                            {slot.available
                              ? `${slot.remainingTables} left`
                              : 'Full'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="res-name"
                    className="block text-xs font-semibold text-[#141413]"
                  >
                    Guest Name
                  </label>
                  <input
                    id="res-name"
                    type="text"
                    required
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Jordan Alvarez"
                    className="mt-1.5 w-full rounded-md border border-[#D4D1C8] bg-white px-3 py-2 text-sm text-[#141413] focus:border-[#1C3B2B] focus:outline-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor="res-email"
                    className="block text-xs font-semibold text-[#141413]"
                  >
                    Email Address
                  </label>
                  <input
                    id="res-email"
                    type="email"
                    required
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder="jordan@example.com"
                    className="mt-1.5 w-full rounded-md border border-[#D4D1C8] bg-white px-3 py-2 text-sm text-[#141413] focus:border-[#1C3B2B] focus:outline-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor="res-phone"
                    className="block text-xs font-semibold text-[#141413]"
                  >
                    Mobile Number
                  </label>
                  <input
                    id="res-phone"
                    type="tel"
                    required
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    placeholder="(415) 555-0199"
                    className="mt-1.5 w-full rounded-md border border-[#D4D1C8] bg-white px-3 py-2 text-sm text-[#141413] focus:border-[#1C3B2B] focus:outline-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor="res-occasion"
                    className="block text-xs font-semibold text-[#141413]"
                  >
                    Occasion (Optional)
                  </label>
                  <input
                    id="res-occasion"
                    type="text"
                    value={occasion}
                    onChange={(e) => setOccasion(e.target.value)}
                    placeholder="Anniversary, Birthday..."
                    className="mt-1.5 w-full rounded-md border border-[#D4D1C8] bg-white px-3 py-2 text-sm text-[#141413] focus:border-[#1C3B2B] focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label
                  htmlFor="res-dietary"
                  className="block text-xs font-semibold text-[#141413]"
                >
                  Dietary Restrictions or Seating Notes (Optional)
                </label>
                <input
                  id="res-dietary"
                  type="text"
                  value={dietaryNotes}
                  onChange={(e) => setDietaryNotes(e.target.value)}
                  placeholder="e.g., Shellfish allergy at table, celebration dessert"
                  className="mt-1.5 w-full rounded-md border border-[#D4D1C8] bg-white px-3 py-2 text-sm text-[#141413] focus:border-[#1C3B2B] focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-6 border-t border-[#E5E3DD] pt-5">
              {submitError && (
                <p className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
                  {submitError}
                </p>
              )}
              <button
                type="submit"
                disabled={submitting || !selectedTime}
                className="w-full rounded-md bg-[#1C3B2B] px-5 py-3 text-sm font-medium text-[#FAFAF8] transition-colors hover:bg-[#142B1F] disabled:cursor-not-allowed disabled:opacity-55 cursor-pointer"
              >
                {submitting
                  ? 'Confirming Table...'
                  : selectedTime
                  ? `Confirm Table for ${partySize} at ${formatTimeLabel(selectedTime)}`
                  : 'Select an Available Time'}
              </button>
            </div>
          </form>

          <div className="flex flex-col justify-between gap-6 lg:col-span-5">
            <div className="rounded-lg border border-[#E5E3DD] bg-white p-6">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-display text-2xl font-semibold text-[#141413]">
                  Manage Reservation
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setLookupCode('RES-4821');
                    handleLookup('RES-4821');
                  }}
                  className="text-xs font-medium text-[#1C3B2B] underline underline-offset-4 cursor-pointer"
                >
                  Sample: RES-4821
                </button>
              </div>
              <p className="mt-1.5 text-sm text-[#57554F]">
                Enter your confirmation code to review seating details or release your
                table.
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleLookup(lookupCode);
                }}
                className="mt-4 flex gap-2"
              >
                <div className="relative flex-1">
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#737068]"
                    aria-hidden="true"
                  />
                  <input
                    type="text"
                    value={lookupCode}
                    onChange={(e) => setLookupCode(e.target.value.toUpperCase())}
                    placeholder="RES-4821"
                    aria-label="Reservation confirmation code"
                    className="w-full rounded-md border border-[#D4D1C8] bg-white py-2.5 pl-9 pr-3 font-mono text-sm uppercase text-[#141413] placeholder:text-[#8E8B82] focus:border-[#1C3B2B] focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={lookupLoading}
                  className="rounded-md border border-[#D4D1C8] bg-[#FAFAF8] px-4 py-2.5 text-sm font-medium text-[#141413] hover:bg-[#F3F1EC] cursor-pointer whitespace-nowrap"
                >
                  {lookupLoading ? 'Checking...' : 'Find'}
                </button>
              </form>

              {lookupError && (
                <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
                  {lookupError}
                </p>
              )}

              {activeReservation ? (
                <div className="mt-5 border-t border-[#E5E3DD] pt-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-mono text-xs font-medium text-[#57554F]">
                        Confirmation {activeReservation.code}
                      </p>
                      <h4 className="mt-1 text-lg font-semibold text-[#141413]">
                        {activeReservation.guestName} · {activeReservation.partySize}{' '}
                        {activeReservation.partySize === 1 ? 'Guest' : 'Guests'}
                      </h4>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                        activeReservation.status === 'confirmed'
                          ? 'text-[#1C3B2B]'
                          : 'text-[#8B261D]'
                      }`}
                    >
                      {activeReservation.status === 'confirmed' ? (
                        <>
                          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                          <span>Confirmed</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4" aria-hidden="true" />
                          <span>Cancelled</span>
                        </>
                      )}
                    </span>
                  </div>

                  <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <dt className="text-xs text-[#737068]">Date</dt>
                      <dd className="mt-0.5 font-medium tabular-nums text-[#141413]">
                        {activeReservation.date}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-[#737068]">Time</dt>
                      <dd className="mt-0.5 font-medium tabular-nums text-[#141413]">
                        {formatTimeLabel(activeReservation.time)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-[#737068]">Seating Zone</dt>
                      <dd className="mt-0.5 font-medium text-[#141413]">
                        {activeReservation.seatingZone}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-[#737068]">Contact</dt>
                      <dd className="mt-0.5 truncate font-medium text-[#141413]">
                        {activeReservation.guestPhone}
                      </dd>
                    </div>
                  </dl>

                  {(activeReservation.occasion || activeReservation.dietaryNotes) && (
                    <p className="mt-3 text-xs text-[#57554F]">
                      {[
                        activeReservation.occasion
                          ? `Occasion: ${activeReservation.occasion}`
                          : null,
                        activeReservation.dietaryNotes
                          ? `Notes: ${activeReservation.dietaryNotes}`
                          : null,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                  )}

                  {activeReservation.status === 'confirmed' && (
                    <button
                      type="button"
                      disabled={cancelling}
                      onClick={() => handleCancelReservation(activeReservation.code)}
                      className="mt-4 rounded-md border border-[#D4D1C8] px-3.5 py-2 text-xs font-medium text-[#8B261D] transition-colors hover:bg-red-50 cursor-pointer"
                    >
                      {cancelling ? 'Cancelling...' : 'Cancel Reservation'}
                    </button>
                  )}
                </div>
              ) : (
                <div className="mt-5 border-t border-[#E5E3DD] pt-5 text-xs text-[#737068]">
                  Confirmed reservations appear here immediately with instant table-release
                  management.
                </div>
              )}
            </div>

            <div className="rounded-lg border border-[#E5E3DD] bg-white p-6">
              <h4 className="text-sm font-semibold text-[#141413]">
                Dining Room &amp; Hospitality Notes
              </h4>
              <ul className="mt-3 space-y-2.5 text-sm text-[#57554F]">
                <li className="flex items-start gap-2.5">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-[#1C3B2B]" aria-hidden="true" />
                  <span>
                    Tables are held for 15 minutes past reservation time. Please call if
                    delayed.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CalendarCheck
                    className="mt-0.5 h-4 w-4 shrink-0 text-[#1C3B2B]"
                    aria-hidden="true"
                  />
                  <span>
                    Parties of 9+ or private hearth buyouts may reach hospitality@ardenandhearth.com.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
