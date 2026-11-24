import { ArrowRight, Calendar, UtensilsCrossed } from 'lucide-react';
import { useState } from 'react';
import { HERO_IMAGE_URL } from '../data/menu.ts';

interface HeroProps {
  onNavigate: (path: string) => void;
}

export function Hero({ onNavigate }: HeroProps) {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <section className="border-b border-[#E5E3DD] bg-[#FAFAF8]">
      <div className="mx-auto max-w-[1280px] px-6 py-12 lg:py-16">
        <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="flex flex-col justify-between lg:col-span-5 py-2">
            <div>
              <p className="text-xs font-medium tracking-wide text-[#57554F]">
                418 Jackson Street · San Francisco · Wood-Fired Coastal Bistro
              </p>

              <h1 className="mt-5 font-display text-[clamp(2.5rem,4.4vw,3.75rem)] font-semibold leading-[1.06] tracking-tight text-[#141413] text-balance">
                Coastal harvest over white oak embers.
              </h1>

              <p className="mt-5 max-w-[52ch] text-base leading-relaxed text-[#57554F]">
                Seasonal line-caught seafood, hand-folded pasta, and hearth-roasted cuts
                prepared to order. Reserve a table in our dining room or place an online
                order with live kitchen tracking.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="/menu"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('/menu');
                }}
                className="inline-flex items-center gap-2 rounded-md bg-[#1C3B2B] px-6 py-3 text-sm font-medium text-[#FAFAF8] transition-colors duration-150 hover:bg-[#142B1F] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1C3B2B] whitespace-nowrap shrink-0"
              >
                <span>Explore Menu &amp; Order</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>

              <a
                href="/reservations"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('/reservations');
                }}
                className="inline-flex items-center gap-2 rounded-md border border-[#D4D1C8] bg-white px-5 py-3 text-sm font-medium text-[#141413] transition-colors duration-150 hover:border-[#141413] hover:bg-[#F3F1EC] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1C3B2B] whitespace-nowrap shrink-0"
              >
                <Calendar className="h-4 w-4 text-[#1C3B2B]" aria-hidden="true" />
                <span>Reserve a Table</span>
              </a>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="relative h-72 w-full overflow-hidden rounded-lg border border-[#E5E3DD] bg-[#EAE7DF] sm:h-96 lg:h-full lg:min-h-[420px]">
              {!imgFailed ? (
                <img
                  src={HERO_IMAGE_URL}
                  alt="Arden & Hearth dining room with open wood-fired hearth kitchen and coastal twilight view"
                  referrerPolicy="no-referrer"
                  onError={() => setImgFailed(true)}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#EAE7DF] to-[#D8D3C6] p-8 text-center">
                  <UtensilsCrossed className="h-10 w-10 text-[#1C3B2B] opacity-70" />
                  <p className="mt-3 font-display text-2xl font-semibold text-[#141413]">
                    Arden &amp; Hearth Dining Room
                  </p>
                  <p className="mt-1 text-sm text-[#57554F]">
                    418 Jackson Street · San Francisco
                  </p>
                </div>
              )}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent"
              />
            </div>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-6 border-t border-[#E5E3DD] pt-8 md:grid-cols-4">
          <div>
            <p className="text-xs font-medium text-[#57554F]">Dinner Service</p>
            <p className="mt-1 text-sm font-semibold text-[#141413] tabular-nums">
              Tue–Sun · 5:00 PM – 10:30 PM
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-[#57554F]">Kitchen Method</p>
            <p className="mt-1 text-sm font-semibold text-[#141413]">
              White Oak &amp; Almond Wood Hearth
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-[#57554F]">Online Ordering</p>
            <p className="mt-1 text-sm font-semibold text-[#141413] tabular-nums">
              Pickup &amp; Courier · 20–30 Mins
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-[#57554F]">Checkout Security</p>
            <p className="mt-1 text-sm font-semibold text-[#141413]">
              Tokenized Gateway · Live Tracking
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
