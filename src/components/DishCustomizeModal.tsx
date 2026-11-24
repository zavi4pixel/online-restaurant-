import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { MenuItem } from '../types/restaurant.ts';

interface DishCustomizeModalProps {
  item: MenuItem | null;
  onClose: () => void;
  onConfirmAdd: (
    item: MenuItem,
    selectedOptionIds: string[],
    selectedOptions: { groupLabel: string; choiceLabel: string; priceDelta: number }[],
    specialInstructions: string,
    quantity: number
  ) => void;
}

export function DishCustomizeModal({
  item,
  onClose,
  onConfirmAdd,
}: DishCustomizeModalProps) {
  const [selectedByGroup, setSelectedByGroup] = useState<Record<string, string>>({});
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [quantity, setQuantity] = useState(1);

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
  }, [item]);

  useEffect(() => {
    if (!item) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [item, onClose]);

  if (!item) return null;

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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="customize-dish-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg rounded-lg border border-[#E5E3DD] bg-[#FAFAF8] p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b border-[#E5E3DD] pb-4">
          <div>
            <p className="text-xs font-medium text-[#57554F]">
              {item.category} · {item.prepMinutes} min prep
            </p>
            <h3
              id="customize-dish-title"
              className="mt-1 font-display text-2xl font-semibold text-[#141413]"
            >
              {item.name}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dish customization"
            className="rounded-md p-1.5 text-[#57554F] hover:bg-[#EAE7DF] hover:text-[#141413] cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-[#57554F]">{item.description}</p>

        {item.options && item.options.length > 0 && (
          <div className="mt-5 space-y-4">
            {item.options.map((group) => (
              <div key={group.id}>
                <p className="text-xs font-semibold tracking-wide text-[#141413]">
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
                            ? 'border-[#1C3B2B] bg-white text-[#141413]'
                            : 'border-[#E5E3DD] bg-white/70 text-[#57554F] hover:border-[#C5C1B6]'
                        }`}
                      >
                        <span className="flex items-center gap-2.5">
                          <input
                            type="radio"
                            name={group.id}
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
                          <span className="font-medium text-[#141413]">{choice.label}</span>
                        </span>
                        <span className="tabular-nums text-xs font-medium text-[#57554F]">
                          {choice.priceDelta > 0 ? `+$${choice.priceDelta.toFixed(2)}` : 'Included'}
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
            htmlFor="dish-special-notes"
            className="block text-xs font-semibold text-[#141413]"
          >
            Kitchen Notes (Allergies or Preferences)
          </label>
          <textarea
            id="dish-special-notes"
            rows={2}
            maxLength={140}
            value={specialInstructions}
            onChange={(e) => setSpecialInstructions(e.target.value)}
            placeholder="e.g., Sauce on the side, no shallots..."
            className="mt-1.5 w-full rounded-md border border-[#D4D1C8] bg-white px-3 py-2 text-sm text-[#141413] placeholder:text-[#8E8B82] focus:border-[#1C3B2B] focus:outline-none"
          />
        </div>

        <div className="mt-6 flex items-center justify-between gap-4 border-t border-[#E5E3DD] pt-4">
          <div className="inline-flex items-center rounded-md border border-[#D4D1C8] bg-white">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              aria-label="Decrease quantity"
              className="px-3 py-2 text-sm font-medium text-[#141413] hover:bg-[#F3F1EC] cursor-pointer"
            >
              -
            </button>
            <span className="w-8 text-center text-sm font-semibold tabular-nums text-[#141413]">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(20, q + 1))}
              aria-label="Increase quantity"
              className="px-3 py-2 text-sm font-medium text-[#141413] hover:bg-[#F3F1EC] cursor-pointer"
            >
              +
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              onConfirmAdd(
                item,
                selectedOptionIds,
                selectedOptions,
                specialInstructions.trim(),
                quantity
              );
              onClose();
            }}
            className="flex-1 rounded-md bg-[#1C3B2B] px-5 py-2.5 text-sm font-medium text-[#FAFAF8] transition-colors hover:bg-[#142B1F] cursor-pointer whitespace-nowrap"
          >
            Add to Order · <span className="tabular-nums">${lineTotal.toFixed(2)}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
