import { ArrowRight, Plus, Search, SlidersHorizontal, UtensilsCrossed } from 'lucide-react';
import { useMemo, useState } from 'react';
import { MENU_CATEGORIES } from '../data/menu.ts';
import type { CartItem, DietaryTag, MenuCategory, MenuItem } from '../types/restaurant.ts';

interface MenuSectionProps {
  items: MenuItem[];
  cart: CartItem[];
  onQuickAdd: (item: MenuItem) => void;
  onCustomize: (item: MenuItem) => void;
  onSelectDish: (itemId: string) => void;
}

export function MenuSection({
  items,
  cart,
  onQuickAdd,
  onCustomize,
  onSelectDish,
}: MenuSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<'All' | MenuCategory>('All');
  const [selectedDietary, setSelectedDietary] = useState<'All' | DietaryTag>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});

  const filteredDishes = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return items.filter((item) => {
      if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
      if (selectedDietary !== 'All' && !item.dietary.includes(selectedDietary)) return false;
      if (
        query &&
        !item.name.toLowerCase().includes(query) &&
        !item.description.toLowerCase().includes(query) &&
        !item.ingredients.some((ing) => ing.toLowerCase().includes(query))
      ) {
        return false;
      }
      return true;
    });
  }, [items, selectedCategory, selectedDietary, searchQuery]);

  const getItemQtyInBag = (menuItemId: string) =>
    cart
      .filter((c) => c.menuItemId === menuItemId)
      .reduce((sum, c) => sum + c.quantity, 0);

  return (
    <section className="bg-[#FAFAF8] py-12 lg:py-16">
      <div className="mx-auto max-w-[1280px] px-6">
        <div className="flex flex-col justify-between gap-4 border-b border-[#E5E3DD] pb-8 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-medium text-[#57554F]">
              Autumn &amp; Winter Harvest · Prepared to Order
            </p>
            <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-[#141413] lg:text-5xl">
              Seasonal Menu &amp; Online Ordering
            </h1>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-[#57554F]">
            Click any dish photo or title to open its full culinary page with
            ingredients, allergens, and cellar pairings, or add directly to your order
            bag.
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-4 border-b border-[#E5E3DD] pb-5 lg:flex-row lg:items-center lg:justify-between">
          <div
            role="tablist"
            aria-label="Menu Categories"
            className="flex flex-wrap items-center gap-1 rounded-lg bg-[#F3F1EC] p-1"
          >
            {(['All', ...MENU_CATEGORIES] as const).map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  role="tab"
                  type="button"
                  aria-selected={active}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-md px-3.5 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-white text-[#141413] shadow-xs'
                      : 'text-[#57554F] hover:text-[#141413]'
                  }`}
                >
                  {cat === 'All' ? 'All Dishes' : cat}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 rounded-lg bg-[#F3F1EC] p-1">
              {(['All', 'Gluten-Free', 'Vegetarian'] as const).map((diet) => {
                const active = selectedDietary === diet;
                return (
                  <button
                    key={diet}
                    type="button"
                    onClick={() => setSelectedDietary(diet)}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      active
                        ? 'bg-white text-[#1C3B2B] shadow-xs'
                        : 'text-[#57554F] hover:text-[#141413]'
                    }`}
                  >
                    {diet === 'All' ? 'Any Dietary' : diet}
                  </button>
                );
              })}
            </div>

            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#737068]"
                aria-hidden="true"
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search dishes or ingredients..."
                aria-label="Search menu items"
                className="w-60 rounded-md border border-[#D4D1C8] bg-white py-2 pl-8 pr-3 text-xs text-[#141413] placeholder:text-[#8E8B82] focus:border-[#1C3B2B] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {filteredDishes.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm font-medium text-[#141413]">
              No dishes match your active filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('All');
                setSelectedDietary('All');
                setSearchQuery('');
              }}
              className="mt-3 text-xs font-medium text-[#1C3B2B] underline underline-offset-4 cursor-pointer"
            >
              Reset menu filters
            </button>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredDishes.map((item) => {
              const qtyInBag = getItemQtyInBag(item.id);
              const imgFailed = brokenImages[item.id];
              return (
                <article
                  key={item.id}
                  className="group flex flex-col justify-between rounded-lg border border-[#E5E3DD] bg-white transition-transform duration-150 hover:-translate-y-0.5"
                >
                  <div>
                    <button
                      type="button"
                      onClick={() => onSelectDish(item.id)}
                      aria-label={`Open ${item.name} details page`}
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
                            <UtensilsCrossed className="h-7 w-7 text-[#1C3B2B] opacity-70" />
                            <p className="mt-2 text-xs font-medium text-[#57554F]">
                              {item.name}
                            </p>
                          </div>
                        )}
                      </div>
                    </button>

                    <div className="p-5 pb-4">
                      <p className="text-xs text-[#57554F]">
                        {item.category}
                        {item.dietary.length > 0 ? ` · ${item.dietary.join(' · ')}` : ''}
                        {` · ${item.prepMinutes}m`}
                      </p>

                      <button
                        type="button"
                        onClick={() => onSelectDish(item.id)}
                        className="mt-1.5 block text-left text-lg font-semibold leading-snug text-[#141413] hover:text-[#1C3B2B] hover:underline underline-offset-4 cursor-pointer"
                      >
                        {item.name}
                      </button>

                      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[#57554F]">
                        {item.description}
                      </p>

                      <button
                        type="button"
                        onClick={() => onSelectDish(item.id)}
                        className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-[#1C3B2B] hover:underline underline-offset-4 cursor-pointer"
                      >
                        <span>Ingredients &amp; Details</span>
                        <ArrowRight className="h-3 w-3" aria-hidden="true" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-[#F0EEE8] px-5 py-3.5">
                    <span className="tabular-nums text-[15px] font-semibold text-[#141413]">
                      ${item.price.toFixed(2)}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onCustomize(item)}
                        title="Customize options or add kitchen notes"
                        aria-label={`Customize ${item.name}`}
                        className="rounded-md border border-[#D4D1C8] bg-white p-1.5 text-[#57554F] transition-colors hover:border-[#141413] hover:text-[#141413] cursor-pointer"
                      >
                        <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onQuickAdd(item)}
                        className="inline-flex items-center gap-1 rounded-md bg-[#1C3B2B] px-3 py-1.5 text-xs font-medium text-[#FAFAF8] transition-colors hover:bg-[#142B1F] cursor-pointer whitespace-nowrap"
                      >
                        <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>{qtyInBag > 0 ? `Add (${qtyInBag})` : 'Add'}</span>
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
