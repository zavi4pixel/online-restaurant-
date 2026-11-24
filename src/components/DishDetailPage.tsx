import { ArrowLeft, ChefHat, Clock, Plus, UtensilsCrossed, Wine } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { MenuItem } from '../types/restaurant.ts';

interface DishDetailPageProps {
  item: MenuItem | undefined;
  relatedItems: MenuItem[];
  onNavigate: (path: string) => void;
  onAddToCart: (
    item: MenuItem,
    selectedOptionIds: string[],
    selectedOptions: { groupLabel: string; choiceLabel: string; priceDelta: number }[],
    specialInstructions: string,
    quantity: number
  ) => void;
}

export function DishDetailPage({
  item,
  relatedItems,
  onNavigate,
  onAddToCart,
}: DishDetailPageProps) {
  const [selectedByGroup, setSelectedByGroup] = useState<Record<string, string>>({});
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    if (!item) return;
    const defaults: Record<string, string> = {};
    item.options?.forEach((group) => {
      if (group.choices[0]) {
        defaults[group.id] = group.choices[0].id;
      }
    });
    setSelectedByGroup(defaults);
    setSpecialInstructions('');
    setQuantity(1);
    setImgFailed(false);
  }, [item]);

  if (!item) {
    return (
      <section className="mx-auto max-w-[1280px] px-6 py-20 text-center">
        <p className="text-xs font-medium text-[#57554F]">Menu Item Unavailable</p>
        <h1 className="mt-2 font-display text-4xl font-semibold text-[#141413]">
          Dish not found
        </h1>
        <p className="mt-3 text-sm text-[#57554F]">
          This seasonal dish may have rotated off tonight&apos;s menu.
        </p>
        <button
          type="button"
          onClick={() => onNavigate('/menu')}
          className="mt-6 inline-flex items-center gap-2 rounded-md bg-[#1C3B2B] px-5 py-2.5 text-sm font-medium text-[#FAFAF8] hover:bg-[#142B1F] cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Return to Seasonal Menu</span>
        </button>
      </section>
    );
  }

  const selectedOptionIds: string[] = [];
  const selectedOptions =
    item.options?.map((group) => {
      const choiceId = selectedByGroup[group.id] ?? group.choices[0]?.id;
      const choice = group.choices.find((c) => c.id === choiceId) ?? group.choices[0];
      selectedOptionIds.push(choice.id);
      return {
        groupLabel: group.label,
        choiceLabel: choice.label,
        priceDelta: choice.priceDelta,
      };
    }) ?? [];

  const unitPrice =
    item.price + selectedOptions.reduce((sum, opt) => sum + opt.priceDelta, 0);
  const lineTotal = unitPrice * quantity;

  return (
    <section className="bg-[#FAFAF8] py-12 lg:py-16">
      <div className="mx-auto max-w-[1280px] px-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E5E3DD] pb-5">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[#57554F]">
            <button
              type="button"
              onClick={() => onNavigate('/')}
              className="hover:text-[#141413] cursor-pointer"
            >
              Home
            </button>
            <span aria-hidden="true">/</span>
            <button
              type="button"
              onClick={() => onNavigate('/menu')}
              className="hover:text-[#141413] cursor-pointer"
            >
              Menu
            </button>
            <span aria-hidden="true">/</span>
            <span>{item.category}</span>
            <span aria-hidden="true">/</span>
            <span className="font-medium text-[#141413]">{item.name}</span>
          </nav>

          <button
            type="button"
            onClick={() => onNavigate('/menu')}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#1C3B2B] hover:underline underline-offset-4 cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Back to Full Menu</span>
          </button>
        </div>

        <div className="mt-10 grid grid-cols-1 items-start gap-10 lg:grid-cols-12">
          <div className="space-y-8 lg:col-span-7">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border border-[#E5E3DD] bg-[#EAE7DF]">
              {item.imageUrl && !imgFailed ? (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  referrerPolicy="no-referrer"
                  onError={() => setImgFailed(true)}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#F3F1EC] to-[#E2DED3] p-8 text-center">
                  <UtensilsCrossed className="h-10 w-10 text-[#1C3B2B] opacity-70" />
                  <p className="mt-3 font-display text-2xl font-semibold text-[#141413]">
                    {item.name}
                  </p>
                </div>
              )}
            </div>

            <div className="rounded-lg border border-[#E5E3DD] bg-white p-6 lg:p-8">
              <h2 className="font-display text-2xl font-semibold text-[#141413]">
                Key Ingredients &amp; Provenance
              </h2>
              <ul className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {item.ingredients.map((ingredient) => (
                  <li
                    key={ingredient}
                    className="flex items-start gap-2.5 border-b border-[#F2F0EA] pb-2 text-sm text-[#57554F]"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#1C3B2B]" aria-hidden="true" />
                    <span>{ingredient}</span>
                  </li>
                ))}
              </ul>

              {item.chefNotes && (
                <div className="mt-6 border-t border-[#E5E3DD] pt-5">
                  <p className="inline-flex items-center gap-2 text-xs font-semibold text-[#141413]">
                    <ChefHat className="h-4 w-4 text-[#1C3B2B]" aria-hidden="true" />
                    <span>Kitchen &amp; Hearth Note</span>
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-[#57554F]">
                    {item.chefNotes}
                  </p>
                </div>
              )}

              {item.pairingNote && (
                <div className="mt-5 border-t border-[#E5E3DD] pt-5">
                  <p className="inline-flex items-center gap-2 text-xs font-semibold text-[#141413]">
                    <Wine className="h-4 w-4 text-[#1C3B2B]" aria-hidden="true" />
                    <span>Cellar Pairing Suggestion</span>
                  </p>
                  <p className="mt-1.5 text-sm text-[#57554F]">{item.pairingNote}</p>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-[#E5E3DD] bg-white p-6 lg:sticky lg:top-24 lg:col-span-5 lg:p-8">
            <p className="text-xs font-medium text-[#57554F]">
              {item.category}
              {item.dietary.length > 0 ? ` · ${item.dietary.join(' · ')}` : ''}
            </p>

            <h1 className="mt-2 font-display text-4xl font-semibold leading-tight text-[#141413] text-balance">
              {item.name}
            </h1>

            <div className="mt-4 flex items-baseline justify-between border-b border-[#E5E3DD] pb-4">
              <span className="tabular-nums text-2xl font-semibold text-[#141413]">
                ${unitPrice.toFixed(2)}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-[#57554F] tabular-nums">
                <Clock className="h-3.5 w-3.5 text-[#1C3B2B]" aria-hidden="true" />
                <span>Prepared in ~{item.prepMinutes} mins</span>
              </span>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-[#57554F]">
              {item.description}
            </p>

            {item.allergens && item.allergens.length > 0 && (
              <p className="mt-3 text-xs text-[#737068]">
                <span className="font-semibold text-[#141413]">Allergens:</span>{' '}
                {item.allergens.join(', ')}
              </p>
            )}

            {item.options && item.options.length > 0 && (
              <div className="mt-6 space-y-4 border-t border-[#E5E3DD] pt-5">
                {item.options.map((group) => (
                  <div key={group.id}>
                    <p className="text-xs font-semibold text-[#141413]">
                      {group.label}
                    </p>
                    <div className="mt-2 space-y-2">
                      {group.choices.map((choice) => {
                        const checked = selectedByGroup[group.id] === choice.id;
                        return (
                          <label
                            key={choice.id}
                            className={`flex cursor-pointer items-center justify-between rounded-md border px-3.5 py-2.5 text-sm transition-colors ${
                              checked
                                ? 'border-[#1C3B2B] bg-[#F5F7F5] text-[#141413]'
                                : 'border-[#E5E3DD] bg-white text-[#57554F] hover:border-[#C5C1B6]'
                            }`}
                          >
                            <span className="flex items-center gap-2.5">
                              <input
                                type="radio"
                                name={`pdp-${group.id}`}
                                value={choice.id}
                                checked={checked}
                                onChange={() =>
                                  setSelectedByGroup((prev) => ({
                                    ...prev,
                                    [group.id]: choice.id,
                                  }))
                                }
                                className="accent-[#1C3B2B]"
                              />
                              <span className="font-medium text-[#141413]">
                                {choice.label}
                              </span>
                            </span>
                            <span className="tabular-nums text-xs font-medium text-[#57554F]">
                              {choice.priceDelta > 0
                                ? `+$${choice.priceDelta.toFixed(2)}`
                                : 'Included'}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-5">
              <label
                htmlFor="pdp-kitchen-notes"
                className="block text-xs font-semibold text-[#141413]"
              >
                Special Kitchen Instructions (Optional)
              </label>
              <textarea
                id="pdp-kitchen-notes"
                rows={2}
                maxLength={140}
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="e.g., Sauce on the side, allergy alert..."
                className="mt-1.5 w-full rounded-md border border-[#D4D1C8] bg-white px-3 py-2 text-sm text-[#141413] placeholder:text-[#8E8B82] focus:border-[#1C3B2B] focus:outline-none"
              />
            </div>

            <div className="mt-6 flex items-center gap-3 border-t border-[#E5E3DD] pt-5">
              <div className="inline-flex items-center rounded-md border border-[#D4D1C8] bg-white">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="px-3.5 py-2.5 text-sm font-medium text-[#141413] hover:bg-[#F3F1EC] cursor-pointer"
                >
                  -
                </button>
                <span className="w-8 text-center text-sm font-semibold tabular-nums">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(20, q + 1))}
                  aria-label="Increase quantity"
                  className="px-3.5 py-2.5 text-sm font-medium text-[#141413] hover:bg-[#F3F1EC] cursor-pointer"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                onClick={() =>
                  onAddToCart(
                    item,
                    selectedOptionIds,
                    selectedOptions,
                    specialInstructions.trim(),
                    quantity
                  )
                }
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-[#1C3B2B] px-5 py-3 text-sm font-medium text-[#FAFAF8] transition-colors hover:bg-[#142B1F] cursor-pointer whitespace-nowrap"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                <span>
                  Add to Bag · <span className="tabular-nums">${lineTotal.toFixed(2)}</span>
                </span>
              </button>
            </div>
          </div>
        </div>

        {relatedItems.length > 0 && (
          <div className="mt-16 border-t border-[#E5E3DD] pt-12">
            <div className="flex items-baseline justify-between">
              <h2 className="font-display text-3xl font-semibold text-[#141413]">
                More from {item.category}
              </h2>
              <button
                type="button"
                onClick={() => onNavigate('/menu')}
                className="text-xs font-medium text-[#1C3B2B] underline underline-offset-4 cursor-pointer"
              >
                View All Dishes
              </button>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedItems.map((rel) => (
                <div
                  key={rel.id}
                  className="group flex flex-col justify-between rounded-lg border border-[#E5E3DD] bg-white transition-transform duration-150 hover:-translate-y-0.5"
                >
                  <div>
                    <button
                      type="button"
                      onClick={() => onNavigate(`/menu/${rel.id}`)}
                      className="block w-full overflow-hidden rounded-t-lg bg-[#EAE7DF] text-left cursor-pointer"
                    >
                      <div className="aspect-[4/3] w-full overflow-hidden">
                        {rel.imageUrl ? (
                          <img
                            src={rel.imageUrl}
                            alt={rel.name}
                            referrerPolicy="no-referrer"
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-[#F3F1EC]">
                            <UtensilsCrossed className="h-6 w-6 text-[#1C3B2B]" />
                          </div>
                        )}
                      </div>
                    </button>

                    <div className="p-5">
                      <p className="text-xs text-[#57554F]">
                        {rel.category} · {rel.prepMinutes} min
                      </p>
                      <button
                        type="button"
                        onClick={() => onNavigate(`/menu/${rel.id}`)}
                        className="mt-1 text-left text-base font-semibold text-[#141413] hover:text-[#1C3B2B] hover:underline underline-offset-4 cursor-pointer"
                      >
                        {rel.name}
                      </button>
                      <p className="mt-2 line-clamp-2 text-sm text-[#57554F]">
                        {rel.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-[#F0EEE8] px-5 py-3.5">
                    <span className="tabular-nums text-[15px] font-semibold text-[#141413]">
                      ${rel.price.toFixed(2)}
                    </span>
                    <button
                      type="button"
                      onClick={() => onNavigate(`/menu/${rel.id}`)}
                      className="text-xs font-medium text-[#1C3B2B] underline underline-offset-4 cursor-pointer"
                    >
                      View Dish Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
