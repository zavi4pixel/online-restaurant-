import { ArrowRight, Award, Flame, Leaf, Users } from 'lucide-react';
import { useState } from 'react';
import { HERO_IMAGE_URL } from '../data/menu.ts';

interface AboutPageProps {
  onNavigate: (path: string) => void;
}

const CULINARY_TEAM = [
  {
    name: 'Chef Julien Moreau',
    role: 'Executive Chef & Co-Founder',
    bio: 'Trained across coastal Brittany and Northern California, Julien leads our white-oak hearth program and whole-animal 14-day dry-aging room.',
  },
  {
    name: 'Elena Vance',
    role: 'Head of Pasta & Pastry',
    bio: 'Crafts daily extruded squid-ink tagliolini, heritage-wheat agnolotti, and seasonal Sonoma Meyer lemon patisserie.',
  },
  {
    name: 'Soren Lindqvist',
    role: 'Wine Director & General Manager',
    bio: 'Curates a 280-bottle coastal cellar prioritizing organic growers in Champagne, Burgundy, Piedmont, and the Sonoma Coast.',
  },
];

export function AboutPage({ onNavigate }: AboutPageProps) {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <section className="bg-[#FAFAF8] py-12 lg:py-16">
      <div className="mx-auto max-w-[1280px] px-6">
        <div className="flex flex-col justify-between gap-4 border-b border-[#E5E3DD] pb-8 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-medium text-[#57554F]">
              Established in Jackson Square · San Francisco
            </p>
            <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-[#141413] lg:text-5xl">
              About Arden &amp; Hearth
            </h1>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-[#57554F]">
            A neighborhood coastal bistro built around live-fire cooking, regenerative
            California farms, and warm, unhurried hospitality.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 items-stretch gap-8 lg:grid-cols-12">
          <div className="flex flex-col justify-between rounded-lg border border-[#E5E3DD] bg-white p-6 lg:col-span-6 lg:p-8">
            <div>
              <p className="text-xs font-semibold text-[#1C3B2B]">Our Philosophy</p>
              <h2 className="mt-2 font-display text-3xl font-semibold text-[#141413]">
                Live fire, coastal restraint, and peak-season ingredients.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-[#57554F]">
                Opened in an 1890s brick timber warehouse on Jackson Street, Arden &amp;
                Hearth was founded on a simple conviction: great coastal food needs little
                ornamentation when the fish is line-caught that morning and cooked over
                seasoned white oak.
              </p>
              <p className="mt-4 text-sm leading-relaxed text-[#57554F]">
                Our menu shifts weekly alongside Half Moon Bay fishermen, Tomales Bay
                oyster growers, and Sonoma dry-farmed orchards. Whether seated at our
                marble Chef&apos;s Counter or ordering dinner home with live kitchen
                tracking, every plate receives the same precision.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-3 border-t border-[#E5E3DD] pt-6">
              <button
                type="button"
                onClick={() => onNavigate('/menu')}
                className="inline-flex items-center gap-2 rounded-md bg-[#1C3B2B] px-5 py-2.5 text-xs font-medium text-[#FAFAF8] hover:bg-[#142B1F] cursor-pointer"
              >
                <span>Explore Seasonal Menu</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => onNavigate('/dining-area')}
                className="inline-flex items-center gap-2 rounded-md border border-[#D4D1C8] bg-white px-5 py-2.5 text-xs font-medium text-[#141413] hover:bg-[#F3F1EC] cursor-pointer"
              >
                <span>Tour the Dining Area</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative h-72 w-full overflow-hidden rounded-lg border border-[#E5E3DD] bg-[#EAE7DF] sm:h-96 lg:h-full">
              {!imgFailed ? (
                <img
                  src={HERO_IMAGE_URL}
                  alt="Chefs cooking at the open white-oak hearth kitchen at Arden & Hearth"
                  referrerPolicy="no-referrer"
                  onError={() => setImgFailed(true)}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[#F3F1EC] text-sm text-[#57554F]">
                  Arden &amp; Hearth Kitchen
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-lg border border-[#E5E3DD] bg-white p-6">
            <Flame className="h-5 w-5 text-[#1C3B2B]" aria-hidden="true" />
            <h3 className="mt-3 font-display text-2xl font-semibold text-[#141413]">
              Seasoned White Oak &amp; Almond
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[#57554F]">
              Zero gas burners touch our hearth proteins. We burn sustainably pruned
              California almond and white oak split 18 months in advance for clean ember
              heat.
            </p>
          </div>
          <div className="rounded-lg border border-[#E5E3DD] bg-white p-6">
            <Leaf className="h-5 w-5 text-[#1C3B2B]" aria-hidden="true" />
            <h3 className="mt-3 font-display text-2xl font-semibold text-[#141413]">
              Direct Boat &amp; Farm Sourcing
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[#57554F]">
              92% of our produce and seafood arrives within 90 miles of Jackson Street,
              spanning Tomales Bay shellfish beds, Marin Sun pastures, and Mendocino
              foragers.
            </p>
          </div>
          <div className="rounded-lg border border-[#E5E3DD] bg-white p-6">
            <Award className="h-5 w-5 text-[#1C3B2B]" aria-hidden="true" />
            <h3 className="mt-3 font-display text-2xl font-semibold text-[#141413]">
              Zero-Waste Dry Aging
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[#57554F]">
              Our in-house aging room matures duck crowns for 14 days and prime bavette
              for 35 days, while trimmings enrich every nightly jus and bone marrow
              emulsion.
            </p>
          </div>
        </div>

        <div className="mt-12 rounded-lg border border-[#E5E3DD] bg-white p-6 lg:p-8">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#1C3B2B]">
            <Users className="h-4 w-4" aria-hidden="true" />
            <span>Leadership &amp; Kitchen Team</span>
          </div>
          <h2 className="mt-2 font-display text-3xl font-semibold text-[#141413]">
            The People Behind the Pass
          </h2>

          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
            {CULINARY_TEAM.map((member) => (
              <div
                key={member.name}
                className="border-t border-[#E5E3DD] pt-4"
              >
                <h3 className="text-base font-semibold text-[#141413]">{member.name}</h3>
                <p className="mt-0.5 text-xs font-medium text-[#1C3B2B]">
                  {member.role}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-[#57554F]">
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
