import { ArrowRight, Flame, Sparkles, Trees, Users, UtensilsCrossed } from 'lucide-react';
import { useState } from 'react';
import { HERO_IMAGE_URL } from '../data/menu.ts';
import type { SeatingZone } from '../types/restaurant.ts';

interface DiningAreaPageProps {
  onReserveZone: (zone: SeatingZone) => void;
  onNavigate: (path: string) => void;
}

const SPACES: {
  zone: SeatingZone;
  subtitle: string;
  capacity: string;
  tableCount: string;
  description: string;
  highlights: string[];
}[] = [
  {
    zone: 'Main Dining Room',
    subtitle: 'White Oak Hearth & Linen Service',
    capacity: 'Up to 6 Guests per Table · 38 Seats Total',
    tableCount: '6 Tables Available per Seating',
    description:
      'Anchored by our brick white-oak hearth and tall steel-framed windows overlooking Jackson Square. Crisp Belgian linen tables, warm brass table lamps, and balanced acoustic cedar ceiling beams.',
    highlights: [
      'Direct sightline to the wood-fired hearth kitchen',
      'ADA step-free entrance and wide table spacing',
      'Full à la carte menu and sommelier cellar pairing',
    ],
  },
  {
    zone: "Chef's Counter",
    subtitle: 'Front-Row Culinary Pass',
    capacity: 'Parties of 1–4 Guests · 8 Marble Seats',
    tableCount: '3 Counter Blocks per Seating',
    description:
      'Intimate honed-limestone counter framing the plating pass. Watch our kitchen team sear sea bass over live coals, finish handmade pasta in butter emulsions, and plate nightly dishes.',
    highlights: [
      'Direct conversation with the culinary and pastry team',
      'Ideal for solo diners, couples, and food enthusiasts',
      'Optional chef-curated 4-course tasting progression',
    ],
  },
  {
    zone: 'Garden Courtyard',
    subtitle: 'Olive-Tree Heated Terrace',
    capacity: 'Up to 8 Guests per Table · 24 Seats Total',
    tableCount: '4 Tables Available per Seating',
    description:
      'A sheltered cobblestone courtyard lined with potted Mission olive trees, overhead radiant brass heaters, and woven wool throws for cool San Francisco evenings.',
    highlights: [
      'Heated open-air canopy operable year-round',
      'Relaxed atmosphere suited for group celebrations',
      'Pet-friendly outer tables upon advance note',
    ],
  },
];

export function DiningAreaPage({ onReserveZone, onNavigate }: DiningAreaPageProps) {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <section className="bg-[#FAFAF8] py-12 lg:py-16">
      <div className="mx-auto max-w-[1280px] px-6">
        <div className="flex flex-col justify-between gap-4 border-b border-[#E5E3DD] pb-8 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-medium text-[#57554F]">
              418 Jackson Street · Three Distinct Dining Environments
            </p>
            <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-[#141413] lg:text-5xl">
              The Dining Area
            </h1>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('/reservations')}
            className="inline-flex items-center gap-2 rounded-md bg-[#1C3B2B] px-5 py-2.5 text-sm font-medium text-[#FAFAF8] hover:bg-[#142B1F] cursor-pointer whitespace-nowrap self-start md:self-auto"
          >
            <span>Book Any Dining Zone</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-10 grid grid-cols-1 items-stretch gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="relative h-72 w-full overflow-hidden rounded-lg border border-[#E5E3DD] bg-[#EAE7DF] sm:h-96 lg:h-full lg:min-h-[380px]">
              {!imgFailed ? (
                <img
                  src={HERO_IMAGE_URL}
                  alt="Arden & Hearth Main Dining Room and open wood-fired kitchen"
                  referrerPolicy="no-referrer"
                  onError={() => setImgFailed(true)}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[#F3F1EC]">
                  <UtensilsCrossed className="h-8 w-8 text-[#1C3B2B]" />
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-lg border border-[#E5E3DD] bg-white p-6 lg:col-span-5 lg:p-8">
            <div>
              <p className="text-xs font-semibold text-[#1C3B2B]">
                Architectural Atmosphere
              </p>
              <h2 className="mt-2 font-display text-3xl font-semibold text-[#141413]">
                Crafted around the glow of white oak embers.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-[#57554F]">
                Every seat at Arden &amp; Hearth was designed for unhurried conversation.
                Warm limestone plaster, dark fumed oak joinery, and acoustic cedar
                baffles keep the room intimate even at full dinner service.
              </p>
            </div>

            <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-[#E5E3DD] pt-5 text-sm">
              <div>
                <dt className="text-xs text-[#737068]">Total Capacity</dt>
                <dd className="mt-1 font-semibold tabular-nums text-[#141413]">
                  70 Seated Guests
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[#737068]">Private Buyouts</dt>
                <dd className="mt-1 font-semibold text-[#141413]">Up to 80 Standing</dd>
              </div>
              <div>
                <dt className="text-xs text-[#737068]">Accessibility</dt>
                <dd className="mt-1 font-semibold text-[#141413]">Full Step-Free Access</dd>
              </div>
              <div>
                <dt className="text-xs text-[#737068]">Dress Guideline</dt>
                <dd className="mt-1 font-semibold text-[#141413]">Smart Casual</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {SPACES.map((space, idx) => (
            <article
              key={space.zone}
              className="flex flex-col justify-between rounded-lg border border-[#E5E3DD] bg-white p-6"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-[#57554F]">
                  <span>0{idx + 1}. {space.subtitle}</span>
                  {space.zone === 'Main Dining Room' && (
                    <Flame className="h-4 w-4 text-[#1C3B2B]" aria-hidden="true" />
                  )}
                  {space.zone === "Chef's Counter" && (
                    <Sparkles className="h-4 w-4 text-[#1C3B2B]" aria-hidden="true" />
                  )}
                  {space.zone === 'Garden Courtyard' && (
                    <Trees className="h-4 w-4 text-[#1C3B2B]" aria-hidden="true" />
                  )}
                </div>

                <h3 className="mt-2 font-display text-3xl font-semibold text-[#141413]">
                  {space.zone}
                </h3>

                <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-[#1C3B2B] tabular-nums">
                  <Users className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{space.capacity}</span>
                </p>

                <p className="mt-4 text-sm leading-relaxed text-[#57554F]">
                  {space.description}
                </p>

                <ul className="mt-5 space-y-2 border-t border-[#F2F0EA] pt-4 text-xs text-[#57554F]">
                  {space.highlights.map((h) => (
                    <li key={h} className="flex items-start gap-2">
                      <span
                        className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#1C3B2B]"
                        aria-hidden="true"
                      />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 border-t border-[#E5E3DD] pt-4">
                <p className="mb-3 text-xs text-[#737068]">{space.tableCount}</p>
                <button
                  type="button"
                  onClick={() => onReserveZone(space.zone)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#1C3B2B] px-4 py-2.5 text-xs font-medium text-[#FAFAF8] transition-colors hover:bg-[#142B1F] cursor-pointer"
                >
                  <span>Reserve {space.zone}</span>
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
