import { ArrowRight, Calendar, Clock, Compass, Mail, MapPin, Plus, ShieldCheck, UtensilsCrossed } from 'lucide-react';
import { useState } from 'react';
import type { MenuItem } from '../types/restaurant.ts';
import { Hero } from './Hero.tsx';

interface HomePageProps {
  featuredItems: MenuItem[];
  onNavigate: (path: string) => void;
  onQuickAdd: (item: MenuItem) => void;
}

export function HomePage({ featuredItems, onNavigate, onQuickAdd }: HomePageProps) {
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});

  const destinations = [
    {
      path: '/menu',
      kicker: 'Online Ordering',
      title: 'Seasonal Menu',
      description:
        'Explore all twelve wood-fired mains, handmade pastas, starters, and desserts with full ingredient notes.',
      cta: 'Browse Full Menu',
      icon: UtensilsCrossed,
    },
    {
      path: '/dining-area',
      kicker: 'Three Spaces',
      title: 'The Dining Area',
      description:
        "Tour the Main Dining Room, front-row marble Chef's Counter, and heated Garden Courtyard.",
      cta: 'Explore Dining Spaces',
      icon: MapPin,
    },
    {
      path: '/hours',
      kicker: 'Tue – Sun',
      title: 'Opening & Closing Hours',
      description:
        'View nightly dinner service hours, bar lounge timings, last seating cutoffs, and courier windows.',
      cta: 'View Weekly Timings',
      icon: Clock,
    },
    {
      path: '/reservations',
      kicker: 'Instant Booking',
      title: 'Reservations & Bookings',
      description:
        'Check live table availability by seating zone and confirm or manage an existing reservation.',
      cta: 'Book a Table',
      icon: Calendar,
    },
    {
      path: '/track-order',
      kicker: 'Kitchen Pass',
      title: 'Live Order Tracking',
      description:
        'Follow your online pickup or delivery order in real time from payment authorization to plating.',
      cta: 'Track an Order',
      icon: ShieldCheck,
    },
    {
      path: '/about',
      kicker: 'Our Story & Desk',
      title: 'About Us & Contact',
      description:
        'Meet our culinary team, explore our Northern California sourcing, or message our host desk.',
      cta: 'Read Our Story',
      icon: Compass,
    },
  ];

  return (
    <div>
      <Hero onNavigate={onNavigate} />

      <section className="border-b border-[#E5E3DD] bg-[#FAFAF8] py-16">
        <div className="mx-auto max-w-[1280px] px-6">
          <div className="flex flex-col justify-between gap-4 border-b border-[#E5E3DD] pb-6 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-medium text-[#57554F]">
                Click any dish to view ingredients, pairings &amp; preparation
              </p>
              <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight text-[#141413]">
                Chef&apos;s Signature Plates
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('/menu')}
              className="inline-flex items-center gap-2 text-sm font-medium text-[#1C3B2B] underline underline-offset-4 hover:text-[#142B1F] cursor-pointer self-start md:self-auto"
            >
              <span>View Full Menu (12 Dishes)</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredItems.map((item) => {
              const imgFailed = brokenImages[item.id];
              return (
                <article
                  key={item.id}
                  className="group flex flex-col justify-between rounded-lg border border-[#E5E3DD] bg-white transition-transform duration-150 hover:-translate-y-0.5"
                >
                  <div>
                    <button
                      type="button"
                      onClick={() => onNavigate(`/menu/${item.id}`)}
                      aria-label={`View ${item.name} details`}
                      className="block w-full overflow-hidden rounded-t-lg bg-[#EAE7DF] text-left cursor-pointer"
                    >
                      <div className="aspect-[4/3] w-full overflow-hidden">
                        {item.imageUrl && !imgFailed ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            referrerPolicy="no-referrer"
                            onError={() =>
                              setBrokenImages((prev) => ({ ...prev, [item.id]: true }))
                            }
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                          />
                        ) : (
                          <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#F3F1EC] to-[#E2DED3] p-4 text-center">
                            <UtensilsCrossed className="h-6 w-6 text-[#1C3B2B] opacity-70" />
                            <p className="mt-2 text-xs font-medium text-[#57554F]">
                              {item.name}
                            </p>
                          </div>
                        )}
                      </div>
                    </button>

                    <div className="p-5 pb-3">
                      <p className="text-xs text-[#57554F]">
                        {item.category}
                        {item.dietary[0] ? ` · ${item.dietary[0]}` : ''}
                      </p>
                      <button
                        type="button"
                        onClick={() => onNavigate(`/menu/${item.id}`)}
                        className="mt-1.5 block text-left text-base font-semibold leading-snug text-[#141413] hover:text-[#1C3B2B] hover:underline underline-offset-4 cursor-pointer"
                      >
                        {item.name}
                      </button>
                      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[#57554F]">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-[#F0EEE8] px-5 py-3.5">
                    <span className="tabular-nums text-[15px] font-semibold text-[#141413]">
                      ${item.price.toFixed(2)}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onNavigate(`/menu/${item.id}`)}
                        className="rounded-md border border-[#D4D1C8] px-2.5 py-1.5 text-xs font-medium text-[#141413] hover:bg-[#F3F1EC] cursor-pointer"
                      >
                        Details
                      </button>
                      <button
                        type="button"
                        onClick={() => onQuickAdd(item)}
                        className="inline-flex items-center gap-1 rounded-md bg-[#1C3B2B] px-3 py-1.5 text-xs font-medium text-[#FAFAF8] hover:bg-[#142B1F] cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-[#F3F1EC] py-16">
        <div className="mx-auto max-w-[1280px] px-6">
          <div className="flex flex-col justify-between gap-4 border-b border-[#DFDCD2] pb-6 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-medium text-[#57554F]">
                Dedicated Pages for Every Experience
              </p>
              <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight text-[#141413]">
                Explore Arden &amp; Hearth
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('/contact')}
              className="inline-flex items-center gap-2 text-sm font-medium text-[#1C3B2B] underline underline-offset-4 hover:text-[#142B1F] cursor-pointer self-start md:self-auto"
            >
              <Mail className="h-4 w-4" aria-hidden="true" />
              <span>Contact Our Host Desk</span>
            </button>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {destinations.map((dest) => {
              const Icon = dest.icon;
              return (
                <button
                  key={dest.path}
                  type="button"
                  onClick={() => onNavigate(dest.path)}
                  className="group flex flex-col justify-between rounded-lg border border-[#E5E3DD] bg-white p-6 text-left transition-colors hover:border-[#1C3B2B] cursor-pointer"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-[#57554F]">
                      <span>{dest.kicker}</span>
                      <Icon className="h-4 w-4 text-[#1C3B2B]" aria-hidden="true" />
                    </div>
                    <h3 className="mt-3 font-display text-2xl font-semibold text-[#141413]">
                      {dest.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-[#57554F]">
                      {dest.description}
                    </p>
                  </div>
                  <span className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-[#1C3B2B] group-hover:underline underline-offset-4">
                    <span>{dest.cta}</span>
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
